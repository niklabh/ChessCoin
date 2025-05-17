declare module 'chess.js' {
  export type Color = 'w' | 'b';
  export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  export type Square = string; // e.g. "a1", "h8"
  
  export interface Piece {
    type: PieceSymbol;
    color: Color;
  }
  
  export interface Move {
    from: Square;
    to: Square;
    promotion?: PieceSymbol;
    color: Color;
    flags: string;
    piece: PieceSymbol;
    san: string;
    captured?: PieceSymbol;
    capturedSquare?: Square;
  }
  
  export interface ChessInstance {
    board(): (Piece | null)[][];
    load(fen: string): boolean;
    fen(): string;
    reset(): void;
    moves(options?: { square?: Square; verbose?: boolean }): string[] | Move[];
    move(move: { from: Square; to: Square; promotion?: PieceSymbol } | string): Move;
    undo(): Move | null;
    turn(): Color;
    get(square: Square): Piece | null;
    put(piece: Piece, square: Square): boolean;
    remove(square: Square): Piece | null;
    inCheck(): boolean;
    isCheckmate(): boolean;
    isStalemate(): boolean;
    isDraw(): boolean;
    isThreefoldRepetition(): boolean;
    isInsufficientMaterial(): boolean;
    isGameOver(): boolean;
    history(options?: { verbose?: boolean }): string[] | Move[];
    pgn(options?: any): string;
    loadPgn(pgn: string, options?: any): boolean;
    header(...args: string[]): object;
    ascii(): string;
    clear(): void;
  }
  
  export default class Chess implements ChessInstance {
    constructor(fen?: string);
    board(): (Piece | null)[][];
    load(fen: string): boolean;
    fen(): string;
    reset(): void;
    moves(options?: { square?: Square; verbose?: boolean }): string[] | Move[];
    move(move: { from: Square; to: Square; promotion?: PieceSymbol } | string): Move;
    undo(): Move | null;
    turn(): Color;
    get(square: Square): Piece | null;
    put(piece: Piece, square: Square): boolean;
    remove(square: Square): Piece | null;
    inCheck(): boolean;
    isCheckmate(): boolean;
    isStalemate(): boolean;
    isDraw(): boolean;
    isThreefoldRepetition(): boolean;
    isInsufficientMaterial(): boolean;
    isGameOver(): boolean;
    history(options?: { verbose?: boolean }): string[] | Move[];
    pgn(options?: any): string;
    loadPgn(pgn: string, options?: any): boolean;
    header(...args: string[]): object;
    ascii(): string;
    clear(): void;
  }
}
