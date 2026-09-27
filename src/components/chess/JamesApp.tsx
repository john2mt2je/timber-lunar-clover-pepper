import { Chess, type PieceSymbol, type Square } from "chess.js";
import { RotateCcw, Swords, Undo2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "./Board";
import { JamesGraph } from "./JamesGraph";
import { Promotion, type PendingPromo } from "./Promotion";
import { Button } from "@/components/ui/button";
import { createEngine, type EngineHandle } from "@/lib/james-engine/client";
import { defaultGenome, evolveGenome, loadGenome } from "@/lib/james-engine/evolve";
import {
  MODE_MS,
  type Genome,
  type ThinkMode,
  type ThinkProgress,
} from "@/lib/james-engine/types";
import { cn } from "@/lib/utils";

type Screen = "menu" | "play";
type Side = "w" | "b";
type Phase = "player" | "engine" | "over";

function fmtScore(p: ThinkProgress | null) {
  if (!p) return "—";
  if (p.mate !== null) return p.mate > 0 ? `M${p.mate}` : `M${p.mate}`;
  const n = p.score / 100;
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
}

function statusText(chess: Chess, phase: Phase, playerSide: Side) {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "Black" : "White";
    return `${winner} mates`;
  }
  if (chess.isStalemate()) return "Stalemate";
  if (chess.isThreefoldRepetition()) return "Draw by repetition";
  if (chess.isInsufficientMaterial()) return "Draw — insufficient material";
  if (chess.isDrawByFiftyMoves()) return "Draw — 50 moves";
  if (chess.isDraw()) return "Draw";
  if (phase === "engine") return "James is growing the graph";
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
    /* autoplay */
  }
}

export function JamesApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [playerSide, setPlayerSide] = useState<Side>("w");
  const [mode, setMode] = useState<ThinkMode>("sure");
  const [chess] = useState(() => new Chess());
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);
  const [selected, setSelected] = useState<Square | null>(null);
  const [pending, setPending] = useState<PendingPromo | null>(null);
  const [phase, setPhase] = useState<Phase>("player");
  const [progress, setProgress] = useState<ThinkProgress | null>(null);
  const [genome, setGenome] = useState<Genome>(() =>
    typeof window === "undefined" ? defaultGenome() : loadGenome(),
  );
  const [flipped, setFlipped] = useState(false);
  const engineRef = useRef<EngineHandle | null>(null);
  const phaseRef = useRef<Phase>("player");
  const evolvedForPgn = useRef<string | null>(null);
  const resignedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const engine = createEngine({
      onProgress: (p) => setProgress(p),
      onBest: (p) => {
        setProgress(p);
        if (phaseRef.current !== "engine") return;
        const mv = p.bestMove;
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
          } else {
            setPhase("player");
          }
        } catch {
          setPhase("player");
        }
      },
    });
    engineRef.current = engine;
    return () => engine.terminate();
  }, [chess]);

  useEffect(() => {
    if (screen !== "play" || phase !== "over") return;
    const pgn = chess.pgn();
    if (evolvedForPgn.current === pgn) return;
    evolvedForPgn.current = pgn;
    let result: "win" | "loss" | "draw" = "draw";
    if (resignedRef.current) {
      result = "win";
    } else if (chess.isCheckmate()) {
      const engineColor = playerSide === "w" ? "b" : "w";
      const winner = chess.turn() === "w" ? "b" : "w";
      result = winner === engineColor ? "win" : "loss";
    }
    const next = evolveGenome(genome, result);
    setGenome(next);
  }, [screen, phase, chess, genome, playerSide]);

  const last = chess.history({ verbose: true }).at(-1);
  const legal: Square[] = useMemo(() => {
    if (!selected) return [];
    return chess.moves({ square: selected, verbose: true }).map((m) => m.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, chess.fen()]);

  function startGame(side: Side, think: ThinkMode) {
    chess.reset();
    engineRef.current?.newGame();
    setPlayerSide(side);
    setMode(think);
    setFlipped(side === "b");
    setSelected(null);
    setPending(null);
    setProgress(null);
    evolvedForPgn.current = null;
    resignedRef.current = false;
    setScreen("play");
    if (side === "b") {
      setPhase("engine");
      engineRef.current?.think(chess.fen(), think, genome);
    } else {
      setPhase("player");
    }
    refresh();
  }

  function askEngine() {
    setPhase("engine");
    setSelected(null);
    engineRef.current?.think(chess.fen(), mode, genome);
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
      askEngine();
    } catch {
      setSelected(null);
      setPending(null);
    }
  }

  function onSquare(sq: Square) {
    if (phase !== "player" || chess.turn() !== playerSide) return;
    if (pending) return;
    const piece = chess.get(sq);
    if (selected) {
      const dest = chess.moves({ square: selected, verbose: true }).find((m) => m.to === sq);
      if (dest) {
        if (dest.promotion) {
          setPending({ from: selected, to: sq });
          return;
        }
        applyMove(selected, sq);
        return;
      }
    }
    if (piece && piece.color === playerSide) setSelected(sq);
    else setSelected(null);
  }

  function undo() {
    if (phase === "engine") engineRef.current?.stop();
    chess.undo();
    if (chess.turn() !== playerSide && chess.history().length) chess.undo();
    setPhase(chess.isGameOver() ? "over" : "player");
    setSelected(null);
    setProgress(null);
    refresh();
  }

  function resign() {
    if (phase === "engine") engineRef.current?.stop();
    resignedRef.current = true;
    setPhase("over");
    playTick("end");
  }

  const history = chess.history();
  const pairs: { n: number; w?: string; b?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({ n: i / 2 + 1, w: history[i], b: history[i + 1] });
  }

  if (screen === "menu") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Hawthorne · Robinson · James
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,8vw,4.6rem)] leading-[0.95] tracking-[-0.04em] text-fg">
          James Engine
        </h1>
        <p className="mt-5 max-w-md text-pretty text-muted leading-relaxed">
          A chess engine grown as a James Process. Positions reproduce after every edge,
          transposition cycles compress the tree into a packed bit table, and the evaluation
          genome mutates after each game. It does not move until the eval is sure.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {(Object.keys(MODE_MS) as ThinkMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "h-10 rounded-full px-4 text-sm ring-1 ring-line",
                mode === m ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg",
              )}
            >
              {MODE_MS[m].label}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-xs text-subtle">{MODE_MS[mode].hint}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => startGame("w", mode)} className="sm:min-w-44">
            Play white
          </Button>
          <Button size="lg" variant="secondary" onClick={() => startGame("b", mode)} className="sm:min-w-44">
            Play black
          </Button>
        </div>
        <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Generation</dt>
            <dd className="mt-1 font-display text-2xl">{genome.generation}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Games</dt>
            <dd className="mt-1 font-display text-2xl">{genome.games}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">W–L–D</dt>
            <dd className="mt-1 font-display text-2xl">
              {genome.wins}–{genome.losses}–{genome.draws}
            </dd>
          </div>
        </dl>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8 lg:px-6 lg:py-8">
      <section className="relative">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">James Engine</p>
            <h1 className="font-display text-2xl tracking-[-0.03em] md:text-3xl">
              {statusText(chess, phase, playerSide)}
            </h1>
          </div>
          <p className="font-mono text-xs text-subtle">gen {genome.generation}</p>
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
          <Button variant="secondary" size="sm" onClick={undo} disabled={!history.length || phase === "engine"}>
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
              engineRef.current?.stop();
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
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Search</p>
            <span className={cn("text-xs", progress?.sure ? "text-good" : "text-warn")}>
              {phase === "engine" ? (progress?.sure ? "sure" : "growing") : phase === "over" ? "halted" : "idle"}
            </span>
          </div>
          <p className="mt-2 font-display text-4xl tracking-[-0.04em] tabular-nums">{fmtScore(progress)}</p>
          <p className="mt-1 font-mono text-xs text-muted">
            d{progress?.depth ?? 0} · sel {progress?.seldepth ?? 0} ·{" "}
            {progress ? `${(progress.nodes / 1000).toFixed(1)}k` : "0"} n · {progress?.nps ?? 0} nps
          </p>
          <p className="mt-3 min-h-10 font-mono text-[12px] leading-relaxed text-fg/90">
            {progress?.pv.length ? progress.pv.slice(0, 14).join("  ") : "Principal variation appears as the graph compresses."}
          </p>
          {progress?.james ? (
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 font-mono text-[11px]">
              <div>
                <dt className="text-subtle">James J</dt>
                <dd>{progress.james.J ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-subtle">Robinson R</dt>
                <dd>{progress.james.R}</dd>
              </div>
              <div>
                <dt className="text-subtle">Cycles</dt>
                <dd>{progress.james.cycles.toLocaleString()}</dd>
              </div>
              <div className="col-span-3 text-subtle">
                Packed TT {(progress.james.packedBytes / 1024).toFixed(0)} KB · unique{" "}
                {progress.james.unique.toLocaleString()}
              </div>
            </dl>
          ) : null}
        </div>

        <JamesGraph progress={progress} thinking={phase === "engine"} />

        <div className="rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Lineage</p>
          <p className="mt-2 max-h-24 overflow-auto font-mono text-[11px] leading-relaxed text-muted">
            {progress?.lineage.length
              ? progress.lineage.slice(0, 40).join(" ")
              : "After each iteration the process walks the principal line until a cycle, mate, or horizon."}
          </p>
          {progress?.lineageEnd ? (
            <p className="mt-2 text-[11px] text-subtle">Ends in {progress.lineageEnd}</p>
          ) : null}
        </div>

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
      </aside>
    </main>
  );
}
