import React, { useState } from 'react';

// Define piece types and colors
type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

// Define chess piece interface
interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

// Define chess board
type ChessBoard = (ChessPiece | null)[][];

// Create initial board setup
const createInitialBoard = (): ChessBoard => {
  const board: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }
  
  // Place rooks
  board[0][0] = { type: 'rook', color: 'black' };
  board[0][7] = { type: 'rook', color: 'black' };
  board[7][0] = { type: 'rook', color: 'white' };
  board[7][7] = { type: 'rook', color: 'white' };
  
  // Place knights
  board[0][1] = { type: 'knight', color: 'black' };
  board[0][6] = { type: 'knight', color: 'black' };
  board[7][1] = { type: 'knight', color: 'white' };
  board[7][6] = { type: 'knight', color: 'white' };
  
  // Place bishops
  board[0][2] = { type: 'bishop', color: 'black' };
  board[0][5] = { type: 'bishop', color: 'black' };
  board[7][2] = { type: 'bishop', color: 'white' };
  board[7][5] = { type: 'bishop', color: 'white' };
  
  // Place queens
  board[0][3] = { type: 'queen', color: 'black' };
  board[7][3] = { type: 'queen', color: 'white' };
  
  // Place kings
  board[0][4] = { type: 'king', color: 'black' };
  board[7][4] = { type: 'king', color: 'white' };
  
  return board;
};

// Unicode chess pieces
const PIECE_SYMBOLS: Record<PieceType, Record<PieceColor, string>> = {
  pawn: { white: '♙', black: '♟' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  rook: { white: '♖', black: '♜' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' }
};

// Position type
interface Position {
  row: number;
  col: number;
}

const SimpleChess: React.FC = () => {
  const [board, setBoard] = useState<ChessBoard>(createInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameStatus, setGameStatus] = useState<string>('White to move');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  // Check if a move is valid (simplified rules)
  const isValidMove = (start: Position, end: Position): boolean => {
    const piece = board[start.row][start.col];
    
    // If there's no piece at start position
    if (!piece) return false;
    
    // Cannot move opponent's pieces
    if (piece.color !== currentPlayer) return false;
    
    // Cannot capture your own pieces
    const targetPiece = board[end.row][end.col];
    if (targetPiece && targetPiece.color === currentPlayer) return false;
    
    // Movement logic for each piece type
    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Move forward one square
        if (end.col === start.col && end.row === start.row + direction && !targetPiece) {
          return true;
        }
        
        // Move forward two squares from starting position
        if (
          end.col === start.col && 
          start.row === startRow && 
          end.row === start.row + 2 * direction && 
          !board[start.row + direction][start.col] && 
          !targetPiece
        ) {
          return true;
        }
        
        // Capture diagonally
        if (
          (end.col === start.col - 1 || end.col === start.col + 1) && 
          end.row === start.row + direction && 
          targetPiece && 
          targetPiece.color !== piece.color
        ) {
          return true;
        }
        
        return false;
      }
      
      case 'knight': {
        const rowDiff = Math.abs(end.row - start.row);
        const colDiff = Math.abs(end.col - start.col);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      }
      
      case 'bishop': {
        const rowDiff = Math.abs(end.row - start.row);
        const colDiff = Math.abs(end.col - start.col);
        
        // Must move diagonally
        if (rowDiff !== colDiff) return false;
        
        // Check if path is clear
        const rowStep = end.row > start.row ? 1 : -1;
        const colStep = end.col > start.col ? 1 : -1;
        
        for (let i = 1; i < rowDiff; i++) {
          if (board[start.row + i * rowStep][start.col + i * colStep]) {
            return false;
          }
        }
        
        return true;
      }
      
      case 'rook': {
        // Must move horizontally or vertically
        if (start.row !== end.row && start.col !== end.col) return false;
        
        // Check if path is clear
        if (start.row === end.row) {
          const step = end.col > start.col ? 1 : -1;
          for (let col = start.col + step; col !== end.col; col += step) {
            if (board[start.row][col]) return false;
          }
        } else {
          const step = end.row > start.row ? 1 : -1;
          for (let row = start.row + step; row !== end.row; row += step) {
            if (board[row][start.col]) return false;
          }
        }
        
        return true;
      }
      
      case 'queen': {
        const rowDiff = Math.abs(end.row - start.row);
        const colDiff = Math.abs(end.col - start.col);
        
        // Can move like a rook or bishop
        if (rowDiff === colDiff) {
          // Diagonal movement like bishop
          const rowStep = end.row > start.row ? 1 : -1;
          const colStep = end.col > start.col ? 1 : -1;
          
          for (let i = 1; i < rowDiff; i++) {
            if (board[start.row + i * rowStep][start.col + i * colStep]) {
              return false;
            }
          }
          
          return true;
        }
        
        if (start.row === end.row || start.col === end.col) {
          // Straight movement like rook
          if (start.row === end.row) {
            const step = end.col > start.col ? 1 : -1;
            for (let col = start.col + step; col !== end.col; col += step) {
              if (board[start.row][col]) return false;
            }
          } else {
            const step = end.row > start.row ? 1 : -1;
            for (let row = start.row + step; row !== end.row; row += step) {
              if (board[row][start.col]) return false;
            }
          }
          
          return true;
        }
        
        return false;
      }
      
      case 'king': {
        const rowDiff = Math.abs(end.row - start.row);
        const colDiff = Math.abs(end.col - start.col);
        
        // King can move one square in any direction
        return rowDiff <= 1 && colDiff <= 1;
      }
      
      default:
        return false;
    }
  };
  
  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    // If no piece is selected yet
    if (!selectedPiece) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedPiece({ row, col });
      }
      return;
    }
    
    // If a piece is already selected
    const start = selectedPiece;
    const end = { row, col };
    
    // Check if this is a valid move
    if (isValidMove(start, end)) {
      // Make the move
      const newBoard = [...board.map(row => [...row])];
      const movingPiece = { ...newBoard[start.row][start.col]!, hasMoved: true };
      newBoard[end.row][end.col] = movingPiece;
      newBoard[start.row][start.col] = null;
      
      // Record the move
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      const piece = board[start.row][start.col]!;
      const pieceSymbol = piece.type === 'pawn' ? '' : piece.type.charAt(0).toUpperCase();
      const captureSymbol = board[end.row][end.col] ? 'x' : '';
      const moveNotation = `${pieceSymbol}${files[start.col]}${ranks[start.row]}${captureSymbol}${files[end.col]}${ranks[end.row]}`;
      setMoveHistory([...moveHistory, moveNotation]);
      
      // Update the board and switch players
      setBoard(newBoard);
      setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      setGameStatus(`${currentPlayer === 'white' ? 'Black' : 'White'} to move`);
      setSelectedPiece(null);
    } else {
      // If the clicked square has a piece of the current player, select it instead
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedPiece({ row, col });
      } else {
        // Otherwise, deselect the current piece
        setSelectedPiece(null);
      }
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setCurrentPlayer('white');
    setGameStatus('White to move');
    setMoveHistory([]);
  };
  
  // Render the board
  const renderBoard = () => {
    const rows = [];
    
    for (let row = 0; row < 8; row++) {
      const squares = [];
      
      for (let col = 0; col < 8; col++) {
        const isWhiteSquare = (row + col) % 2 === 1;
        const piece = board[row][col];
        const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
        
        const squareStyle = `w-14 h-14 flex items-center justify-center cursor-pointer 
                           ${isWhiteSquare ? 'bg-slate-200' : 'bg-slate-500'}
                           ${isSelected ? 'ring-4 ring-blue-500' : ''}`;
        
        squares.push(
          <div
            key={`${row}-${col}`}
            className={squareStyle}
            onClick={() => handleSquareClick(row, col)}
          >
            {piece && (
              <span className={`${piece.color === 'white' 
                ? 'text-white font-bold text-4xl text-stroke-black' 
                : 'text-black text-4xl'}`}>
                {PIECE_SYMBOLS[piece.type][piece.color]}
              </span>
            )}
          </div>
        );
      }
      
      rows.push(
        <div key={row} className="flex">
          {squares}
        </div>
      );
    }
    
    return <div className="border-2 border-gray-800">{rows}</div>;
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Chess Game</h1>
      
      <div className="flex space-x-8">
        <div className="flex flex-col items-center">
          <div className="mb-4 p-2 bg-white rounded shadow">
            <div className="text-lg font-bold">{gameStatus}</div>
          </div>
          
          {renderBoard()}
          
          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Game
          </button>
        </div>
        
        <div className="bg-white p-4 rounded shadow w-60">
          <h2 className="text-xl font-bold mb-2">Move History</h2>
          <div className="h-64 overflow-y-auto">
            {moveHistory.map((move, index) => (
              <div key={index} className="py-1">
                {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChess;