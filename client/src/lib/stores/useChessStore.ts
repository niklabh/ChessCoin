import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Chess, Move, PieceSymbol, Color, Square } from "chess.js";
import { useAudio } from "./useAudio";
import { BoardPosition, ChessPiece, DragState } from "../types";

interface ChessState {
  // Chess.js instance
  game: Chess;
  
  // Game state
  selectedPiece: ChessPiece | null;
  legalMoves: Square[];
  draggedPiece: DragState | null;
  message: string;
  isGameOver: boolean;
  checkmate: boolean;
  check: boolean;
  turn: Color;
  
  // Board orientation
  flipped: boolean;
  
  // Methods
  selectPiece: (piece: ChessPiece | null) => void;
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  startDrag: (piece: ChessPiece, position: BoardPosition) => void;
  updateDrag: (position: BoardPosition) => void;
  endDrag: (position: BoardPosition) => void;
  resetGame: () => void;
  toggleBoardOrientation: () => void;
  handleSquareClick: (square: Square) => void;
  undoMove: () => void;
}

export const useChessStore = create<ChessState>()(
  subscribeWithSelector((set, get) => ({
    // Initialize with a new chess game
    game: new Chess(),
    
    // Game state
    selectedPiece: null,
    legalMoves: [],
    draggedPiece: null,
    message: "White to move",
    isGameOver: false,
    checkmate: false,
    check: false,
    turn: "w",
    flipped: false,
    
    selectPiece: (piece) => {
      const { game } = get();
      const legalMoves = piece ? 
        game.moves({ square: piece.square, verbose: true }).map(move => move.to as Square) : 
        [];
      
      set({ selectedPiece: piece, legalMoves });
    },
    
    makeMove: (from, to, promotion) => {
      const { game } = get();
      const { playHit, playSuccess } = useAudio.getState();
      
      try {
        // Check if move is a capture
        const moveDetails = game.move({ from, to, promotion });
        
        // Play appropriate sound
        if (moveDetails.captured) {
          playSuccess();
        } else {
          playHit();
        }
        
        // Update game state
        const isCheck = game.inCheck();
        const isCheckmate = game.isCheckmate();
        const isDraw = game.isDraw();
        const isGameOver = game.isGameOver();
        
        let message = game.turn() === 'w' ? "White to move" : "Black to move";
        
        if (isCheckmate) {
          message = game.turn() === 'w' ? "Checkmate! Black wins" : "Checkmate! White wins";
        } else if (isDraw) {
          message = "Game ended in draw";
        } else if (isCheck) {
          message = game.turn() === 'w' ? "White is in check" : "Black is in check";
        }
        
        set({ 
          selectedPiece: null, 
          legalMoves: [],
          message,
          isGameOver,
          checkmate: isCheckmate,
          check: isCheck,
          turn: game.turn(),
        });
        
        return true;
      } catch (e) {
        console.error("Invalid move:", e);
        return false;
      }
    },
    
    startDrag: (piece, position) => {
      // Select the piece and get legal moves
      get().selectPiece(piece);
      
      // Start dragging
      set({ 
        draggedPiece: { 
          piece, 
          origin: { x: position.x, y: position.y, z: position.z },
          current: { x: position.x, y: position.y, z: position.z }
        } 
      });
    },
    
    updateDrag: (position) => {
      const { draggedPiece } = get();
      if (draggedPiece) {
        set({ 
          draggedPiece: { 
            ...draggedPiece, 
            current: position 
          } 
        });
      }
    },
    
    endDrag: (position) => {
      const { draggedPiece, makeMove } = get();
      if (draggedPiece) {
        const { piece } = draggedPiece;
        
        // Calculate the target square
        const file = Math.floor(position.x + 4);
        const rank = Math.floor(position.z + 4);
        
        // Make sure the coordinates are within bounds
        if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
          // Convert to chess notation
          const toFile = String.fromCharCode(97 + file); // 'a' through 'h'
          const toRank = 8 - rank; // 1 through 8 (inverted)
          const targetSquare = `${toFile}${toRank}` as Square;
          
          // Try to make the move
          const success = makeMove(piece.square, targetSquare);
          
          // If move failed, reset dragged piece position
          if (!success) {
            console.log("Invalid move attempted");
          }
        }
        
        // Clear dragged piece
        set({ draggedPiece: null });
      }
    },
    
    resetGame: () => {
      const newGame = new Chess();
      set({
        game: newGame,
        selectedPiece: null,
        legalMoves: [],
        draggedPiece: null,
        message: "White to move",
        isGameOver: false,
        checkmate: false,
        check: false,
        turn: "w",
      });
    },
    
    toggleBoardOrientation: () => {
      set(state => ({ flipped: !state.flipped }));
    },
    
    handleSquareClick: (square) => {
      const { selectedPiece, legalMoves, makeMove, selectPiece, game } = get();
      
      // If a piece is already selected
      if (selectedPiece) {
        // Check if the clicked square is a legal move
        if (legalMoves.includes(square)) {
          // Make the move
          makeMove(selectedPiece.square, square);
        } else {
          // Check if the clicked square has a piece of the current player's color
          const piece = game.get(square);
          if (piece && piece.color === game.turn()) {
            // Select the new piece
            selectPiece({
              type: piece.type,
              color: piece.color,
              square: square
            });
          } else {
            // Deselect
            selectPiece(null);
          }
        }
      } else {
        // Nothing is selected, try to select a piece
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          selectPiece({
            type: piece.type,
            color: piece.color,
            square: square
          });
        }
      }
    },
    
    undoMove: () => {
      const { game } = get();
      
      // Undo last move
      const undoneMove = game.undo();
      
      if (undoneMove) {
        // Update game state
        const isCheck = game.inCheck();
        const isCheckmate = game.isCheckmate();
        const isGameOver = game.isGameOver();
        
        let message = game.turn() === 'w' ? "White to move" : "Black to move";
        if (isCheck) {
          message = game.turn() === 'w' ? "White is in check" : "Black is in check";
        }
        
        set({ 
          selectedPiece: null, 
          legalMoves: [],
          message,
          isGameOver,
          checkmate: isCheckmate,
          check: isCheck,
          turn: game.turn(),
        });
      }
    }
  }))
);
