/// <reference lib="webworker" />
import { playSelfGame, DEFAULT_SELFPLAY, type SelfPlayGame } from "./selfplay";
import type { Genome } from "./types";

export type ArenaIn = {
  type: "play";
  job: number;
  white: { id: string; genome: Genome };
  black: { id: string; genome: Genome };
  moveMs: number;
};

export type ArenaOut = { type: "done"; job: number; game: SelfPlayGame; ms: number };

self.onmessage = (e: MessageEvent<ArenaIn>) => {
  const m = e.data;
  if (m.type !== "play") return;
  const t0 = performance.now();
  const game = playSelfGame(m.white, m.black, { ...DEFAULT_SELFPLAY, moveMs: m.moveMs });
  const out: ArenaOut = { type: "done", job: m.job, game, ms: performance.now() - t0 };
  self.postMessage(out);
};
