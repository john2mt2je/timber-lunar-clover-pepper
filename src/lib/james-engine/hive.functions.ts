import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const uci = z.string().regex(/^[a-h][1-8][a-h][1-8][nbrq]?$/);

const gameSchema = z.object({
  whiteId: z.string().min(1).max(64),
  blackId: z.string().min(1).max(64),
  result: z.enum(["1-0", "0-1", "1/2-1/2"]),
  moves: z.array(uci).min(1).max(400),
  plies: z.number().int().min(0).max(400),
  reason: z.enum(["mate", "draw", "adjudicated", "maxplies"]),
});

export const getHive = createServerFn({ method: "GET" }).handler(async () => {
  const { hiveSnapshot } = await import("./hive.server");
  return hiveSnapshot();
});

export const submitSelfPlay = createServerFn({ method: "POST" })
  .validator(z.object({ games: z.array(gameSchema).min(1).max(24) }))
  .handler(async ({ data }) => {
    const { ingestGames } = await import("./hive.server");
    return ingestGames(data.games, "browser");
  });

export const getLearned = createServerFn({ method: "POST" })
  .validator(z.object({ fen: z.string().min(10).max(120) }))
  .handler(async ({ data }) => {
    const { learnedFor } = await import("./hive.server");
    return learnedFor(data.fen);
  });
