import { useEffect, useRef } from "react";
import type { ThinkProgress } from "@/lib/james-engine/types";

type Node = { x: number; y: number; r: number; cycle: boolean; life: number };

type Props = { progress: ThinkProgress | null; thinking: boolean };

export function JamesGraph({ progress, thinking }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
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
        const cycle = Math.random() < 0.12;
        nodes.push({
          x: parent ? parent.x + (Math.random() - 0.5) * 48 : w * 0.5,
          y: parent ? parent.y + 10 + Math.random() * 18 : 16,
          r: cycle ? 2.2 : 1.6 + Math.random(),
          cycle,
          life: 0,
        });
      }
      if (nodes.length > target) nodes.length = target;

      ctx.strokeStyle = "rgba(197,207,196,0.16)";
      ctx.lineWidth = 1;
      for (let i = 1; i < nodes.length; i++) {
        const a = nodes[i]!;
        const p = nodes[Math.max(0, i - 1 - (i % 3))]!;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(a.x, a.y);
        ctx.stroke();
        a.life += 0.02;
        if (thinking) {
          a.x += Math.sin(a.life + i) * 0.12;
          a.y = Math.min(h - 8, a.y + 0.04);
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

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-md)] bg-elevated ring-1 ring-line">
      <canvas ref={canvasRef} className="h-36 w-full md:h-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">James graph</p>
        <p className="font-mono text-[10px] text-muted">
          {j ? `J ${j.J ?? "—"} · R ${j.R} · |H| ${j.H.length}` : "awaiting growth"}
        </p>
      </div>
    </div>
  );
}
