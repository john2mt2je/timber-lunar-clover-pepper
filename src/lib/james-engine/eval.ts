import { Chess, type PieceSymbol } from "chess.js";
import type { Genome } from "./types";

const MG_VALUE: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

const PIECE_INDEX: Record<PieceSymbol, number> = {
  p: 0,
  n: 1,
  b: 2,
  r: 3,
  q: 4,
  k: 5,
};

// White-side PST, a1 = 0. Mirrored for black.
const PST: number[][] = [
  // pawn
  [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0, -10, -5, 5, 0, 0, 0,
    20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10, 20, 30, 30, 20, 10, 10, 50, 50, 50, 50, 50,
    50, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  // knight
  [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30, 5, 10, 15, 15, 10,
    5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 10, 15, 15, 10,
    0, -30, -40, -20, 0, 0, 0, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  // bishop
  [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 5, 0, 0, 0, 0, 5, -10, -10, 10, 10, 10, 10, 10, 10,
    -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  // rook
  [
    0, 0, 0, 5, 5, 0, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0,
    0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
  // queen
  [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 5, 0, 0, 0, 0, -10, -10, 5, 5, 5, 5, 5, 0, -10, 0,
    0, 5, 5, 5, 5, 0, -5, -5, 0, 5, 5, 5, 5, 0, -5, -10, 0, 5, 5, 5, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0,
    -10, -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  // king mg
  [
    20, 30, 10, 0, 0, 10, 30, 20, 20, 20, 0, 0, 0, 0, 20, 20, -10, -20, -20, -20, -20, -20, -20, -10,
    -20, -30, -30, -40, -40, -30, -30, -20, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40,
    -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30,
  ],
];

const KING_EG: number[] = [
  -50, -30, -30, -30, -30, -30, -30, -50, -30, -10, 0, 0, 0, 0, -10, -30, -30, 0, 10, 15, 15, 10, 0,
  -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 0, 10, 15, 15, 10, 0, -30,
  -30, -10, 0, 0, 0, 0, -10, -30, -50, -30, -30, -30, -30, -30, -30, -50,
];

function mirror(sq: number) {
  return sq ^ 56;
}

export function evaluate(chess: Chess, genome: Genome): number {
  const board = chess.board();
  const terms = genome.terms;
  const delta = genome.pstDelta;
  let mg = 0;
  let eg = 0;
  let phase = 0;
  let wb = 0;
  let bb = 0;
  const wPawns = new Uint8Array(8);
  const bPawns = new Uint8Array(8);
  let wKing = 4;
  let bKing = 60;

  for (let r = 0; r < 8; r++) {
    const row = board[r]!;
    for (let f = 0; f < 8; f++) {
      const p = row[f];
      if (!p) continue;
      const sq = (7 - r) * 8 + f;
      const idx = PIECE_INDEX[p.type];
      const val = MG_VALUE[p.type];
      const pst = PST[idx]![p.color === "w" ? sq : mirror(sq)]!;
      const d = delta[idx * 64 + (p.color === "w" ? sq : mirror(sq))] ?? 0;
      const sign = p.color === "w" ? 1 : -1;
      mg += sign * (val + pst + d);
      if (p.type === "k") {
        eg += sign * KING_EG[p.color === "w" ? sq : mirror(sq)]!;
        if (p.color === "w") wKing = sq;
        else bKing = sq;
      } else {
        eg += sign * (val + (pst >> 1) + d);
      }
      if (p.type === "p") {
        if (p.color === "w") wPawns[f]!++;
        else bPawns[f]!++;
      } else if (p.type === "b") {
        if (p.color === "w") wb++;
        else bb++;
      }
      if (p.type === "n" || p.type === "b") phase += 1;
      else if (p.type === "r") phase += 2;
      else if (p.type === "q") phase += 4;
    }
  }

  if (wb >= 2) {
    mg += terms.bishopPair;
    eg += terms.bishopPair + 8;
  }
  if (bb >= 2) {
    mg -= terms.bishopPair;
    eg -= terms.bishopPair + 8;
  }

  for (let f = 0; f < 8; f++) {
    if (wPawns[f]! > 1) {
      mg += terms.doubledPawn * (wPawns[f]! - 1);
      eg += terms.doubledPawn * (wPawns[f]! - 1);
    }
    if (bPawns[f]! > 1) {
      mg -= terms.doubledPawn * (bPawns[f]! - 1);
      eg -= terms.doubledPawn * (bPawns[f]! - 1);
    }
    const wIso = (f === 0 || wPawns[f - 1] === 0) && (f === 7 || wPawns[f + 1] === 0);
    const bIso = (f === 0 || bPawns[f - 1] === 0) && (f === 7 || bPawns[f + 1] === 0);
    if (wPawns[f]! && wIso) mg += terms.isolatedPawn;
    if (bPawns[f]! && bIso) mg -= terms.isolatedPawn;

    if (wPawns[f]!) {
      let passed = true;
      for (let nf = Math.max(0, f - 1); nf <= Math.min(7, f + 1); nf++) {
        if (bPawns[nf]!) passed = false;
      }
      if (passed) {
        mg += terms.passedPawn;
        eg += terms.passedPawn * 2;
      }
    }
    if (bPawns[f]!) {
      let passed = true;
      for (let nf = Math.max(0, f - 1); nf <= Math.min(7, f + 1); nf++) {
        if (wPawns[nf]!) passed = false;
      }
      if (passed) {
        mg -= terms.passedPawn;
        eg -= terms.passedPawn * 2;
      }
    }
  }

  const wFile = wKing & 7;
  let shield = 0;
  for (let f = Math.max(0, wFile - 1); f <= Math.min(7, wFile + 1); f++) {
    if (wPawns[f]!) shield++;
  }
  mg += shield * terms.kingSafety;
  const bFile = bKing & 7;
  shield = 0;
  for (let f = Math.max(0, bFile - 1); f <= Math.min(7, bFile + 1); f++) {
    if (bPawns[f]!) shield++;
  }
  mg -= shield * terms.kingSafety;

  const ph = Math.min(24, phase);
  let score = ((mg * ph + eg * (24 - ph)) / 24) | 0;
  score += chess.turn() === "w" ? terms.tempo : -terms.tempo;
  return chess.turn() === "w" ? score : -score;
}
