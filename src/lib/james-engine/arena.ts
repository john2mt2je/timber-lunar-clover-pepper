import type { ArenaIn, ArenaOut } from "./arena-worker";
import type { Variant } from "./genetics";
import type { SelfPlayGame } from "./selfplay";

export type ArenaStats = { played: number; gamesPerMin: number; running: number; lastGame: SelfPlayGame | null };

/**
 * Continuous background self-play. Each worker plays one game at a time between
 * two randomly paired variants; finished games are batched to `flush`.
 */
export class Arena {
  private workers: Worker[] = [];
  private variants: Variant[] = [];
  private buffer: SelfPlayGame[] = [];
  private job = 0;
  private running = false;
  private startedAt = 0;
  private played = 0;
  private lastGame: SelfPlayGame | null = null;

  constructor(
    private flush: (games: SelfPlayGame[]) => Promise<void>,
    private onStats: (s: ArenaStats) => void,
  ) {}

  setVariants(v: Variant[]) {
    this.variants = v;
  }

  start(threads: number) {
    if (this.running || this.variants.length < 2) return;
    this.running = true;
    this.startedAt = performance.now();
    for (let i = 0; i < threads; i++) {
      const w = new Worker(new URL("./arena-worker.ts", import.meta.url), { type: "module" });
      w.onmessage = (e: MessageEvent<ArenaOut>) => this.onDone(w, e.data);
      this.workers.push(w);
      this.dispatch(w);
    }
    this.emit();
  }

  stop() {
    this.running = false;
    for (const w of this.workers) w.terminate();
    this.workers = [];
    void this.drain();
    this.emit();
  }

  private dispatch(w: Worker) {
    if (!this.running || this.variants.length < 2) return;
    const a = this.variants[Math.floor(Math.random() * this.variants.length)]!;
    let b = this.variants[Math.floor(Math.random() * this.variants.length)]!;
    if (a.id === b.id) b = this.variants[(this.variants.indexOf(a) + 1) % this.variants.length]!;
    const msg: ArenaIn = {
      type: "play",
      job: ++this.job,
      white: { id: a.id, genome: a.genome },
      black: { id: b.id, genome: b.genome },
      moveMs: 30,
    };
    w.postMessage(msg);
  }

  private onDone(w: Worker, out: ArenaOut) {
    this.played++;
    this.lastGame = out.game;
    this.buffer.push(out.game);
    if (this.buffer.length >= 4) void this.drain();
    this.emit();
    this.dispatch(w);
  }

  private async drain() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.buffer.length);
    try {
      await this.flush(batch);
    } catch {
      this.buffer.unshift(...batch.slice(-8));
    }
  }

  private emit() {
    const mins = Math.max((performance.now() - this.startedAt) / 60000, 1 / 60);
    this.onStats({
      played: this.played,
      gamesPerMin: this.running ? this.played / mins : 0,
      running: this.workers.length,
      lastGame: this.lastGame,
    });
  }
}
