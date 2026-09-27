import { Chess } from "chess.js";
import { getSql, type Sql } from "@/lib/db";
import {
  crossover,
  defaultGenome,
  eloDelta,
  mutate,
  positionKey,
  sanitizeGenome,
  variantId,
  variantName,
  type Variant,
} from "./genetics";
import type { SelfPlayGame } from "./selfplay";
import { ENGINE_VERSION, type LearnedMove } from "./types";

const POPULATION_MIN = 10;
const POPULATION_MAX = 16;
const TREE_PLIES = 32;
const RAW_GAMES_KEPT = 3000;

type VariantRow = {
  id: string;
  name: string;
  generation: number;
  parent_a: string | null;
  parent_b: string | null;
  genome: unknown;
  elo: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
};

function rowToVariant(r: VariantRow): Variant {
  return {
    id: r.id,
    name: r.name,
    generation: r.generation,
    parentA: r.parent_a,
    parentB: r.parent_b,
    genome: sanitizeGenome(typeof r.genome === "string" ? JSON.parse(r.genome) : r.genome),
    elo: Number(r.elo),
    games: r.games,
    wins: r.wins,
    losses: r.losses,
    draws: r.draws,
  };
}

async function insertVariant(sql: Sql, v: Variant) {
  await sql`
    insert into james_variants (id, name, generation, parent_a, parent_b, genome, elo)
    values (${v.id}, ${v.name}, ${v.generation}, ${v.parentA}, ${v.parentB}, ${JSON.stringify(v.genome)}::jsonb, ${v.elo})
  `;
}

async function bumpMeta(sql: Sql, key: string, by: number) {
  await sql`
    insert into james_meta (key, value) values (${key}, ${by})
    on conflict (key) do update set value = james_meta.value + excluded.value
  `;
}

export async function loadPopulation(sql: Sql): Promise<Variant[]> {
  const rows = await sql<VariantRow>`
    select id, name, generation, parent_a, parent_b, genome, elo, games, wins, losses, draws
    from james_variants where alive = true order by elo desc
  `;
  if (rows.length > 0) return rows.map(rowToVariant);

  const seeds: Variant[] = [];
  for (let i = 0; i < POPULATION_MIN; i++) {
    const genome = i === 0 ? defaultGenome() : mutate(defaultGenome(), 0.4 + (i / POPULATION_MIN) * 0.6);
    seeds.push({
      id: variantId(),
      name: i === 0 ? "James-Prime·1" : variantName(1),
      generation: 1,
      parentA: null,
      parentB: null,
      genome,
      elo: 1200,
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    });
  }
  for (const s of seeds) await insertVariant(sql, s);
  return seeds;
}

/** Replays a game server-side; returns null if any move is illegal. */
function replay(moves: string[]) {
  const chess = new Chess();
  const tree: { key: string; move: string; mover: "w" | "b" }[] = [];
  for (let i = 0; i < moves.length; i++) {
    const uci = moves[i]!;
    const key = positionKey(chess.fen());
    const mover = chess.turn();
    try {
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    } catch {
      return null;
    }
    if (i < TREE_PLIES) tree.push({ key, move: uci, mover });
  }
  return { chess, tree };
}

function resultPoints(result: string): number {
  return result === "1-0" ? 1 : result === "0-1" ? 0 : 0.5;
}

/**
 * Stores self-play games, folds them into the compressed position tree,
 * updates Elo, and breeds the population. Results are re-derived from the
 * replayed board where the game ended decisively; adjudicated results are kept.
 */
export async function ingestGames(games: SelfPlayGame[], source: "browser" | "server") {
  const sql = await getSql();
  const population = await loadPopulation(sql);
  const byId = new Map(population.map((v) => [v.id, v]));
  let stored = 0;

  const treeKeys: string[] = [];
  const treeMoves: string[] = [];
  const treePoints: number[] = [];

  for (const g of games) {
    const white = byId.get(g.whiteId);
    const black = byId.get(g.blackId);
    if (!white || !black || white.id === black.id) continue;
    const replayed = replay(g.moves);
    if (!replayed) continue;

    let result = g.result;
    if (replayed.chess.isCheckmate()) result = replayed.chess.turn() === "w" ? "0-1" : "1-0";
    else if (replayed.chess.isDraw()) result = "1/2-1/2";

    const wp = resultPoints(result);
    const delta = eloDelta(white.elo, black.elo, wp);
    white.elo += delta;
    black.elo -= delta;
    white.games++;
    black.games++;
    if (wp === 1) {
      white.wins++;
      black.losses++;
    } else if (wp === 0) {
      white.losses++;
      black.wins++;
    } else {
      white.draws++;
      black.draws++;
    }

    await sql`
      insert into james_games (source, white_id, black_id, level, result, plies, moves, engine_version)
      values (${source}, ${white.id}, ${black.id}, 0, ${result}, ${g.moves.length}, ${g.moves.join(" ")}, ${ENGINE_VERSION})
    `;
    stored++;

    for (const node of replayed.tree) {
      treeKeys.push(node.key);
      treeMoves.push(node.move);
      treePoints.push(node.mover === "w" ? wp : 1 - wp);
    }
  }

  if (stored === 0) return { stored: 0 };

  if (treeKeys.length > 0) {
    await sql.query(
      `insert into james_positions (pos_key, move, plays, points, updated_at)
       select k, m, count(*)::int, sum(p), now()
       from unnest($1::text[], $2::text[], $3::float8[]) as t(k, m, p)
       group by k, m
       on conflict (pos_key, move) do update
         set plays = james_positions.plays + excluded.plays,
             points = james_positions.points + excluded.points,
             updated_at = now()`,
      [treeKeys, treeMoves, treePoints],
    );
  }

  for (const v of population) {
    await sql`
      update james_variants
      set elo = ${v.elo}, games = ${v.games}, wins = ${v.wins}, losses = ${v.losses}, draws = ${v.draws}
      where id = ${v.id}
    `;
  }

  await bumpMeta(sql, "games", stored);
  await bumpMeta(sql, "folded_positions", treeKeys.length);
  const bred = await evolvePopulation(sql, population, stored);
  await compress(sql);
  return { stored, bred };
}

/** Cull the weakest proven variant and breed a child from the elite. */
async function evolvePopulation(sql: Sql, population: Variant[], newGames: number) {
  const ranked = [...population].sort((a, b) => b.elo - a.elo);
  let bred = 0;
  const cycles = Math.max(1, Math.floor(newGames / 4));

  for (let c = 0; c < cycles; c++) {
    const proven = ranked.filter((v) => v.games >= 8);
    if (ranked.length >= POPULATION_MAX && proven.length > 0) {
      const worst = proven[proven.length - 1]!;
      await sql`update james_variants set alive = false where id = ${worst.id}`;
      ranked.splice(ranked.indexOf(worst), 1);
    }
    if (ranked.length >= POPULATION_MAX) break;

    const elite = ranked.slice(0, Math.max(2, Math.ceil(ranked.length / 3)));
    const a = elite[0]!;
    const b = elite[1 + Math.floor(Math.random() * (elite.length - 1))] ?? a;
    const weightA = 0.5 + (a.elo - b.elo) / 1600;
    const genome = mutate(crossover(a.genome, b.genome, Math.min(0.8, Math.max(0.2, weightA))), 0.25);
    const child: Variant = {
      id: variantId(),
      name: variantName(genome.generation),
      generation: genome.generation,
      parentA: a.id,
      parentB: b.id,
      genome,
      elo: (a.elo + b.elo) / 2 - 20,
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
    await insertVariant(sql, child);
    ranked.push(child);
    bred++;
  }

  if (bred) await bumpMeta(sql, "bred", bred);
  return bred;
}

/** Old raw games are folded into the tree already; drop their move text. */
async function compress(sql: Sql) {
  const rows = await sql.query<{ id: number }>(
    `update james_games set moves = null, compressed = true
     where compressed = false and id <= (select coalesce(max(id), 0) - $1 from james_games)
     returning id`,
    [RAW_GAMES_KEPT],
  );
  if (rows.length) await bumpMeta(sql, "compressed", rows.length);
  const pruned = await sql`
    delete from james_positions
    where plays <= 1 and updated_at < now() - interval '3 days'
    returning pos_key
  `;
  if (pruned.length) await bumpMeta(sql, "pruned", pruned.length);
}

export async function learnedFor(fen: string): Promise<LearnedMove[]> {
  const sql = await getSql();
  const rows = await sql<{ move: string; plays: number; points: number }>`
    select move, plays, points from james_positions
    where pos_key = ${positionKey(fen)} and plays >= 2
    order by plays desc limit 8
  `;
  return rows.map((r) => ({ move: r.move, plays: r.plays, rate: Number(r.points) / r.plays }));
}

export type HiveSnapshot = {
  variants: Variant[];
  meta: Record<string, number>;
  treeSize: number;
  recent: { id: number; white: string; black: string; result: string; plies: number; source: string; at: string }[];
  topGeneration: number;
};

export async function hiveSnapshot(): Promise<HiveSnapshot> {
  const sql = await getSql();
  const variants = await loadPopulation(sql);
  const metaRows = await sql<{ key: string; value: number }>`select key, value from james_meta`;
  const [{ n }] = await sql<{ n: number }>`select count(*)::int as n from james_positions`;
  const names = new Map(variants.map((v) => [v.id, v.name]));
  const recentRows = await sql<{
    id: number;
    white_id: string;
    black_id: string;
    result: string;
    plies: number;
    source: string;
    created_at: string | Date;
  }>`select id, white_id, black_id, result, plies, source, created_at from james_games order by id desc limit 12`;
  return {
    variants,
    meta: Object.fromEntries(metaRows.map((r) => [r.key, Number(r.value)])),
    treeSize: n,
    topGeneration: variants.reduce((m, v) => Math.max(m, v.generation), 1),
    recent: recentRows.map((r) => ({
      id: r.id,
      white: names.get(r.white_id) ?? "retired",
      black: names.get(r.black_id) ?? "retired",
      result: r.result,
      plies: r.plies,
      source: r.source,
      at: new Date(r.created_at).toISOString(),
    })),
  };
}
