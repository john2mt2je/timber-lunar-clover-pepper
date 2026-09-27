import type { Genome, ThinkMode, ThinkOptions, ThinkProgress, WorkerIn, WorkerOut } from "./types";

export type EngineHandle = {
  think: (fen: string, mode: ThinkMode, genome: Genome, options?: ThinkOptions) => void;
  stop: () => void;
  newGame: () => void;
  terminate: () => void;
};

export function createEngine(handlers: {
  onProgress: (p: ThinkProgress) => void;
  onBest: (p: ThinkProgress) => void;
  onReady?: () => void;
}): EngineHandle {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

  worker.onmessage = (e: MessageEvent<WorkerOut>) => {
    const msg = e.data;
    if (msg.type === "progress") handlers.onProgress(msg.data);
    else if (msg.type === "bestmove") handlers.onBest(msg.data);
    else if (msg.type === "ready") handlers.onReady?.();
  };

  const send = (msg: WorkerIn) => worker.postMessage(msg);

  return {
    think: (fen, mode, genome, options) => send({ type: "think", req: { fen, mode, genome, options } }),
    stop: () => send({ type: "stop" }),
    newGame: () => send({ type: "newGame" }),
    terminate: () => worker.terminate(),
  };
}
