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

export type ThinkRequest = {
  fen: string;
  mode: ThinkMode;
  genome: Genome;
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
  sure: { min: 2800, max: 14000, label: "Until sure", hint: "Stops on stable eval" },
};

export const TT_SIZE = 1 << 20;
export const TT_MASK = TT_SIZE - 1;
export const PACKED_ENTRY_BYTES = 10;
