import { createFileRoute } from "@tanstack/react-router";

const BUDGET_MS = 45_000;

/**
 * Server-side self-play so James keeps evolving while nobody has the app open.
 * Triggered by Vercel Cron; when CRON_SECRET is set, only Vercel may call it.
 */
export const Route = createFileRoute("/api/james/evolve")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        const [{ getSql }, hive, { playSelfGame, DEFAULT_SELFPLAY }] = await Promise.all([
          import("@/lib/db"),
          import("@/lib/james-engine/hive.server"),
          import("@/lib/james-engine/selfplay"),
        ]);

        const started = Date.now();
        let played = 0;
        while (Date.now() - started < BUDGET_MS) {
          const population = await hive.loadPopulation(await getSql());
          const batch = [];
          for (let i = 0; i < 4 && Date.now() - started < BUDGET_MS; i++) {
            const a = population[Math.floor(Math.random() * population.length)]!;
            let b = population[Math.floor(Math.random() * population.length)]!;
            if (b.id === a.id) b = population[(population.indexOf(a) + 1) % population.length]!;
            batch.push(playSelfGame(a, b, { ...DEFAULT_SELFPLAY, moveMs: 25 }));
          }
          if (batch.length === 0) break;
          await hive.ingestGames(batch, "server");
          played += batch.length;
        }
        return Response.json({ played, ms: Date.now() - started });
      },
    },
  },
});
