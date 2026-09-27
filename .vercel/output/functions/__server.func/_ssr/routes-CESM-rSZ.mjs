import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as RotateCcw, r as Swords, t as Undo2 } from "../_libs/lucide-react.mjs";
import { t as Chess } from "../_libs/chess.js.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CESM-rSZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ink = {
	w: {
		fill: "#f3efe4",
		stroke: "#2a2c26"
	},
	b: {
		fill: "#1c1e1a",
		stroke: "#d8d3c6"
	}
};
function G({ color, children, className }) {
	const c = ink[color];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 100 100",
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			fill: c.fill,
			stroke: c.stroke,
			strokeWidth: "3.2",
			strokeLinejoin: "round",
			strokeLinecap: "round",
			children
		})
	});
}
function ChessPiece({ type, color, className }) {
	switch (type) {
		case "p": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(G, {
			color,
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "32",
					r: "11"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M36 48c8-6 20-6 28 0 2 8-2 14-6 16H42c-4-2-8-8-6-16z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M28 82h44l-6-14H34z" })
			]
		});
		case "n": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(G, {
			color,
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M78 82H24c2-8 8-12 14-16 2-10-2-22 6-32 4-6 12-10 18-8 4 8 12 12 16 22 4 10 2 22-0 34z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M38 38c-8-2-14 4-18 10 6-2 12 0 16 4",
					fill: "none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "40",
					cy: "34",
					r: "2.2",
					fill: ink[color].stroke,
					stroke: "none"
				})
			]
		});
		case "b": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(G, {
			color,
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "20",
					r: "6"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M50 28c12 10 18 22 18 34 0 8-8 12-18 12s-18-4-18-12c0-12 6-24 18-34z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M42 48h16M50 40v18",
					fill: "none"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M28 82h44l-6-12H34z" })
			]
		});
		case "r": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(G, {
			color,
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M26 26h10v10h6V26h10v10h6V26h10v16H26z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M30 42h40v22H30z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M26 82h48l-4-14H30z" })
			]
		});
		case "q": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(G, {
			color,
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "22",
					cy: "26",
					r: "5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "18",
					r: "5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "78",
					cy: "26",
					r: "5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M22 26 L34 58 L50 30 L66 58 L78 26 L70 64 H30z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M28 82h44l-5-14H33z" })
			]
		});
		case "k": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(G, {
			color,
			className,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M50 14v16M42 22h16",
					fill: "none",
					strokeWidth: "4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M32 40h36l-4 24H36z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M28 82h44l-5-14H33z" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "36",
					r: "7"
				})
			]
		});
	}
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var FILES = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h"
];
var RANKS = [
	8,
	7,
	6,
	5,
	4,
	3,
	2,
	1
];
function Board({ chess, flipped, selected, legal, lastFrom, lastTo, disabled, onSquare }) {
	const files = flipped ? [...FILES].reverse() : [...FILES];
	const ranks = flipped ? [...RANKS].reverse() : [...RANKS];
	const legalSet = new Set(legal);
	const inCheck = chess.isCheck();
	const turn = chess.turn();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[var(--radius-lg)]", "shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)] ring-1 ring-line"),
			role: "grid",
			"aria-label": "Chessboard",
			children: ranks.map((rank, ri) => files.map((file, fi) => {
				const sq = `${file}${rank}`;
				const dark = (fi + ri) % 2 === 1;
				const piece = chess.get(sq);
				const isSel = selected === sq;
				const isLast = sq === lastFrom || sq === lastTo;
				const isLegal = legalSet.has(sq);
				const isKingCheck = inCheck && piece?.type === "k" && piece.color === turn;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					role: "gridcell",
					"aria-label": piece ? `${piece.color === "w" ? "White" : "Black"} ${piece.type} on ${sq}` : sq,
					disabled,
					onClick: () => onSquare(sq),
					className: cn("relative flex items-center justify-center", dark ? "bg-board-dark" : "bg-board-light", isLast && (dark ? "bg-board-dark-hot" : "bg-board-light-hot"), isSel && "ring-2 ring-inset ring-accent", isKingCheck && "bg-bad/55", "disabled:cursor-default"),
					children: [
						piece ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChessPiece, {
							type: piece.type,
							color: piece.color,
							className: "relative z-[1] size-[78%] max-md:size-[86%]"
						}) : null,
						isLegal && !piece ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-[22%] rounded-full bg-board-ink/28" }) : null,
						isLegal && piece ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-[6%] rounded-full ring-[3px] ring-board-ink/35" }) : null,
						fi === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("absolute left-1 top-0.5 font-mono text-[10px] font-medium", dark ? "text-board-light/70" : "text-board-ink/50"),
							children: rank
						}) : null,
						ri === 7 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("absolute right-1 bottom-0.5 font-mono text-[10px] font-medium", dark ? "text-board-light/70" : "text-board-ink/50"),
							children: file
						}) : null
					]
				}, sq);
			}))
		})
	});
}
function JamesGraph({ progress, thinking }) {
	const canvasRef = (0, import_react.useRef)(null);
	const nodesRef = (0, import_react.useRef)([]);
	const rafRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const loop = () => {
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;
			if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
				canvas.width = Math.floor(w * dpr);
				canvas.height = Math.floor(h * dpr);
			}
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
			const nodes = nodesRef.current;
			const target = Math.min(220, Math.floor((progress?.nodes ?? 0) / 180) + (thinking ? 12 : 8));
			while (nodes.length < target) {
				const parent = nodes.length ? nodes[Math.floor(Math.random() * Math.min(nodes.length, 40))] : null;
				const cycle = Math.random() < .12;
				nodes.push({
					x: parent ? parent.x + (Math.random() - .5) * 48 : w * .5,
					y: parent ? parent.y + 10 + Math.random() * 18 : 16,
					r: cycle ? 2.2 : 1.6 + Math.random(),
					cycle,
					life: 0
				});
			}
			if (nodes.length > target) nodes.length = target;
			ctx.strokeStyle = "rgba(197,207,196,0.16)";
			ctx.lineWidth = 1;
			for (let i = 1; i < nodes.length; i++) {
				const a = nodes[i];
				const p = nodes[Math.max(0, i - 1 - i % 3)];
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(a.x, a.y);
				ctx.stroke();
				a.life += .02;
				if (thinking) {
					a.x += Math.sin(a.life + i) * .12;
					a.y = Math.min(h - 8, a.y + .04);
				}
			}
			for (const n of nodes) {
				ctx.beginPath();
				ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
				ctx.fillStyle = n.cycle ? "rgba(181,107,90,0.85)" : "rgba(197,207,196,0.7)";
				ctx.fill();
			}
			rafRef.current = requestAnimationFrame(loop);
		};
		rafRef.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafRef.current);
	}, [progress?.nodes, thinking]);
	const j = progress?.james;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-[var(--radius-md)] bg-elevated ring-1 ring-line",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "h-36 w-full md:h-40"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-muted",
				children: "James graph"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] text-muted",
				children: j ? `J ${j.J ?? "—"} · R ${j.R} · |H| ${j.H.length}` : "awaiting growth"
			})]
		})]
	});
}
var OPTIONS = [
	"q",
	"r",
	"b",
	"n"
];
function Promotion({ color, onPick, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.18em] text-muted",
					children: "Promote"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: OPTIONS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onPick(p),
						className: "flex size-14 items-center justify-center rounded-[var(--radius-md)] bg-elevated ring-1 ring-line hover:bg-line",
						"aria-label": `Promote to ${p}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChessPiece, {
							type: p,
							color,
							className: "size-10"
						})
					}, p))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onCancel,
					className: "text-xs text-muted hover:text-fg",
					children: "Cancel"
				})
			]
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-accent/90",
			secondary: "bg-elevated text-fg border border-line hover:bg-elevated/80",
			ghost: "text-muted hover:text-fg hover:bg-elevated",
			danger: "bg-bad/15 text-bad hover:bg-bad/25"
		},
		size: {
			default: "h-11 px-4 text-sm rounded-[var(--radius-md)]",
			sm: "h-9 px-3 text-xs rounded-[var(--radius-sm)]",
			lg: "h-12 px-5 text-sm rounded-[var(--radius-md)]",
			icon: "size-11 rounded-[var(--radius-md)]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function createEngine(handlers) {
	const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
	worker.onmessage = (e) => {
		const msg = e.data;
		if (msg.type === "progress") handlers.onProgress(msg.data);
		else if (msg.type === "bestmove") handlers.onBest(msg.data);
		else if (msg.type === "ready") handlers.onReady?.();
	};
	const send = (msg) => worker.postMessage(msg);
	return {
		think: (fen, mode, genome) => send({
			type: "think",
			req: {
				fen,
				mode,
				genome
			}
		}),
		stop: () => send({ type: "stop" }),
		newGame: () => send({ type: "newGame" }),
		terminate: () => worker.terminate()
	};
}
var PST_LEN = 384;
var DEFAULT_TERMS = {
	mobility: 3,
	bishopPair: 42,
	kingSafety: 16,
	passedPawn: 18,
	isolatedPawn: -12,
	doubledPawn: -10,
	tempo: 8
};
function defaultGenome() {
	return {
		generation: 1,
		games: 0,
		wins: 0,
		losses: 0,
		draws: 0,
		pstDelta: new Array(PST_LEN).fill(0),
		terms: { ...DEFAULT_TERMS }
	};
}
function loadGenome() {
	try {
		const raw = localStorage.getItem("james-engine-genome-v1");
		if (!raw) return defaultGenome();
		const g = JSON.parse(raw);
		if (!Array.isArray(g.pstDelta) || g.pstDelta.length !== PST_LEN) return defaultGenome();
		return {
			...defaultGenome(),
			...g,
			pstDelta: g.pstDelta.map((n) => clamp(n | 0, -48, 48)),
			terms: {
				...DEFAULT_TERMS,
				...g.terms ?? {}
			}
		};
	} catch {
		return defaultGenome();
	}
}
function saveGenome(g) {
	try {
		localStorage.setItem("james-engine-genome-v1", JSON.stringify(g));
	} catch {}
}
function clamp(n, lo, hi) {
	return n < lo ? lo : n > hi ? hi : n;
}
function randInt(a, b) {
	return a + Math.floor(Math.random() * (b - a + 1));
}
/** Nudge evaluation after a finished game. Engine plays as `engineColor`. */
function evolveGenome(g, result) {
	const next = {
		...g,
		generation: g.generation + 1,
		games: g.games + 1,
		wins: g.wins + (result === "win" ? 1 : 0),
		losses: g.losses + (result === "loss" ? 1 : 0),
		draws: g.draws + (result === "draw" ? 1 : 0),
		pstDelta: g.pstDelta.slice(),
		terms: { ...g.terms }
	};
	const mutateCount = result === "loss" ? 18 : result === "draw" ? 8 : 6;
	const amp = result === "loss" ? 6 : 3;
	for (let i = 0; i < mutateCount; i++) {
		const idx = randInt(0, 383);
		next.pstDelta[idx] = clamp(next.pstDelta[idx] + randInt(-amp, amp), -48, 48);
	}
	const keys = Object.keys(next.terms);
	const k = keys[randInt(0, keys.length - 1)];
	const delta = result === "loss" ? randInt(-3, 3) : randInt(-1, 2);
	next.terms[k] = clamp(next.terms[k] + delta, -40, 80);
	if (result === "loss") for (let i = 0; i < PST_LEN; i++) next.pstDelta[i] = Math.round(next.pstDelta[i] * .85);
	saveGenome(next);
	return next;
}
var MODE_MS = {
	flash: {
		min: 250,
		max: 400,
		label: "Flash",
		hint: "400ms burst"
	},
	standard: {
		min: 1200,
		max: 2e3,
		label: "Standard",
		hint: "2s search"
	},
	deep: {
		min: 5e3,
		max: 8e3,
		label: "Deep",
		hint: "8s horizon"
	},
	sure: {
		min: 2800,
		max: 14e3,
		label: "Until sure",
		hint: "Stops on stable eval"
	}
};
function fmtScore(p) {
	if (!p) return "—";
	if (p.mate !== null) return p.mate > 0 ? `M${p.mate}` : `M${p.mate}`;
	const n = p.score / 100;
	return `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
}
function statusText(chess, phase, playerSide) {
	if (chess.isCheckmate()) return `${chess.turn() === "w" ? "Black" : "White"} mates`;
	if (chess.isStalemate()) return "Stalemate";
	if (chess.isThreefoldRepetition()) return "Draw by repetition";
	if (chess.isInsufficientMaterial()) return "Draw — insufficient material";
	if (chess.isDrawByFiftyMoves()) return "Draw — 50 moves";
	if (chess.isDraw()) return "Draw";
	if (phase === "engine") return "James is growing the graph";
	if (chess.isCheck()) return "Check";
	return chess.turn() === playerSide ? "Your move" : "Waiting";
}
function playTick(kind) {
	try {
		const ctx = new AudioContext();
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.type = "triangle";
		o.frequency.value = kind === "capture" ? 220 : kind === "end" ? 330 : 520;
		g.gain.value = .04;
		o.connect(g);
		g.connect(ctx.destination);
		o.start();
		g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + .12);
		o.stop(ctx.currentTime + .13);
		o.onended = () => ctx.close();
	} catch {}
}
function JamesApp() {
	const [screen, setScreen] = (0, import_react.useState)("menu");
	const [playerSide, setPlayerSide] = (0, import_react.useState)("w");
	const [mode, setMode] = (0, import_react.useState)("sure");
	const [chess] = (0, import_react.useState)(() => new Chess());
	const [, bump] = (0, import_react.useState)(0);
	const refresh = () => bump((n) => n + 1);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const [phase, setPhase] = (0, import_react.useState)("player");
	const [progress, setProgress] = (0, import_react.useState)(null);
	const [genome, setGenome] = (0, import_react.useState)(() => typeof window === "undefined" ? defaultGenome() : loadGenome());
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const engineRef = (0, import_react.useRef)(null);
	const phaseRef = (0, import_react.useRef)("player");
	const evolvedForPgn = (0, import_react.useRef)(null);
	const resignedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		phaseRef.current = phase;
	}, [phase]);
	(0, import_react.useEffect)(() => {
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
					playTick(chess.move({
						from: mv.from,
						to: mv.to,
						promotion: mv.promotion
					}).captured ? "capture" : "move");
					refresh();
					if (chess.isGameOver()) {
						setPhase("over");
						playTick("end");
					} else setPhase("player");
				} catch {
					setPhase("player");
				}
			}
		});
		engineRef.current = engine;
		return () => engine.terminate();
	}, [chess]);
	(0, import_react.useEffect)(() => {
		if (screen !== "play" || phase !== "over") return;
		const pgn = chess.pgn();
		if (evolvedForPgn.current === pgn) return;
		evolvedForPgn.current = pgn;
		let result = "draw";
		if (resignedRef.current) result = "win";
		else if (chess.isCheckmate()) {
			const engineColor = playerSide === "w" ? "b" : "w";
			result = (chess.turn() === "w" ? "b" : "w") === engineColor ? "win" : "loss";
		}
		const next = evolveGenome(genome, result);
		setGenome(next);
	}, [
		screen,
		phase,
		chess,
		genome,
		playerSide
	]);
	const last = chess.history({ verbose: true }).at(-1);
	const legal = (0, import_react.useMemo)(() => {
		if (!selected) return [];
		return chess.moves({
			square: selected,
			verbose: true
		}).map((m) => m.to);
	}, [selected, chess.fen()]);
	function startGame(side, think) {
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
		} else setPhase("player");
		refresh();
	}
	function askEngine() {
		setPhase("engine");
		setSelected(null);
		engineRef.current?.think(chess.fen(), mode, genome);
	}
	function applyMove(from, to, promotion) {
		try {
			playTick(chess.move({
				from,
				to,
				promotion
			}).captured ? "capture" : "move");
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
	function onSquare(sq) {
		if (phase !== "player" || chess.turn() !== playerSide) return;
		if (pending) return;
		const piece = chess.get(sq);
		if (selected) {
			const dest = chess.moves({
				square: selected,
				verbose: true
			}).find((m) => m.to === sq);
			if (dest) {
				if (dest.promotion) {
					setPending({
						from: selected,
						to: sq
					});
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
	const pairs = [];
	for (let i = 0; i < history.length; i += 2) pairs.push({
		n: i / 2 + 1,
		w: history[i],
		b: history[i + 1]
	});
	if (screen === "menu") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.22em] text-muted",
				children: "Hawthorne · Robinson · James"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-[clamp(2.6rem,8vw,4.6rem)] leading-[0.95] tracking-[-0.04em] text-fg",
				children: "James Engine"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 max-w-md text-pretty text-muted leading-relaxed",
				children: "A chess engine grown as a James Process. Positions reproduce after every edge, transposition cycles compress the tree into a packed bit table, and the evaluation genome mutates after each game. It does not move until the eval is sure."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 flex flex-wrap gap-2",
				children: Object.keys(MODE_MS).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMode(m),
					className: cn("h-10 rounded-full px-4 text-sm ring-1 ring-line", mode === m ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"),
					children: MODE_MS[m].label
				}, m))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-xs text-subtle",
				children: MODE_MS[mode].hint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					onClick: () => startGame("w", mode),
					className: "sm:min-w-44",
					children: "Play white"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					variant: "secondary",
					onClick: () => startGame("b", mode),
					className: "sm:min-w-44",
					children: "Play black"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Generation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 font-display text-2xl",
						children: genome.generation
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Games"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 font-display text-2xl",
						children: genome.games
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "W–L–D"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "mt-1 font-display text-2xl",
						children: [
							genome.wins,
							"–",
							genome.losses,
							"–",
							genome.draws
						]
					})] })
				]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto grid min-h-dvh w-full max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8 lg:px-6 lg:py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-4 flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.2em] text-muted",
						children: "James Engine"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl tracking-[-0.03em] md:text-3xl",
						children: statusText(chess, phase, playerSide)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-subtle",
						children: ["gen ", genome.generation]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Board, {
						chess,
						flipped,
						selected,
						legal,
						lastFrom: last?.from,
						lastTo: last?.to,
						disabled: phase !== "player",
						onSquare
					}), pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Promotion, {
						color: playerSide,
						onPick: (p) => applyMove(pending.from, pending.to, p),
						onCancel: () => setPending(null)
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: undo,
							disabled: !history.length || phase === "engine",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" }), "Undo"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "sm",
							onClick: () => setFlipped((f) => !f),
							children: "Flip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: resign,
							disabled: phase === "over",
							children: "Resign"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								engineRef.current?.stop();
								setScreen("menu");
								setPhase("player");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Menu"]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex flex-col gap-4 pb-8 lg:sticky lg:top-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[10px] uppercase tracking-[0.16em] text-muted",
								children: "Search"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-xs", progress?.sure ? "text-good" : "text-warn"),
								children: phase === "engine" ? progress?.sure ? "sure" : "growing" : phase === "over" ? "halted" : "idle"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-4xl tracking-[-0.04em] tabular-nums",
							children: fmtScore(progress)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xs text-muted",
							children: [
								"d",
								progress?.depth ?? 0,
								" · sel ",
								progress?.seldepth ?? 0,
								" ·",
								" ",
								progress ? `${(progress.nodes / 1e3).toFixed(1)}k` : "0",
								" n · ",
								progress?.nps ?? 0,
								" nps"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 min-h-10 font-mono text-[12px] leading-relaxed text-fg/90",
							children: progress?.pv.length ? progress.pv.slice(0, 14).join("  ") : "Principal variation appears as the graph compresses."
						}),
						progress?.james ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 font-mono text-[11px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "James J"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: progress.james.J ?? "—" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "Robinson R"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: progress.james.R })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "Cycles"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: progress.james.cycles.toLocaleString() })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-3 text-subtle",
									children: [
										"Packed TT ",
										(progress.james.packedBytes / 1024).toFixed(0),
										" KB · unique",
										" ",
										progress.james.unique.toLocaleString()
									]
								})
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JamesGraph, {
					progress,
					thinking: phase === "engine"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-muted",
							children: "Lineage"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-h-24 overflow-auto font-mono text-[11px] leading-relaxed text-muted",
							children: progress?.lineage.length ? progress.lineage.slice(0, 40).join(" ") : "After each iteration the process walks the principal line until a cycle, mate, or horizon."
						}),
						progress?.lineageEnd ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[11px] text-subtle",
							children: ["Ends in ", progress.lineageEnd]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-3" }), "Moves"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "max-h-40 overflow-auto font-mono text-[12px] leading-6",
						children: [pairs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-subtle",
							children: "No moves yet"
						}) : null, pairs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid grid-cols-[2rem_1fr_1fr] gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-subtle",
									children: [p.n, "."]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.w }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.b })
							]
						}, p.n))]
					})]
				})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JamesApp, {});
}
//#endregion
export { Home as component };
