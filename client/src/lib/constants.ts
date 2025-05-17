import * as THREE from "three";
import { PieceSymbol } from "chess.js";

// Define piece models and their heights
export const PIECE_MODELS: Record<PieceSymbol, {
  geometry: string;
  height: number;
}> = {
  // Pawn
  p: {
    geometry: "cylinder",
    height: 0.5
  },
  // Knight
  n: {
    geometry: "knight",
    height: 0.7
  },
  // Bishop
  b: {
    geometry: "bishop",
    height: 0.8
  },
  // Rook
  r: {
    geometry: "box",
    height: 0.8
  },
  // Queen
  q: {
    geometry: "queen",
    height: 1.0
  },
  // King
  k: {
    geometry: "king",
    height: 1.2
  },
};
