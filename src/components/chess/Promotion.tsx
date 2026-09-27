import type { PieceSymbol, Square } from "chess.js";
import { ChessPiece } from "./pieces";

const OPTIONS: PieceSymbol[] = ["q", "r", "b", "n"];

type Props = {
  color: "w" | "b";
  onPick: (p: PieceSymbol) => void;
  onCancel: () => void;
};

export function Promotion({ color, onPick, onCancel }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-4">
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-4 ring-1 ring-line">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Promote</p>
        <div className="flex gap-2">
          {OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPick(p)}
              className="flex size-14 items-center justify-center rounded-[var(--radius-md)] bg-elevated ring-1 ring-line hover:bg-line"
              aria-label={`Promote to ${p}`}
            >
              <ChessPiece type={p} color={color} className="size-10" />
            </button>
          ))}
        </div>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-fg">
          Cancel
        </button>
      </div>
    </div>
  );
}

export type PendingPromo = { from: Square; to: Square };
