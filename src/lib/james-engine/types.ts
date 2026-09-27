import type { PieceSymbol, Square } from "chess.js";

export type ThinkMode = "flash" | "standard" | "deep" | "sure";

export type EngineMove = {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  san: string;
};

export type RootLine = {
  san: string;
  move: EngineMove;
  score: number;
  mate: number | null;
};

export type JamesStats = {
  /** Earliest ply a transposition cycle appeared. */
  J: number | null;
  /** Latest unique-path ply before a cycle (Robinson delay). */
  R: number;
  /** Ply values at which cycles occurred (Hawthorne spectrum sample). */
  H: number[];
  cycles: number;
  unique: number;
  ttUsed: number;
  ttSize: number;
  packedBytes: number;
};

export type ThinkProgress = {
  depth: number;
  seldepth: number;
  nodes: number;
  nps: number;
  timeMs: number;
  score: number;
  mate: number | null;
  pv: string[];
  bestMove: EngineMove | null;
  lines: RootLine[];
  james: JamesStats;
  sure: boolean;
  lineage: string[];
  lineageEnd: "cycle" | "mate" | "draw" | "horizon" | null;
};

/** A move the hive has learned from its stored games for a given position. */
export type LearnedMove = {
  /** UCI, e.g. "e2e4" or "e7e8q". */
  move: string;
  plays: number;
  /** Average points for the side to move (0..1). */
  rate: number;
};

export type ThinkOptions = {
  /** Fixed minimum search time in milliseconds. */
  minMs?: number;
  /** Fixed maximum search time in milliseconds. */
  maxMs?: number;
  /** When false, never stop merely because evaluations stabilized. */
  stopOnStable?: boolean;
  /** When false, bypass the opening book and force competitive search. */
  allowBook?: boolean;
  /** Explicit depth ceiling for a level. */
  maxDepth?: number;
  /** Centipawns a draw costs the side to move at the root — drives it to play for a win. */
  contempt?: number;
  /** Learned root moves from the hive's compressed game tree. */
  learned?: LearnedMove[];
  /** Skip lineage projection and throttle progress (self-play speed). */
  lite?: boolean;
};

export type ThinkRequest = {
  fen: string;
  mode: ThinkMode;
  genome: Genome;
  options?: ThinkOptions;
};

export type WorkerIn =
  | { type: "think"; req: ThinkRequest; id?: number }
  | { type: "stop" }
  | { type: "newGame" }
  | { type: "setGenome"; genome: Genome };

export type WorkerOut =
  | { type: "progress"; data: ThinkProgress; id?: number }
  | { type: "bestmove"; data: ThinkProgress; id?: number }
  | { type: "ready" };

export type GenomeTerms = {
  mobility: number;
  bishopPair: number;
  kingSafety: number;
  passedPawn: number;
  isolatedPawn: number;
  doubledPawn: number;
  tempo: number;
};

export type Genome = {
  generation: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  /** PST deltas, length 384 (6 pieces × 64), roughly centipawns. */
  pstDelta: number[];
  terms: GenomeTerms;
};

export const MODE_MS: Record<ThinkMode, { min: number; max: number; label: string; hint: string }> = {
  flash: { min: 250, max: 400, label: "Flash", hint: "400ms burst" },
  standard: { min: 1200, max: 2000, label: "Standard", hint: "2s search" },
  deep: { min: 5000, max: 8000, label: "Deep", hint: "8s horizon" },
  sure: { min: 2800, max: 14000, label: "Win hunt", hint: "No stable-eval early stop" },
};

export const ENGINE_VERSION = "3.0.0-hive";

export type JamesLevel = {
  level: number;
  name: string;
  tier: "Novice" | "Club" | "Expert" | "Master" | "Hive" | "Singularity";
  /** Fixed think time per move for every lane. */
  moveMs: number;
  maxDepth: number;
  /** Parallel James processes, each running a different variant. */
  lanes: number;
  /** Draw penalty in centipawns — high levels refuse draws and hunt the win. */
  contempt: number;
  /** Probability of playing a random candidate instead of the hive's choice. */
  blunder: number;
  /** Use the compressed game tree learned from stored self-play games. */
  learned: boolean;
};

const LEVEL_NAMES = [
  "Seed", "Sprout", "Foundry", "Pressure", "Tactical", "Predator",
  "Hunter", "Forge", "Apex", "Convergence", "Siege", "Overmind",
  "Swarm", "Lattice", "Cascade", "Hawthorne", "Robinson", "Leviathan",
  "Eclipse", "Singular", "Omniscient", "Absolute", "Terminal", "Solve",
] as const;

function tierFor(level: number): JamesLevel["tier"] {
  if (level <= 4) return "Novice";
  if (level <= 8) return "Club";
  if (level <= 12) return "Expert";
  if (level <= 16) return "Master";
  if (level <= 20) return "Hive";
  return "Singularity";
}

export const JAMES_LEVELS: JamesLevel[] = LEVEL_NAMES.map((name, i) => {
  const level = i + 1;
  const t = i / (LEVEL_NAMES.length - 1);
  return {
    level,
    name,
    tier: tierFor(level),
    moveMs: Math.round(60 + Math.pow(t, 1.8) * 7940),
    maxDepth: Math.round(2 + t * 62),
    lanes: Math.min(8, 1 + Math.floor(i / 3)),
    contempt: Math.round(t * 80),
    blunder: Math.max(0, +(0.35 - i * 0.05).toFixed(2)),
    learned: level >= 6,
  };
});

export const TT_SIZE = 1 << 20;
export const TT_MASK = TT_SIZE - 1;
export const PACKED_ENTRY_BYTES = 10;
