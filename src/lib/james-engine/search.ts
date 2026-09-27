import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import { bookMove } from "./book";
import { evaluate } from "./eval";
import {
  MODE_MS,
  PACKED_ENTRY_BYTES,
  TT_MASK,
  TT_SIZE,
  type EngineMove,
  type Genome,
  type JamesStats,
  type RootLine,
  type ThinkMode,
  type ThinkProgress,
} from "./types";

const MATE = 30000;
const MATE_GATE = 20000;
const INF = 32000;

const VICTIM: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

type TTFlag = 0 | 1 | 2 | 3; // empty, exact, alpha, beta

const ttVerify = new Uint32Array(TT_SIZE);
const ttMove = new Uint16Array(TT_SIZE);
const ttScore = new Int16Array(TT_SIZE);
const ttDepth = new Int8Array(TT_SIZE);
const ttFlag = new Uint8Array(TT_SIZE);

let ttUsed = 0;

const killerA = new Uint16Array(128);
const killerB = new Uint16Array(128);
const history = new Int16Array(64 * 64);

let nodes = 0;
let seldepth = 0;
let stopped = false;
let deadline = 0;
let firstCyclePly: number | null = null;
let maxUniquePly = 0;
let cycles = 0;
let unique = 0;
const cyclePlySet = new Set<number>();
let genome: Genome;
let rootFen = "";

function splitHash(hex: string): { index: number; verify: number } {
  let n = 0n;
  try {
    n = BigInt("0x" + hex);
  } catch {
    n = 1n;
  }
  const lo = Number(n & 0xffffffffn) >>> 0;
  const hi = Number((n >> 32n) & 0xffffffffn) >>> 0;
  return { index: hi & TT_MASK, verify: lo || 1 };
}

function packMove(m: Move): number {
  const from = sqIndex(m.from);
  const to = sqIndex(m.to);
  const promo = m.promotion ? { n: 1, b: 2, r: 3, q: 4, p: 0, k: 0 }[m.promotion] : 0;
  return from | (to << 6) | ((promo ?? 0) << 12);
}

function unpackMove(packed: number): { from: Square; to: Square; promotion?: PieceSymbol } {
  const from = sqName(packed & 63);
  const to = sqName((packed >> 6) & 63);
  const p = (packed >> 12) & 7;
  const promotion = p === 1 ? "n" : p === 2 ? "b" : p === 3 ? "r" : p === 4 ? "q" : undefined;
  return promotion ? { from, to, promotion } : { from, to };
}

function sqIndex(sq: string): number {
  return sq.charCodeAt(0) - 97 + (sq.charCodeAt(1) - 49) * 8;
}

function sqName(i: number): Square {
  return (String.fromCharCode(97 + (i & 7)) + String((i >> 3) + 1)) as Square;
}

function toEngineMove(m: Move): EngineMove {
  return m.promotion
    ? { from: m.from, to: m.to, promotion: m.promotion, san: m.san }
    : { from: m.from, to: m.to, san: m.san };
}

function mateFromScore(score: number): number | null {
  if (score > MATE_GATE) return Math.round((MATE - score) / 2) + 1;
  if (score < -MATE_GATE) return -Math.round((MATE + score) / 2) - 1;
  return null;
}

function ttStore(hex: string, depth: number, ply: number, score: number, flag: TTFlag, move: number) {
  const { index, verify } = splitHash(hex);
  if (ttFlag[index] === 0) ttUsed++;
  else if ((ttDepth[index] ?? 0) > depth) return;
  let stored = score;
  if (score > MATE_GATE) stored = score + ply;
  else if (score < -MATE_GATE) stored = score - ply;
  if (stored > 32767) stored = 32767;
  if (stored < -32768) stored = -32768;
  ttVerify[index] = verify;
  ttDepth[index] = depth;
  ttScore[index] = stored;
  ttFlag[index] = flag;
  if (move) ttMove[index] = move;
}

function ttProbe(hex: string, ply: number) {
  const { index, verify } = splitHash(hex);
  if (ttFlag[index] === 0 || ttVerify[index] !== verify) return null;
  let score = ttScore[index]!;
  if (score > MATE_GATE) score -= ply;
  else if (score < -MATE_GATE) score += ply;
  return { depth: ttDepth[index]!, score, flag: ttFlag[index] as TTFlag, move: ttMove[index]! };
}

function orderMoves(moves: Move[], ttPacked: number, ply: number) {
  const scores = new Int32Array(moves.length);
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i]!;
    const packed = packMove(m);
    let s = 0;
    if (packed === ttPacked && ttPacked) s = 1_000_000;
    else if (m.captured) s = 100_000 + (VICTIM[m.captured] ?? 0) * 10 - (VICTIM[m.piece] ?? 0);
    else if (m.promotion) s = 90_000 + (VICTIM[m.promotion] ?? 0);
    else if (packed === killerA[ply]) s = 80_000;
    else if (packed === killerB[ply]) s = 70_000;
    else s = history[(sqIndex(m.from) << 6) | sqIndex(m.to)] ?? 0;
    scores[i] = s;
  }
  for (let i = 1; i < moves.length; i++) {
    const m = moves[i]!;
    const sc = scores[i]!;
    let j = i - 1;
    while (j >= 0 && scores[j]! < sc) {
      moves[j + 1] = moves[j]!;
      scores[j + 1] = scores[j]!;
      j--;
    }
    moves[j + 1] = m;
    scores[j + 1] = sc;
  }
}

function checkTime() {
  if (nodes & 2047) return;
  if (stopped || performance.now() >= deadline) stopped = true;
}

function qsearch(chess: Chess, alpha: number, beta: number, ply: number): number {
  checkTime();
  if (stopped) return 0;
  if (ply > seldepth) seldepth = ply;
  nodes++;

  const stand = evaluate(chess, genome);
  if (stand >= beta) return stand;
  if (stand > alpha) alpha = stand;
  if (ply >= 64) return stand;

  const moves = chess.moves({ verbose: true }).filter((m) => m.captured || m.promotion);
  orderMoves(moves, 0, ply);
  for (const m of moves) {
    if (!m.captured && !m.promotion) continue;
    if (m.captured && stand + (VICTIM[m.captured] ?? 0) + 60 < alpha) continue;
    chess.move(m);
    const score = -qsearch(chess, -beta, -alpha, ply + 1);
    chess.undo();
    if (stopped) return 0;
    if (score >= beta) return score;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function search(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
  _allowNull: boolean,
): number {
  checkTime();
  if (stopped) return 0;
  if (ply > seldepth) seldepth = ply;
  nodes++;

  if (ply > 0 && chess.isThreefoldRepetition()) return 0;
  if (ply > 0 && chess.isDrawByFiftyMoves()) return 0;

  const hex = chess.hash();
  const probed = ttProbe(hex, ply);
  if (probed) {
    cycles++;
    if (firstCyclePly === null) firstCyclePly = ply;
    cyclePlySet.add(ply);
    if (probed.depth >= depth && ply > 0) {
      if (probed.flag === 1) return probed.score;
      if (probed.flag === 2 && probed.score <= alpha) return probed.score;
      if (probed.flag === 3 && probed.score >= beta) return probed.score;
    }
  } else {
    unique++;
    if (ply > maxUniquePly) maxUniquePly = ply;
  }

  const inCheck = chess.isCheck();
  let effective = depth;
  if (inCheck) effective++;

  if (effective <= 0) return qsearch(chess, alpha, beta, ply);

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return inCheck ? -MATE + ply : 0;
  }

  orderMoves(moves, probed?.move ?? 0, ply);

  let best = -INF;
  let bestPacked = 0;
  let flag: TTFlag = 2;
  let legal = 0;

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i]!;
    const packed = packMove(m);
    chess.move(m);
    legal++;
    let score: number;
    const givesCheck = chess.isCheck();
    let newDepth = effective - 1;
    if (i > 3 && newDepth >= 3 && !m.captured && !m.promotion && !inCheck && !givesCheck) {
      const r = 1 + (i > 8 ? 1 : 0);
      score = -search(chess, newDepth - r, -alpha - 1, -alpha, ply + 1, true);
      if (score > alpha) score = -search(chess, newDepth, -beta, -alpha, ply + 1, true);
    } else if (i === 0) {
      score = -search(chess, newDepth, -beta, -alpha, ply + 1, true);
    } else {
      score = -search(chess, newDepth, -alpha - 1, -alpha, ply + 1, true);
      if (score > alpha && score < beta) {
        score = -search(chess, newDepth, -beta, -alpha, ply + 1, true);
      }
    }
    chess.undo();
    if (stopped) return 0;
    if (score > best) {
      best = score;
      bestPacked = packed;
    }
    if (score > alpha) {
      alpha = score;
      flag = 1;
    }
    if (alpha >= beta) {
      flag = 3;
      if (!m.captured) {
        killerB[ply] = killerA[ply]!;
        killerA[ply] = packed;
        const h = (sqIndex(m.from) << 6) | sqIndex(m.to);
        history[h] = Math.min(10000, (history[h] ?? 0) + depth * depth);
      }
      break;
    }
  }

  if (legal === 0) return inCheck ? -MATE + ply : 0;
  ttStore(hex, depth, ply, best, flag, bestPacked);
  return best;
}

function collectPv(startFen: string, max = 24): string[] {
  const c = new Chess(startFen);
  const pv: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < max; i++) {
    const hex = c.hash();
    if (seen.has(hex)) break;
    seen.add(hex);
    const p = ttProbe(hex, i);
    if (!p || !p.move) break;
    const u = unpackMove(p.move);
    try {
      const mv = c.move(u);
      pv.push(mv.san);
    } catch {
      break;
    }
    if (c.isGameOver()) break;
  }
  return pv;
}

function greedyPick(chess: Chess): Move | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  let best = moves[0]!;
  let bestS = -1e9;
  for (const m of moves) {
    let s = 0;
    if (m.captured) s += 400 + (VICTIM[m.captured] ?? 0) - (VICTIM[m.piece] ?? 0) * 0.1;
    if (m.promotion) s += 800;
    if (m.san.includes("+")) s += 90;
    const to = sqIndex(m.to);
    const center = Math.abs((to & 7) - 3.5) + Math.abs((to >> 3) - 3.5);
    s += 12 - center * 3;
    if (s > bestS) {
      bestS = s;
      best = m;
    }
  }
  return best;
}

function projectLineage(fen: string, pv: string[]): { line: string[]; end: ThinkProgress["lineageEnd"] } {
  const c = new Chess(fen);
  const line: string[] = [];
  const seen = new Set<string>();
  seen.add(c.hash());
  for (const san of pv) {
    try {
      c.move(san);
      line.push(san);
      const h = c.hash();
      if (seen.has(h)) return { line, end: "cycle" };
      seen.add(h);
    } catch {
      break;
    }
  }
  for (let i = 0; i < 96; i++) {
    if (c.isCheckmate()) return { line, end: "mate" };
    if (c.isDraw() || c.isGameOver()) return { line, end: "draw" };
    const m = greedyPick(c);
    if (!m) return { line, end: "draw" };
    c.move(m);
    line.push(m.san);
    const h = c.hash();
    if (seen.has(h)) return { line, end: "cycle" };
    seen.add(h);
  }
  return { line, end: "horizon" };
}

function jamesStats(): JamesStats {
  const H = [...cyclePlySet].sort((a, b) => a - b).slice(0, 24);
  return {
    J: firstCyclePly,
    R: maxUniquePly,
    H,
    cycles,
    unique,
    ttUsed,
    ttSize: TT_SIZE,
    packedBytes: ttUsed * PACKED_ENTRY_BYTES,
  };
}

function snapshot(
  chess: Chess,
  depth: number,
  score: number,
  best: EngineMove | null,
  lines: RootLine[],
  start: number,
  sure: boolean,
  pvOverride?: string[],
): ThinkProgress {
  const pv = pvOverride ?? collectPv(rootFen, 28);
  const lineage = projectLineage(rootFen, pv);
  return {
    depth,
    seldepth,
    nodes,
    nps: Math.round(nodes / Math.max(0.001, (performance.now() - start) / 1000)),
    timeMs: Math.round(performance.now() - start),
    score,
    mate: mateFromScore(score),
    pv,
    bestMove: best,
    lines,
    james: jamesStats(),
    sure,
    lineage: lineage.line,
    lineageEnd: lineage.end,
  };
}

export function clearTables() {
  ttVerify.fill(0);
  ttMove.fill(0);
  ttScore.fill(0);
  ttDepth.fill(0);
  ttFlag.fill(0);
  ttUsed = 0;
  killerA.fill(0);
  killerB.fill(0);
  history.fill(0);
}

export function requestStop() {
  stopped = true;
}

export function think(fen: string, mode: ThinkMode, g: Genome, onProgress: (p: ThinkProgress) => void): ThinkProgress {
  genome = g;
  rootFen = fen;
  stopped = false;
  nodes = 0;
  seldepth = 0;
  firstCyclePly = null;
  maxUniquePly = 0;
  cycles = 0;
  unique = 0;
  cyclePlySet.clear();

  const chess = new Chess(fen);
  const start = performance.now();
  const cfg = MODE_MS[mode];
  deadline = start + cfg.max;

  const book = bookMove(fen);
  if (book) {
    try {
      const mv = chess.move(book);
      const em = toEngineMove(mv);
      const data = snapshot(chess, 0, 18, em, [{ san: mv.san, move: em, score: 18, mate: null }], start, true, [mv.san]);
      data.pv = [mv.san];
      onProgress(data);
      return data;
    } catch {
      chess.load(fen);
    }
  }

  const maxDepth = mode === "flash" ? 6 : mode === "standard" ? 12 : 48;
  let bestMove: EngineMove | null = null;
  let bestScore = 0;
  let lastScores: number[] = [];
  let lastProgress = start;
  let lines: RootLine[] = [];

  for (let depth = 1; depth <= maxDepth; depth++) {
    if (stopped) break;
    const elapsed = performance.now() - start;
    if (elapsed >= cfg.max && depth > 1) break;
    if (mode !== "sure" && elapsed >= cfg.max && depth > 1) break;

    const score = search(chess, depth, -INF, INF, 0, false);
    if (stopped && depth > 1) break;

    const hex = chess.hash();
    const probe = ttProbe(hex, 0);
    if (probe?.move) {
      const u = unpackMove(probe.move);
      try {
        const tmp = new Chess(fen);
        const mv = tmp.move(u);
        bestMove = toEngineMove(mv);
      } catch {
        /* keep previous */
      }
    }
    if (!bestMove) {
      const ms = chess.moves({ verbose: true });
      if (ms[0]) bestMove = toEngineMove(ms[0]);
    }
    bestScore = score;
    lastScores.push(score);
    if (lastScores.length > 4) lastScores = lastScores.slice(-4);

    const rootMoves = chess.moves({ verbose: true });
    lines = [];
    if (bestMove) {
      lines.push({
        san: bestMove.san,
        move: bestMove,
        score,
        mate: mateFromScore(score),
      });
    }
    for (const m of rootMoves.slice(0, 8)) {
      if (bestMove && m.san === bestMove.san) continue;
      lines.push({
        san: m.san,
        move: toEngineMove(m),
        score: 0,
        mate: null,
      });
      if (lines.length >= 5) break;
    }

    let sure = Math.abs(score) > MATE_GATE;
    if (mode === "sure" && depth >= 5 && elapsed >= cfg.min) {
      const tail = lastScores.slice(-3);
      if (tail.length === 3 && tail.every((s) => Math.abs(s - tail[0]!) < 22)) sure = true;
    }

    const snap = snapshot(chess, depth, score, bestMove, lines, start, sure);
    if (performance.now() - lastProgress > 40 || sure || depth <= 3) {
      onProgress(snap);
      lastProgress = performance.now();
    }

    if (Math.abs(score) > MATE_GATE) return { ...snap, sure: true };
    if (mode === "sure" && sure && elapsed >= cfg.min) return snap;
    if (mode !== "sure" && elapsed >= cfg.max && depth >= 2) return { ...snap, sure: true };
    if (mode !== "sure" && elapsed >= cfg.min && depth >= (mode === "flash" ? 3 : 5)) {
      /* keep iterating until max, but report not-final until the last loop */
    }
  }

  return snapshot(chess, lastScores.length, bestScore, bestMove, lines, start, true);
}
