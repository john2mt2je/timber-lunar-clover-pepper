import type { ReactNode } from "react";
import type { PieceSymbol } from "chess.js";

type Props = { type: PieceSymbol; color: "w" | "b"; className?: string };

const ink = {
  w: { fill: "#f3efe4", stroke: "#2a2c26" },
  b: { fill: "#1c1e1a", stroke: "#d8d3c6" },
};

function G({
  color,
  children,
  className,
}: {
  color: "w" | "b";
  children: ReactNode;
  className?: string;
}) {
  const c = ink[color];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill={c.fill} stroke={c.stroke} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  );
}

export function ChessPiece({ type, color, className }: Props) {
  switch (type) {
    case "p":
      return (
        <G color={color} className={className}>
          <circle cx="50" cy="32" r="11" />
          <path d="M36 48c8-6 20-6 28 0 2 8-2 14-6 16H42c-4-2-8-8-6-16z" />
          <path d="M28 82h44l-6-14H34z" />
        </G>
      );
    case "n":
      return (
        <G color={color} className={className}>
          <path d="M78 82H24c2-8 8-12 14-16 2-10-2-22 6-32 4-6 12-10 18-8 4 8 12 12 16 22 4 10 2 22-0 34z" />
          <path d="M38 38c-8-2-14 4-18 10 6-2 12 0 16 4" fill="none" />
          <circle cx="40" cy="34" r="2.2" fill={ink[color].stroke} stroke="none" />
        </G>
      );
    case "b":
      return (
        <G color={color} className={className}>
          <circle cx="50" cy="20" r="6" />
          <path d="M50 28c12 10 18 22 18 34 0 8-8 12-18 12s-18-4-18-12c0-12 6-24 18-34z" />
          <path d="M42 48h16M50 40v18" fill="none" />
          <path d="M28 82h44l-6-12H34z" />
        </G>
      );
    case "r":
      return (
        <G color={color} className={className}>
          <path d="M26 26h10v10h6V26h10v10h6V26h10v16H26z" />
          <path d="M30 42h40v22H30z" />
          <path d="M26 82h48l-4-14H30z" />
        </G>
      );
    case "q":
      return (
        <G color={color} className={className}>
          <circle cx="22" cy="26" r="5" />
          <circle cx="50" cy="18" r="5" />
          <circle cx="78" cy="26" r="5" />
          <path d="M22 26 L34 58 L50 30 L66 58 L78 26 L70 64 H30z" />
          <path d="M28 82h44l-5-14H33z" />
        </G>
      );
    case "k":
      return (
        <G color={color} className={className}>
          <path d="M50 14v16M42 22h16" fill="none" strokeWidth="4" />
          <path d="M32 40h36l-4 24H36z" />
          <path d="M28 82h44l-5-14H33z" />
          <circle cx="50" cy="36" r="7" />
        </G>
      );
  }
}
