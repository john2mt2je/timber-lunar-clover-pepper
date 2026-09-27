import type { Genome, GenomeTerms } from "./types";

const PST_LEN = 6 * 64;

const DEFAULT_TERMS: GenomeTerms = {
  mobility: 3,
  bishopPair: 42,
  kingSafety: 16,
  passedPawn: 18,
  isolatedPawn: -12,
  doubledPawn: -10,
  tempo: 8,
};

export function defaultGenome(): Genome {
  return {
    generation: 1,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    pstDelta: new Array(PST_LEN).fill(0),
    terms: { ...DEFAULT_TERMS },
  };
}

export function loadGenome(): Genome {
  try {
    const raw = localStorage.getItem("james-engine-genome-v1");
    if (!raw) return defaultGenome();
    const g = JSON.parse(raw) as Genome;
    if (!Array.isArray(g.pstDelta) || g.pstDelta.length !== PST_LEN) return defaultGenome();
    return {
      ...defaultGenome(),
      ...g,
      pstDelta: g.pstDelta.map((n) => clamp(n | 0, -48, 48)),
      terms: { ...DEFAULT_TERMS, ...(g.terms ?? {}) },
    };
  } catch {
    return defaultGenome();
  }
}

export function saveGenome(g: Genome) {
  try {
    localStorage.setItem("james-engine-genome-v1", JSON.stringify(g));
  } catch {
    /* quota */
  }
}

function clamp(n: number, lo: number, hi: number) {
  return n < lo ? lo : n > hi ? hi : n;
}

function randInt(a: number, b: number) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

/** Nudge evaluation after a finished game. Engine plays as `engineColor`. */
export function evolveGenome(g: Genome, result: "win" | "loss" | "draw"): Genome {
  const next: Genome = {
    ...g,
    generation: g.generation + 1,
    games: g.games + 1,
    wins: g.wins + (result === "win" ? 1 : 0),
    losses: g.losses + (result === "loss" ? 1 : 0),
    draws: g.draws + (result === "draw" ? 1 : 0),
    pstDelta: g.pstDelta.slice(),
    terms: { ...g.terms },
  };

  const mutateCount = result === "loss" ? 18 : result === "draw" ? 8 : 6;
  const amp = result === "loss" ? 6 : 3;
  for (let i = 0; i < mutateCount; i++) {
    const idx = randInt(0, PST_LEN - 1);
    next.pstDelta[idx] = clamp(next.pstDelta[idx] + randInt(-amp, amp), -48, 48);
  }

  const keys = Object.keys(next.terms) as (keyof GenomeTerms)[];
  const k = keys[randInt(0, keys.length - 1)]!;
  const delta = result === "loss" ? randInt(-3, 3) : randInt(-1, 2);
  next.terms[k] = clamp(next.terms[k] + delta, -40, 80);

  if (result === "loss") {
    // Regression toward defaults — keep the lineage from drifting into noise.
    for (let i = 0; i < PST_LEN; i++) next.pstDelta[i] = Math.round(next.pstDelta[i] * 0.85);
  }

  saveGenome(next);
  return next;
}
