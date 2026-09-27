import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { RotateCcw, Swords, Undo2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "./Board";
import { HivePanel } from "./HivePanel";
import { JamesGraph } from "./JamesGraph";
import { LevelPicker } from "./LevelPicker";
import { Promotion, type PendingPromo } from "./Promotion";
import { Button } from "@/components/ui/button";
import { Arena, type ArenaStats } from "@/lib/james-engine/arena";
import { getHive, getLearned, submitSelfPlay } from "@/lib/james-engine/hive.functions";
import { HivePool, type HiveDecision } from "@/lib/james-engine/hive-pool";
import { ENGINE_VERSION, JAMES_LEVELS, type ThinkProgress } from "@/lib/james-engine/types";
import { cn } from "@/lib/utils";

type Screen = "menu" | "play";
type Side = "w" | "b";
type Phase = "player" | "engine" | "over";

const queryClient = new QueryClient();

function fmtScore(score: number, mate: number | null) {
  if (mate !== null) return `M${mate}`;
  const n = score / 100;
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
}

function statusText(chess: Chess, phase: Phase, playerSide: Side, lanes: number) {
  if (chess.isCheckmate()) return `${chess.turn() === "w" ? "Black" : "White"} mates`;
  if (chess.isStalemate()) return "Stalemate";
  if (chess.isThreefoldRepetition()) return "Draw by repetition";
  if (chess.isInsufficientMaterial()) return "Draw — insufficient material";
  if (chess.isDraw()) return "Draw";
  if (phase === "over") return "You resigned";
  if (phase === "engine") return lanes > 1 ? `${lanes} James processes searching` : "James is searching";
  if (chess.isCheck()) return "Check";
  return chess.turn() === playerSide ? "Your move" : "Waiting";
}

function playTick(kind: "move" | "capture" | "end") {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = kind === "capture" ? 220 : kind === "end" ? 330 : 520;
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    o.stop(ctx.currentTime + 0.13);
    o.onended = () => ctx.close();
  } catch {
    /* autoplay blocked */
  }
}

export function JamesApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <JamesInner />
    </QueryClientProvider>
  );
}

function JamesInner() {
  const qc = useQueryClient();
  const { data: hive } = useQuery({ queryKey: ["hive"], queryFn: () => getHive(), refetchInterval: 8000 });

  const [screen, setScreen] = useState<Screen>("menu");
  const [levelNo, setLevelNo] = useState(12);
  const level = JAMES_LEVELS[levelNo - 1]!;
  const [playerSide, setPlayerSide] = useState<Side>("w");
  const [chess] = useState(() => new Chess());
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);
  const [selected, setSelected] = useState<Square | null>(null);
  const [pending, setPending] = useState<PendingPromo | null>(null);
  const [phase, setPhase] = useState<Phase>("player");
  const [progress, setProgress] = useState<ThinkProgress | null>(null);
  const [decision, setDecision] = useState<HiveDecision | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [arenaOn, setArenaOn] = useState(true);
  const [arenaStats, setArenaStats] = useState<ArenaStats>({ played: 0, gamesPerMin: 0, running: 0, lastGame: null });

  const poolRef = useRef<HivePool | null>(null);
  const arenaRef = useRef<Arena | null>(null);
  const turnToken = useRef(0);

  useEffect(() => {
    const pool = new HivePool((p) => setProgress(p));
    poolRef.current = pool;
    const arena = new Arena(
      async (games) => {
        await submitSelfPlay({ data: { games } });
        void qc.invalidateQueries({ queryKey: ["hive"] });
      },
      setArenaStats,
    );
    arenaRef.current = arena;
    return () => {
      pool.terminate();
      arena.stop();
    };
  }, [qc]);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || !hive?.variants.length) return;
    arena.setVariants(hive.variants);
    const cores = navigator.hardwareConcurrency || 4;
    if (arenaOn) arena.start(Math.max(1, Math.min(4, Math.floor(cores / 2))));
    else arena.stop();
  }, [hive, arenaOn]);

  const last = chess.history({ verbose: true }).at(-1);
  const fen = chess.fen();
  const legal: Square[] = useMemo(() => {
    if (!selected) return [];
    return chess.moves({ square: selected, verbose: true }).map((m) => m.to);
  }, [selected, fen, chess]);

  async function askEngine() {
    const pool = poolRef.current;
    const variants = hive?.variants ?? [];
    if (!pool || variants.length === 0) return;
    const token = ++turnToken.current;
    setPhase("engine");
    setSelected(null);
    const learned = level.learned ? await getLearned({ data: { fen: chess.fen() } }).catch(() => []) : [];
    if (token !== turnToken.current) return;
    const result = await pool.think(chess.fen(), level, variants, learned);
    if (token !== turnToken.current || !result) return;
    setDecision(result);
    setProgress(result.progress);
    const mv = result.move;
    if (!mv) {
      setPhase("over");
      return;
    }
    try {
      const played = chess.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
      playTick(played.captured ? "capture" : "move");
      refresh();
      if (chess.isGameOver()) {
        setPhase("over");
        playTick("end");
      } else setPhase("player");
    } catch {
      setPhase("player");
    }
  }

  function startGame(side: Side) {
    chess.reset();
    poolRef.current?.newGame();
    setPlayerSide(side);
    setFlipped(side === "b");
    setSelected(null);
    setPending(null);
    setProgress(null);
    setDecision(null);
    setScreen("play");
    setPhase("player");
    refresh();
    if (side === "b") void askEngine();
  }

  function applyMove(from: Square, to: Square, promotion?: PieceSymbol) {
    try {
      const mv = chess.move({ from, to, promotion });
      playTick(mv.captured ? "capture" : "move");
      setSelected(null);
      setPending(null);
      refresh();
      if (chess.isGameOver()) {
        setPhase("over");
        playTick("end");
        return;
      }
      void askEngine();
    } catch {
      setSelected(null);
      setPending(null);
    }
  }

  function onSquare(sq: Square) {
    if (phase !== "player" || chess.turn() !== playerSide || pending) return;
    const piece = chess.get(sq);
    if (selected) {
      const dest = chess.moves({ square: selected, verbose: true }).find((m) => m.to === sq);
      if (dest) {
        if (dest.promotion) setPending({ from: selected, to: sq });
        else applyMove(selected, sq);
        return;
      }
    }
    setSelected(piece && piece.color === playerSide ? sq : null);
  }

  function cancelThinking() {
    turnToken.current++;
    poolRef.current?.stop();
  }

  function undo() {
    if (phase === "engine") cancelThinking();
    chess.undo();
    if (chess.turn() !== playerSide && chess.history().length) chess.undo();
    setPhase(chess.isGameOver() ? "over" : "player");
    setSelected(null);
    setProgress(null);
    setDecision(null);
    refresh();
  }

  function resign() {
    if (phase === "engine") cancelThinking();
    setPhase("over");
    playTick("end");
  }

  const toggleArena = () => setArenaOn((on) => !on);
  const history = chess.history();
  const pairs: { n: number; w?: string; b?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) pairs.push({ n: i / 2 + 1, w: history[i], b: history[i + 1] });

  if (screen === "menu") {
    return (
      <main className="mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            v{ENGINE_VERSION} · Hawthorne · Robinson · James
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.6rem,8vw,4.6rem)] leading-[0.95] tracking-[-0.04em] text-fg">
            James Engine
          </h1>
          <p className="mt-5 max-w-lg text-pretty leading-relaxed text-muted">
            A population of James processes that never stops. Variants play each other around the clock,
            every game is stored and folded into a compressed position tree, the weakest are culled and
            the strongest are bred together. Higher levels send more processes at once and refuse to settle
            for a draw.
          </p>
          <div className="mt-8 max-w-lg rounded-[var(--radius-lg)] bg-surface p-5 ring-1 ring-line">
            <LevelPicker value={levelNo} onChange={setLevelNo} />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => startGame("w")} className="sm:min-w-44" disabled={!hive}>
              Play white
            </Button>
            <Button size="lg" variant="secondary" onClick={() => startGame("b")} className="sm:min-w-44" disabled={!hive}>
              Play black
            </Button>
          </div>
        </div>
        <HivePanel hive={hive} arena={arenaStats} arenaOn={arenaOn} onToggle={toggleArena} />
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8 lg:px-6 lg:py-8">
      <section className="relative">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Level {level.level} · {level.name}
            </p>
            <h1 className="font-display text-2xl tracking-[-0.03em] md:text-3xl">
              {statusText(chess, phase, playerSide, level.lanes)}
            </h1>
          </div>
          <p className="font-mono text-xs text-subtle">gen {hive?.topGeneration ?? 1}</p>
        </header>
        <div className="relative">
          <Board
            chess={chess}
            flipped={flipped}
            selected={selected}
            legal={legal}
            lastFrom={last?.from}
            lastTo={last?.to}
            disabled={phase !== "player"}
            onSquare={onSquare}
          />
          {pending ? (
            <Promotion
              color={playerSide}
              onPick={(p) => applyMove(pending.from, pending.to, p)}
              onCancel={() => setPending(null)}
            />
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={undo} disabled={!history.length}>
            <Undo2 className="size-4" />
            Undo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setFlipped((f) => !f)}>
            Flip
          </Button>
          <Button variant="ghost" size="sm" onClick={resign} disabled={phase === "over"}>
            Resign
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              cancelThinking();
              setScreen("menu");
              setPhase("player");
            }}
          >
            <RotateCcw className="size-4" />
            Menu
          </Button>
        </div>
      </section>

      <aside className="flex flex-col gap-4 pb-8 lg:sticky lg:top-6">
        <div className="rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Hive verdict</p>
            <span className={cn("text-xs", phase === "engine" ? "text-warn" : "text-muted")}>
              {phase === "engine" ? "searching" : decision ? `${Math.round(decision.consensus * 100)}% agree` : "idle"}
            </span>
          </div>
          <p className="mt-2 font-display text-4xl tracking-[-0.04em] tabular-nums">
            {progress ? fmtScore(progress.score, progress.mate) : "—"}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            d{progress?.depth ?? 0} · {((decision?.totalNodes ?? progress?.nodes ?? 0) / 1000).toFixed(1)}k nodes ·{" "}
            {progress?.nps ?? 0} nps
          </p>
          <p className="mt-3 min-h-10 font-mono text-[12px] leading-relaxed text-fg/90">
            {progress?.pv.length ? progress.pv.slice(0, 12).join("  ") : "Principal variation appears here."}
          </p>
          {decision?.lanes.length ? (
            <ol className="mt-3 flex flex-col gap-1 border-t border-line pt-3 font-mono text-[11px]">
              {decision.lanes.map((l, i) => (
                <li key={i} className="grid grid-cols-[1fr_auto_auto] gap-2">
                  <span className="truncate text-muted">{l.variant}</span>
                  <span className="text-fg">{l.move ?? "—"}</span>
                  <span className="w-12 text-right tabular-nums text-subtle">{fmtScore(l.score, null)}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        <JamesGraph progress={progress} thinking={phase === "engine"} />

        <div className="rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line">
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <Swords className="size-3" />
            Moves
          </p>
          <ol className="max-h-40 overflow-auto font-mono text-[12px] leading-6">
            {pairs.length === 0 ? <li className="text-subtle">No moves yet</li> : null}
            {pairs.map((p) => (
              <li key={p.n} className="grid grid-cols-[2rem_1fr_1fr] gap-2">
                <span className="text-subtle">{p.n}.</span>
                <span>{p.w}</span>
                <span>{p.b}</span>
              </li>
            ))}
          </ol>
        </div>

        <HivePanel hive={hive} arena={arenaStats} arenaOn={arenaOn} onToggle={toggleArena} compact />
      </aside>
    </main>
  );
}
