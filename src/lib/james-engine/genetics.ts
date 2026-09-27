import type { Genome, GenomeTerms } from "./types";

export const PST_LEN = 6 * 64;

export const DEFAULT_TERMS: GenomeTerms = {
  mobility: 3,
  bishopPair: 42,
  kingSafety: 16,
  passedPawn: 18,
  isolatedPawn: -12,
  doubledPawn: -10,
  tempo: 8,
};

export type Variant = {
  id: string;
  name: string;
  generation: number;
  parentA: string | null;
  parentB: string | null;
  genome: Genome;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
};

const NAME_A = ["Hawthorne", "Robinson", "James", "Cycle", "Lineage", "Packed", "Horizon", "Seldepth", "Tempo", "Vertex", "Kernel", "Fork"];
const NAME_B = ["Alpha", "Beta", "Gamma", "Delta", "Sigma", "Omega", "Prime", "Null", "Echo", "Rift", "Nova", "Zero"];

export function clamp(n: number, lo: number, hi: number) {
  return n < lo ? lo : n > hi ? hi : n;
}

function randInt(a: number, b: number) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

export function variantName(generation: number) {
  return `${NAME_A[randInt(0, NAME_A.length - 1)]}-${NAME_B[randInt(0, NAME_B.length - 1)]}·${generation}`;
}

export function variantId() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

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

/** Coerce untrusted genome JSON into a bounded, well-formed genome. */
export function sanitizeGenome(raw: unknown): Genome {
  const base = defaultGenome();
  if (!raw || typeof raw !== "object") return base;
  const g = raw as Partial<Genome>;
  const pst = Array.isArray(g.pstDelta) && g.pstDelta.length === PST_LEN ? g.pstDelta : base.pstDelta;
  const terms = { ...DEFAULT_TERMS };
  for (const k of Object.keys(terms) as (keyof GenomeTerms)[]) {
    const v = g.terms?.[k];
    if (typeof v === "number" && Number.isFinite(v)) terms[k] = clamp(Math.round(v), -40, 80);
  }
  return {
    ...base,
    generation: typeof g.generation === "number" ? g.generation : 1,
    pstDelta: pst.map((n) => clamp(Math.round(Number(n) || 0), -48, 48)),
    terms,
  };
}

/** Random point mutation. `strength` 0..1 scales mutation count and amplitude. */
export function mutate(g: Genome, strength = 0.5): Genome {
  const next: Genome = { ...g, pstDelta: g.pstDelta.slice(), terms: { ...g.terms } };
  const count = Math.round(6 + strength * 30);
  const amp = Math.max(1, Math.round(2 + strength * 8));
  for (let i = 0; i < count; i++) {
    const idx = randInt(0, PST_LEN - 1);
    next.pstDelta[idx] = clamp(next.pstDelta[idx]! + randInt(-amp, amp), -48, 48);
  }
  const keys = Object.keys(next.terms) as (keyof GenomeTerms)[];
  const termMutations = strength > 0.6 ? 3 : 1;
  for (let i = 0; i < termMutations; i++) {
    const k = keys[randInt(0, keys.length - 1)]!;
    next.terms[k] = clamp(next.terms[k] + randInt(-amp, amp), -40, 80);
  }
  return next;
}

/** Uniform crossover per piece-table block, blended terms weighted by fitness. */
export function crossover(a: Genome, b: Genome, weightA = 0.5): Genome {
  const child = defaultGenome();
  for (let piece = 0; piece < 6; piece++) {
    for (let rank = 0; rank < 8; rank++) {
      const src = Math.random() < weightA ? a : b;
      const off = piece * 64 + rank * 8;
      for (let f = 0; f < 8; f++) child.pstDelta[off + f] = src.pstDelta[off + f] ?? 0;
    }
  }
  for (const k of Object.keys(child.terms) as (keyof GenomeTerms)[]) {
    child.terms[k] = Math.round(a.terms[k] * weightA + b.terms[k] * (1 - weightA));
  }
  child.generation = Math.max(a.generation, b.generation) + 1;
  return child;
}

export function expectedScore(a: number, b: number) {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

/** Elo delta for white given result points (1 / 0.5 / 0) for white. */
export function eloDelta(white: number, black: number, whitePoints: number, k = 24) {
  return k * (whitePoints - expectedScore(white, black));
}

/** Position key: piece placement + side + castling + ep (no move counters). */
export function positionKey(fen: string) {
  return fen.split(" ").slice(0, 4).join(" ");
}
