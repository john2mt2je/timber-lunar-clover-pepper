/// <reference lib="webworker" />
import { clearTables, requestStop, think } from "./search";
import type { WorkerIn, WorkerOut } from "./types";

function post(msg: WorkerOut) {
  self.postMessage(msg);
}

self.onmessage = (e: MessageEvent<WorkerIn>) => {
  const m = e.data;
  if (m.type === "stop") {
    requestStop();
    return;
  }
  if (m.type === "newGame") {
    clearTables();
    return;
  }
  if (m.type === "think") {
    const result = think(m.req.fen, m.req.mode, m.req.genome, (p) => {
      post({ type: "progress", data: p });
    });
    post({ type: "bestmove", data: result });
  }
};

post({ type: "ready" });
