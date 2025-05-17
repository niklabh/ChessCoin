import React, { useState, useEffect } from 'react';

// Import chess.js with dynamic import
import { Chess } from 'chess.js';

interface ChessPiece {
  type: string;
  color: string;
}

interface Square {
  piece: ChessPiece | null;
  square: string;
}

const ChessBoard: React.FC = () => {
  // Use a string to initialize the Chess instance to avoid type errors
  const [chess] = useState(() => new Chess());
  
  const [board, setBoard] = useState<Square[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [boardFlipped, setBoardFlipped] = useState(false);

  // Define piece images using chess.com URLs
  const PIECE_IMAGES: Record<string, string> = {
    'wP': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png',
    'wN': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png',
    'wB': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png',
    'wR': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png',
    'wQ': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png',
    'wK': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png',
    'bP': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bp.png',
    'bN': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bn.png',
    'bB': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bb.png',
    'bR': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/br.png',
    'bQ': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bq.png',
    'bK': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png',
  };

  // Update board state from Chess.js board
  const updateBoard = () => {
    const chessBoard = chess.board();
    const newBoard: Square[][] = [];
    
    for (let rank = 0; rank < 8; rank++) {
      const row: Square[] = [];
      for (let file = 0; file < 8; file++) {
        const piece = chessBoard[rank][file];
        const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
        row.push({ piece, square });
      }
      newBoard.push(row);
    }
    
    setBoard(newBoard);
  };

  // Update game status
  const updateGameStatus = () => {
    let status = '';
    
    if (chess.isCheckmate()) {
      status = `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins`;
    } else if (chess.isDraw()) {
      if (chess.isStalemate()) {
        status = 'Game over! Stalemate';
      } else if (chess.isThreefoldRepetition()) {
        status = 'Game over! Draw by repetition';
      } else if (chess.isInsufficientMaterial()) {
        status = 'Game over! Draw by insufficient material';
      } else {
        status = 'Game over! Draw';
      }
    } else if (chess.inCheck()) {
      status = `${chess.turn() === 'w' ? 'White' : 'Black'} is in check`;
    } else {
      status = `${chess.turn() === 'w' ? 'White' : 'Black'} to move`;
    }
    
    setGameStatus(status);
  };

  // Initialize the board and status
  useEffect(() => {
    updateBoard();
    updateGameStatus();
  }, []);

  // Get legal moves for a square
  const getLegalMoves = (square: string): string[] => {
    try {
      const moves = chess.moves({ 
        square, 
        verbose: true 
      });
      
      return moves.map((move: any) => move.to);
    } catch (e) {
      console.error('Error getting legal moves:', e);
      return [];
    }
  };

  // Handle square click
  const handleSquareClick = (square: string) => {
    // If a square is already selected
    if (selectedSquare) {
      // Try to make a move
      try {
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to a queen for simplicity
        });

        if (move) {
          // Move was successful, update history
          setMoveHistory([...moveHistory, move.san]);
          
          // Reset selection
          setSelectedSquare(null);
          setValidMoves([]);
          
          // Update the board and game status
          updateBoard();
          updateGameStatus();
          return;
        }
      } catch (e) {
        // Move was not valid
      }
    }
    
    // Either no square was selected, or the move was invalid
    // Check if the clicked square has a piece of the current player's color
    const piece = chess.get(square);
    
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      setValidMoves(getLegalMoves(square));
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Handle undo move
  const handleUndoMove = () => {
    chess.undo();
    setMoveHistory(moveHistory.slice(0, -1));
    setSelectedSquare(null);
    setValidMoves([]);
    updateBoard();
    updateGameStatus();
  };

  // Handle new game
  const handleNewGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveHistory([]);
    updateBoard();
    updateGameStatus();
  };

  // Flip the board
  const handleFlipBoard = () => {
    setBoardFlipped(!boardFlipped);
  };

  // Render the board
  const renderBoard = () => {
    // If board is flipped, reverse the ranks and files
    const displayBoard = boardFlipped ? [...board].reverse().map(row => [...row].reverse()) : board;
    
    return (
      <div className="board-container">
        {displayBoard.map((row, rankIndex) => (
          <div key={`rank-${rankIndex}`} className="flex">
            {row.map((square, fileIndex) => {
              const { piece, square: squareName } = square;
              
              const isWhiteSquare = (rankIndex + fileIndex) % 2 === 1;
              const isSelected = selectedSquare === squareName;
              const isValidMove = validMoves.includes(squareName);
              
              // Determine square color class
              const squareColorClass = isWhiteSquare ? 'light-square' : 'dark-square';
              
              // Build class string with conditional modifiers
              const squareClasses = `w-14 h-14 flex items-center justify-center cursor-pointer relative
                                   ${squareColorClass}
                                   ${isSelected ? 'selected-square' : ''}
                                   ${isValidMove ? 'valid-move' : ''}`;
              
              return (
                <div
                  key={`square-${squareName}`}
                  className={squareClasses}
                  onClick={() => handleSquareClick(squareName)}
                >
                  {/* Piece image */}
                  {piece && (
                    <img
                      src={PIECE_IMAGES[`${piece.color}${piece.type.toUpperCase()}`]}
                      alt={`${piece.color}${piece.type}`}
                      className="w-12 h-12 object-contain"
                      draggable={false}
                    />
                  )}
                  
                  {/* Square labels for first column and last row */}
                  {fileIndex === 0 && (
                    <div className="absolute left-1 top-1 text-xs text-gray-800 font-bold">
                      {boardFlipped ? rankIndex + 1 : 8 - rankIndex}
                    </div>
                  )}
                  {rankIndex === 7 && (
                    <div className="absolute right-1 bottom-1 text-xs text-gray-800 font-bold">
                      {boardFlipped 
                        ? String.fromCharCode(104 - fileIndex) 
                        : String.fromCharCode(97 + fileIndex)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Chess Game</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center">
          {/* Game status */}
          <div className="mb-4 p-2 bg-white rounded shadow">
            <div className="text-lg font-bold">{gameStatus}</div>
          </div>
          
          {/* Chess board */}
          <div className="border-2 border-gray-800 relative">
            {renderBoard()}
          </div>
          
          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <button 
              onClick={handleUndoMove}
              disabled={moveHistory.length === 0}
              className={`px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Undo
            </button>
            <button 
              onClick={handleFlipBoard}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Flip Board
            </button>
            <button 
              onClick={handleNewGame}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              New Game
            </button>
          </div>
        </div>
        
        {/* Move history */}
        <div className="bg-white p-4 rounded shadow w-64 md:w-60">
          <h2 className="text-xl font-bold mb-2">Move History</h2>
          <div className="h-64 overflow-y-auto">
            {moveHistory.length === 0 ? (
              <div className="text-gray-500 italic">No moves yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-10 text-left">#</th>
                    <th className="text-left">White</th>
                    <th className="text-left">Black</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td>{i + 1}.</td>
                      <td>{moveHistory[i * 2]}</td>
                      <td>{moveHistory[i * 2 + 1] || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;