import { Chess } from "chess.js";
import { clearTables, think } from "./search";
import type { Genome } from "./types";

export type SelfPlayResult = "1-0" | "0-1" | "1/2-1/2";

export type SelfPlayGame = {
  whiteId: string;
  blackId: string;
  result: SelfPlayResult;
  /** UCI moves. The server replays and re-derives the result from these. */
  moves: string[];
  plies: number;
  reason: "mate" | "draw" | "adjudicated" | "maxplies";
};

export type SelfPlayConfig = {
  moveMs: number;
  maxPlies: number;
  contempt: number;
  /** Stop once one side stays past this eval for `adjudicatePlies` in a row. */
  adjudicateCp: number;
  adjudicatePlies: number;
};

export const DEFAULT_SELFPLAY: SelfPlayConfig = {
  moveMs: 40,
  maxPlies: 180,
  contempt: 35,
  adjudicateCp: 900,
  adjudicatePlies: 6,
};

/** Random 2–4 ply opening so self-play games explore instead of repeating. */
function randomOpening(chess: Chess) {
  const plies = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < plies; i++) {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return;
    chess.move(moves[Math.floor(Math.random() * moves.length)]!);
  }
}

export function playSelfGame(
  white: { id: string; genome: Genome },
  black: { id: string; genome: Genome },
  cfg: SelfPlayConfig = DEFAULT_SELFPLAY,
): SelfPlayGame {
  const chess = new Chess();
  clearTables();
  randomOpening(chess);
  let whiteAhead = 0;
  let blackAhead = 0;
  let reason: SelfPlayGame["reason"] = "maxplies";
  let result: SelfPlayResult = "1/2-1/2";

  while (chess.history().length < cfg.maxPlies) {
    if (chess.isGameOver()) break;
    const side = chess.turn();
    const genome = side === "w" ? white.genome : black.genome;
    const res = think(chess.fen(), "standard", genome, () => {}, {
      minMs: cfg.moveMs,
      maxMs: cfg.moveMs,
      stopOnStable: false,
      allowBook: false,
      maxDepth: 32,
      contempt: cfg.contempt,
      lite: true,
    });
    const best = res.bestMove;
    if (!best) break;
    chess.move({ from: best.from, to: best.to, promotion: best.promotion });

    const whiteScore = side === "w" ? res.score : -res.score;
    whiteAhead = whiteScore >= cfg.adjudicateCp ? whiteAhead + 1 : 0;
    blackAhead = whiteScore <= -cfg.adjudicateCp ? blackAhead + 1 : 0;
    if (whiteAhead >= cfg.adjudicatePlies) {
      result = "1-0";
      reason = "adjudicated";
      break;
    }
    if (blackAhead >= cfg.adjudicatePlies) {
      result = "0-1";
      reason = "adjudicated";
      break;
    }
  }

  if (chess.isCheckmate()) {
    result = chess.turn() === "w" ? "0-1" : "1-0";
    reason = "mate";
  } else if (chess.isDraw() || chess.isStalemate()) {
    result = "1/2-1/2";
    reason = "draw";
  }

  const moves = chess.history({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ""));
  return { whiteId: white.id, blackId: black.id, result, moves, plies: moves.length, reason };
}
