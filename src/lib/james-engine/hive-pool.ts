import { createEngine, type EngineHandle } from "./client";
import type { Variant } from "./genetics";
import type { EngineMove, JamesLevel, LearnedMove, ThinkProgress } from "./types";

export type LaneReport = {
  variant: string;
  generation: number;
  elo: number;
  move: string | null;
  score: number;
  depth: number;
  nodes: number;
};

export type HiveDecision = {
  move: EngineMove | null;
  progress: ThinkProgress;
  lanes: LaneReport[];
  consensus: number;
  totalNodes: number;
};

/**
 * Runs several James processes in parallel — one Web Worker per lane, each with
 * a different variant genome — then combines their verdicts into one move.
 */
export class HivePool {
  private engines: EngineHandle[] = [];
  private cancelled = false;

  constructor(private onPrimaryProgress: (p: ThinkProgress) => void) {}

  private ensure(n: number) {
    while (this.engines.length < n) {
      const index = this.engines.length;
      const pending = { resolve: null as null | ((p: ThinkProgress) => void) };
      const engine = createEngine({
        onProgress: (p) => {
          if (index === 0) this.onPrimaryProgress(p);
        },
        onBest: (p) => pending.resolve?.(p),
      });
      (engine as EngineHandle & { pending: typeof pending }).pending = pending;
      this.engines.push(engine);
    }
  }

  newGame() {
    for (const e of this.engines) e.newGame();
  }

  stop() {
    this.cancelled = true;
    for (const e of this.engines) e.stop();
  }

  terminate() {
    for (const e of this.engines) e.terminate();
    this.engines = [];
  }

  async think(
    fen: string,
    level: JamesLevel,
    variants: Variant[],
    learned: LearnedMove[],
  ): Promise<HiveDecision | null> {
    this.cancelled = false;
    const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
    const laneCount = Math.max(1, Math.min(level.lanes, variants.length, Math.max(1, cores - 1)));
    this.ensure(laneCount);
    const lanes = variants.slice(0, laneCount);

    const results = await Promise.all(
      lanes.map(
        (variant, i) =>
          new Promise<ThinkProgress>((resolve) => {
            const engine = this.engines[i] as EngineHandle & {
              pending: { resolve: ((p: ThinkProgress) => void) | null };
            };
            engine.pending.resolve = resolve;
            engine.think(fen, "standard", variant.genome, {
              minMs: level.moveMs,
              maxMs: level.moveMs,
              maxDepth: level.maxDepth,
              stopOnStable: false,
              allowBook: level.level <= 10,
              contempt: level.contempt,
              learned: level.learned ? learned : [],
              lite: i > 0,
            });
          }),
      ),
    );
    if (this.cancelled) return null;

    const tally = new Map<string, { move: EngineMove; weight: number; votes: number; score: number; n: number }>();
    const maxElo = Math.max(...lanes.map((v) => v.elo));
    results.forEach((res, i) => {
      const trust = Math.pow(10, (lanes[i]!.elo - maxElo) / 800) * (1 + res.depth / 16);
      for (const line of res.lines) {
        const key = line.move.from + line.move.to + (line.move.promotion ?? "");
        const entry = tally.get(key) ?? { move: line.move, weight: 0, votes: 0, score: 0, n: 0 };
        entry.score += line.score * trust;
        entry.weight += trust;
        entry.n++;
        tally.set(key, entry);
      }
      const best = res.bestMove;
      if (best) {
        const key = best.from + best.to + (best.promotion ?? "");
        const entry = tally.get(key) ?? { move: best, weight: trust, votes: 0, score: res.score * trust, n: 1 };
        entry.votes += trust;
        tally.set(key, entry);
      }
    });

    const ranked = [...tally.values()]
      .map((e) => ({ ...e, value: e.score / Math.max(e.weight, 1e-6) + e.votes * 18 }))
      .sort((a, b) => b.value - a.value);

    let chosen = ranked[0]?.move ?? results[0]!.bestMove;
    if (level.blunder > 0 && ranked.length > 1 && Math.random() < level.blunder) {
      chosen = ranked[1 + Math.floor(Math.random() * Math.min(ranked.length - 1, 4))]!.move;
    }

    const chosenKey = chosen ? chosen.from + chosen.to + (chosen.promotion ?? "") : "";
    const agree = results.filter(
      (r) => r.bestMove && r.bestMove.from + r.bestMove.to + (r.bestMove.promotion ?? "") === chosenKey,
    ).length;

    return {
      move: chosen,
      progress: results[0]!,
      consensus: agree / results.length,
      totalNodes: results.reduce((s, r) => s + r.nodes, 0),
      lanes: results.map((r, i) => ({
        variant: lanes[i]!.name,
        generation: lanes[i]!.generation,
        elo: Math.round(lanes[i]!.elo),
        move: r.bestMove?.san ?? null,
        score: r.score,
        depth: r.depth,
        nodes: r.nodes,
      })),
    };
  }
}
