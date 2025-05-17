import { PieceSymbol, Color, Square } from "chess.js";

export interface ChessPiece {
  type: PieceSymbol;
  color: Color;
  square: Square;
  file?: number;
  rank?: number;
}

export interface BoardPosition {
  x: number;
  y: number;
  z: number;
}

export interface DragState {
  piece: ChessPiece;
  origin: BoardPosition;
  current: BoardPosition;
}
