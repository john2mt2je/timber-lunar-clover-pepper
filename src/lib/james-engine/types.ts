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
};

export type ThinkRequest = {
  fen: string;
  mode: ThinkMode;
  genome: Genome;
  options?: ThinkOptions;
};

export type WorkerIn =
  | { type: "think"; req: ThinkRequest }
  | { type: "stop" }
  | { type: "newGame" }
  | { type: "setGenome"; genome: Genome };

export type WorkerOut =
  | { type: "progress"; data: ThinkProgress }
  | { type: "bestmove"; data: ThinkProgress }
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

export const ENGINE_VERSION = "2.0.0-continuous";

export type JamesLevel = {
  level: number;
  name: string;
  moveMs: number;
  maxDepth: number;
  maxPlies: number;
  lanes: number;
};

export const JAMES_LEVELS: JamesLevel[] = [
  { level: 1, name: "Seed", moveMs: 35, maxDepth: 5, maxPlies: 50, lanes: 3 },
  { level: 2, name: "Foundry", moveMs: 50, maxDepth: 6, maxPlies: 60, lanes: 3 },
  { level: 3, name: "Pressure", moveMs: 65, maxDepth: 7, maxPlies: 70, lanes: 4 },
  { level: 4, name: "Tactical", moveMs: 80, maxDepth: 9, maxPlies: 80, lanes: 4 },
  { level: 5, name: "Predator", moveMs: 100, maxDepth: 10, maxPlies: 90, lanes: 5 },
  { level: 6, name: "Hunter", moveMs: 120, maxDepth: 12, maxPlies: 100, lanes: 5 },
  { level: 7, name: "Forge", moveMs: 145, maxDepth: 14, maxPlies: 110, lanes: 6 },
  { level: 8, name: "Apex", moveMs: 170, maxDepth: 16, maxPlies: 120, lanes: 6 },
  { level: 9, name: "Convergence", moveMs: 200, maxDepth: 18, maxPlies: 125, lanes: 7 },
  { level: 10, name: "Siege", moveMs: 230, maxDepth: 20, maxPlies: 130, lanes: 7 },
  { level: 11, name: "Overmind", moveMs: 260, maxDepth: 22, maxPlies: 135, lanes: 8 },
  { level: 12, name: "Solve", moveMs: 300, maxDepth: 24, maxPlies: 140, lanes: 8 },
];

export const TT_SIZE = 1 << 20;
export const TT_MASK = TT_SIZE - 1;
export const PACKED_ENTRY_BYTES = 10;
