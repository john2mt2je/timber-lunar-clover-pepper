import { JAMES_LEVELS, type JamesLevel } from "@/lib/james-engine/types";
import { cn } from "@/lib/utils";

type Props = { value: number; onChange: (level: number) => void };

function fmtMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

export function LevelPicker({ value, onChange }: Props) {
  const level = JAMES_LEVELS[value - 1]!;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="james-level" className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Level
        </label>
        <span className="font-mono text-xs text-subtle">{level.tier}</span>
      </div>
      <p className="mt-2 font-display text-3xl tracking-[-0.03em]">
        {level.level}
        <span className="text-muted"> · {level.name}</span>
      </p>
      <input
        id="james-level"
        type="range"
        min={1}
        max={JAMES_LEVELS.length}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 w-full accent-[var(--color-accent)]"
      />
      <div className="mt-1 flex gap-[2px]" aria-hidden>
        {JAMES_LEVELS.map((l) => (
          <span
            key={l.level}
            className={cn(
              "h-1 flex-1 rounded-full",
              l.level <= value ? (l.level > 20 ? "bg-bad" : l.level > 12 ? "bg-warn" : "bg-accent") : "bg-line",
            )}
          />
        ))}
      </div>
      <LevelSpecs level={level} />
    </div>
  );
}

function LevelSpecs({ level }: { level: JamesLevel }) {
  const specs = [
    { k: "Processes", v: `${level.lanes} parallel` },
    { k: "Think", v: fmtMs(level.moveMs) },
    { k: "Depth cap", v: String(level.maxDepth) },
    { k: "Draw contempt", v: `${level.contempt} cp` },
    { k: "Memory", v: level.learned ? "game tree" : "off" },
    { k: "Mistakes", v: level.blunder ? `${Math.round(level.blunder * 100)}%` : "none" },
  ];
  return (
    <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 font-mono text-[11px]">
      {specs.map((s) => (
        <div key={s.k}>
          <dt className="text-subtle">{s.k}</dt>
          <dd className="mt-0.5 text-fg">{s.v}</dd>
        </div>
      ))}
    </dl>
  );
}
