import { Chess } from "chess.js";

function keyFen(fen: string) {
  return fen.split(" ").slice(0, 4).join(" ");
}

const LINES: { path: string[]; replies: string[] }[] = [
  { path: [], replies: ["e4", "d4", "Nf3", "c4"] },
  { path: ["e4"], replies: ["e5", "c5", "e6", "c6", "d6", "Nf6"] },
  { path: ["e4", "e5"], replies: ["Nf3", "Nc3", "Bc4", "f4"] },
  { path: ["e4", "e5", "Nf3"], replies: ["Nc6", "Nf6", "d6"] },
  { path: ["e4", "e5", "Nf3", "Nc6"], replies: ["Bb5", "Bc4", "d4", "Nc3"] },
  { path: ["e4", "e5", "Nf3", "Nc6", "Bb5"], replies: ["a6", "Nf6", "d6", "Bc5"] },
  { path: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"], replies: ["Ba4", "Bxc6"] },
  { path: ["e4", "e5", "Nf3", "Nc6", "Bc4"], replies: ["Nf6", "Bc5"] },
  { path: ["e4", "c5"], replies: ["Nf3", "Nc3", "c3"] },
  { path: ["e4", "c5", "Nf3"], replies: ["d6", "Nc6", "e6"] },
  { path: ["e4", "c5", "Nf3", "d6"], replies: ["d4"] },
  { path: ["e4", "c5", "Nf3", "d6", "d4"], replies: ["cxd4"] },
  { path: ["e4", "c5", "Nf3", "d6", "d4", "cxd4"], replies: ["Nxd4"] },
  { path: ["e4", "c5", "Nf3", "Nc6"], replies: ["d4", "Bb5"] },
  { path: ["e4", "c5", "Nf3", "e6"], replies: ["d4"] },
  { path: ["e4", "e6"], replies: ["d4"] },
  { path: ["e4", "e6", "d4"], replies: ["d5"] },
  { path: ["e4", "c6"], replies: ["d4"] },
  { path: ["e4", "c6", "d4"], replies: ["d5"] },
  { path: ["e4", "d6"], replies: ["d4"] },
  { path: ["e4", "Nf6"], replies: ["e5"] },
  { path: ["d4"], replies: ["d5", "Nf6", "e6", "f5"] },
  { path: ["d4", "d5"], replies: ["c4", "Nf3", "Bf4"] },
  { path: ["d4", "d5", "c4"], replies: ["e6", "c6", "dxc4"] },
  { path: ["d4", "d5", "c4", "e6"], replies: ["Nc3", "Nf3"] },
  { path: ["d4", "d5", "c4", "c6"], replies: ["Nf3", "Nc3"] },
  { path: ["d4", "Nf6"], replies: ["c4", "Nf3"] },
  { path: ["d4", "Nf6", "c4"], replies: ["e6", "g6", "c5"] },
  { path: ["d4", "Nf6", "c4", "e6"], replies: ["Nc3", "Nf3", "g3"] },
  { path: ["d4", "Nf6", "c4", "g6"], replies: ["Nc3", "Nf3"] },
  { path: ["d4", "Nf6", "c4", "g6", "Nc3"], replies: ["Bg7", "d5"] },
  { path: ["d4", "e6"], replies: ["c4", "Nf3"] },
  { path: ["Nf3"], replies: ["d5", "Nf6", "c5"] },
  { path: ["Nf3", "d5"], replies: ["d4", "g3", "c4"] },
  { path: ["Nf3", "Nf6"], replies: ["c4", "d4", "g3"] },
  { path: ["c4"], replies: ["e5", "c5", "Nf6", "e6"] },
  { path: ["c4", "e5"], replies: ["Nc3", "g3"] },
  { path: ["c4", "c5"], replies: ["Nc3", "Nf3"] },
  { path: ["c4", "Nf6"], replies: ["Nc3", "g3", "Nf3"] },
];

const TABLE: Record<string, string[]> = (() => {
  const t: Record<string, string[]> = {};
  for (const line of LINES) {
    const chess = new Chess();
    let ok = true;
    for (const san of line.path) {
      try {
        chess.move(san);
      } catch {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    t[keyFen(chess.fen())] = line.replies;
  }
  return t;
})();

export function bookMove(fen: string): string | null {
  const replies = TABLE[keyFen(fen)];
  if (!replies || replies.length === 0) return null;
  const chess = new Chess(fen);
  const legal = new Set(chess.moves());
  const filtered = replies.filter((m) => legal.has(m));
  if (filtered.length === 0) return null;
  const r = Math.random();
  if (r < 0.52) return filtered[0]!;
  if (r < 0.82 && filtered[1]) return filtered[1];
  return filtered[Math.floor(Math.random() * filtered.length)]!;
}
