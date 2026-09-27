import { Chess, type Piece, type Square } from "chess.js";
import { ChessPiece } from "./pieces";
import { cn } from "@/lib/utils";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

type Props = {
  chess: Chess;
  flipped: boolean;
  selected: Square | null;
  legal: Square[];
  lastFrom?: Square | null;
  lastTo?: Square | null;
  disabled?: boolean;
  onSquare: (sq: Square) => void;
};

export function Board({ chess, flipped, selected, legal, lastFrom, lastTo, disabled, onSquare }: Props) {
  const files = flipped ? [...FILES].reverse() : [...FILES];
  const ranks = flipped ? [...RANKS].reverse() : [...RANKS];
  const legalSet = new Set(legal);
  const inCheck = chess.isCheck();
  const turn = chess.turn();

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[var(--radius-lg)]",
          "shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)] ring-1 ring-line",
        )}
        role="grid"
        aria-label="Chessboard"
      >
        {ranks.map((rank, ri) =>
          files.map((file, fi) => {
            const sq = `${file}${rank}` as Square;
            const dark = (fi + ri) % 2 === 1;
            const piece = chess.get(sq) as Piece | undefined;
            const isSel = selected === sq;
            const isLast = sq === lastFrom || sq === lastTo;
            const isLegal = legalSet.has(sq);
            const isKingCheck = inCheck && piece?.type === "k" && piece.color === turn;

            return (
              <button
                key={sq}
                type="button"
                role="gridcell"
                aria-label={piece ? `${piece.color === "w" ? "White" : "Black"} ${piece.type} on ${sq}` : sq}
                disabled={disabled}
                onClick={() => onSquare(sq)}
                className={cn(
                  "relative flex items-center justify-center",
                  dark ? "bg-board-dark" : "bg-board-light",
                  isLast && (dark ? "bg-board-dark-hot" : "bg-board-light-hot"),
                  isSel && "ring-2 ring-inset ring-accent",
                  isKingCheck && "bg-bad/55",
                  "disabled:cursor-default",
                )}
              >
                {piece ? (
                  <ChessPiece
                    type={piece.type}
                    color={piece.color}
                    className="relative z-[1] size-[78%] max-md:size-[86%]"
                  />
                ) : null}
                {isLegal && !piece ? (
                  <span className="size-[22%] rounded-full bg-board-ink/28" />
                ) : null}
                {isLegal && piece ? (
                  <span className="absolute inset-[6%] rounded-full ring-[3px] ring-board-ink/35" />
                ) : null}
                {fi === 0 ? (
                  <span
                    className={cn(
                      "absolute left-1 top-0.5 font-mono text-[10px] font-medium",
                      dark ? "text-board-light/70" : "text-board-ink/50",
                    )}
                  >
                    {rank}
                  </span>
                ) : null}
                {ri === 7 ? (
                  <span
                    className={cn(
                      "absolute right-1 bottom-0.5 font-mono text-[10px] font-medium",
                      dark ? "text-board-light/70" : "text-board-ink/50",
                    )}
                  >
                    {file}
                  </span>
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
