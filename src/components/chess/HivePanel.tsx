import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArenaStats } from "@/lib/james-engine/arena";
import type { HiveSnapshot } from "@/lib/james-engine/hive.server";
import { cn } from "@/lib/utils";

type Props = {
  hive: HiveSnapshot | undefined;
  arena: ArenaStats;
  arenaOn: boolean;
  onToggle: () => void;
  compact?: boolean;
};

export function HivePanel({ hive, arena, arenaOn, onToggle, compact }: Props) {
  const meta = hive?.meta ?? {};
  const stats = [
    { k: "Games stored", v: (meta.games ?? 0).toLocaleString() },
    { k: "Tree nodes", v: (hive?.treeSize ?? 0).toLocaleString() },
    { k: "Generation", v: String(hive?.topGeneration ?? 1) },
    { k: "Bred", v: (meta.bred ?? 0).toLocaleString() },
    { k: "Compressed", v: (meta.compressed ?? 0).toLocaleString() },
    { k: "Games/min", v: arena.gamesPerMin.toFixed(1) },
  ];
  const variants = hive?.variants.slice(0, compact ? 5 : 10) ?? [];

  return (
    <section className="rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn("size-2 rounded-full", arenaOn ? "animate-pulse bg-good" : "bg-subtle")}
            aria-hidden
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Hive self-play {arenaOn ? `· ${arena.running} threads` : "· paused"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle} aria-label={arenaOn ? "Pause self-play" : "Resume self-play"}>
          {arenaOn ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-3 font-mono text-[11px]">
        {stats.map((s) => (
          <div key={s.k}>
            <dt className="text-subtle">{s.k}</dt>
            <dd className="mt-0.5 text-sm tabular-nums text-fg">{s.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Population</p>
        {variants.length === 0 ? (
          <p className="text-xs text-subtle">Seeding the first generation…</p>
        ) : (
          <ol className="flex flex-col gap-1 font-mono text-[11px]">
            {variants.map((v, i) => (
              <li key={v.id} className="grid grid-cols-[1.25rem_1fr_auto_auto] items-center gap-2">
                <span className="text-subtle">{i + 1}</span>
                <span className="truncate text-fg">
                  {v.name}
                  {v.parentB ? <span className="text-subtle"> · hybrid</span> : null}
                </span>
                <span className="text-subtle tabular-nums">
                  {v.wins}-{v.losses}-{v.draws}
                </span>
                <span className="w-10 text-right tabular-nums text-accent">{Math.round(v.elo)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {!compact && hive?.recent.length ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Latest games</p>
          <ol className="flex flex-col gap-1 font-mono text-[11px] text-muted">
            {hive.recent.slice(0, 6).map((g) => (
              <li key={g.id} className="flex justify-between gap-2">
                <span className="truncate">
                  {g.white} <span className="text-subtle">vs</span> {g.black}
                </span>
                <span className="shrink-0 text-fg">
                  {g.result} <span className="text-subtle">· {g.plies}p</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
