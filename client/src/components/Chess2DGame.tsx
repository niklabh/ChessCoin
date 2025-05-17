import React, { useState, useEffect } from 'react';
import { useAudio } from '../lib/stores/useAudio';

// ES module import for chess.js
import { Chess } from 'chess.js';

interface ChessPiece {
  type: string;
  color: string;
}

interface Square {
  piece: ChessPiece | null;
  square: string;
}

const Chess2DGame: React.FC = () => {
  const { playHit, playSuccess } = useAudio();
  
  // Initialize the chess instance
  const [chess] = useState<any>(() => new Chess());
  
  const [board, setBoard] = useState<Square[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{from: string, to: string} | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{white: string[], black: string[]}>(
    {white: [], black: []}
  );

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

  // Convert chess.js board to our format
  const updateBoard = () => {
    try {
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
    } catch (error) {
      console.error("Error updating board:", error);
    }
  };

  // Update game status
  const updateGameStatus = () => {
    try {
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
    } catch (error) {
      console.error("Error updating game status:", error);
    }
  };

  // Initialize the board
  useEffect(() => {
    console.log("Chess instance created:", chess);
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
      
      if (!moves) return [];
      
      return moves.map((move: any) => move.to);
    } catch (error) {
      console.error("Error getting legal moves:", error);
      return [];
    }
  };

  // Check if move is a pawn promotion
  const isPromotion = (from: string, to: string): boolean => {
    const piece = chess.get(from);
    if (!piece || piece.type !== 'p') return false;

    // Check if pawn is moving to the last rank
    const toRank = to.charAt(1);
    return (piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1');
  };

  // Update captured pieces list
  const updateCapturedPieces = (move: any) => {
    if (!move.captured) return;
    
    // Determine which player captured the piece
    const capturedBy = move.color === 'w' ? 'white' : 'black';
    const capturedPiece = move.captured;
    
    // Add to the appropriate list
    setCapturedPieces(prev => {
      if (capturedBy === 'white') {
        return { ...prev, white: [...prev.white, capturedPiece] };
      } else {
        return { ...prev, black: [...prev.black, capturedPiece] };
      }
    });
  };

  // Handle promotion piece selection
  const handlePromotionSelect = (promotionPiece: string) => {
    if (!pendingPromotion) return;

    try {
      const { from, to } = pendingPromotion;
      const move = chess.move({
        from,
        to,
        promotion: promotionPiece
      });

      if (move) {
        // Play the appropriate sound
        if (move.captured) {
          playSuccess();
          updateCapturedPieces(move);
        } else {
          playHit();
        }
        
        // Update history and last move
        setMoveHistory([...moveHistory, move.san]);
        setLastMove({ from, to });
      }
    } catch (error) {
      console.error("Error during promotion:", error);
    }

    // Close the promotion dialog and reset state
    setShowPromotionDialog(false);
    setPendingPromotion(null);
    setSelectedSquare(null);
    setValidMoves([]);
    
    // Update the board and game status
    updateBoard();
    updateGameStatus();
  };

  // Handle square click
  const handleSquareClick = (square: string) => {
    // If promotion dialog is open, ignore clicks
    if (showPromotionDialog) return;
    
    // If a square is already selected
    if (selectedSquare) {
      // Check if this is a pawn promotion move
      if (isPromotion(selectedSquare, square)) {
        // Store the move for later and show promotion dialog
        setPendingPromotion({ from: selectedSquare, to: square });
        setShowPromotionDialog(true);
        return;
      }
      
      // Try to make a regular move
      try {
        const move = chess.move({
          from: selectedSquare,
          to: square
        });

        if (move) {
          // Move was successful
          // Play the appropriate sound
          if (move.captured) {
            playSuccess();
            updateCapturedPieces(move);
          } else {
            playHit();
          }
          
          // Update history and last move
          setMoveHistory([...moveHistory, move.san]);
          setLastMove({ from: selectedSquare, to: square });
          
          // Reset selection
          setSelectedSquare(null);
          setValidMoves([]);
          
          // Update the board and game status
          updateBoard();
          updateGameStatus();
          return;
        }
      } catch (error) {
        // Move was not valid, log the error
        console.error("Invalid move:", error);
      }
    }
    
    // Either no square was selected, or the move was invalid
    // Check if the clicked square has a piece of the current player's color
    try {
      const piece = chess.get(square);
      
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        setValidMoves(getLegalMoves(square));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } catch (error) {
      console.error("Error handling square click:", error);
    }
  };

  // Handle undo move
  const handleUndoMove = () => {
    try {
      const undoneMove = chess.undo();
      if (undoneMove) {
        setMoveHistory(moveHistory.slice(0, -1));
        setSelectedSquare(null);
        setValidMoves([]);
        setLastMove(null);
        updateBoard();
        updateGameStatus();
        playHit();
      }
    } catch (error) {
      console.error("Error undoing move:", error);
    }
  };

  // Handle new game
  const handleNewGame = () => {
    try {
      chess.reset();
      setSelectedSquare(null);
      setValidMoves([]);
      setMoveHistory([]);
      setLastMove(null);
      setCapturedPieces({white: [], black: []});
      updateBoard();
      updateGameStatus();
    } catch (error) {
      console.error("Error resetting game:", error);
    }
  };
  
  // Render captured pieces
  const renderCapturedPieces = (color: 'white' | 'black') => {
    const pieces = capturedPieces[color];
    if (pieces.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {pieces.map((piece, index) => (
          <div key={`${color}-${piece}-${index}`} className="w-8 h-8">
            <img 
              src={PIECE_IMAGES[`${color === 'white' ? 'b' : 'w'}${piece.toUpperCase()}`]}
              alt={`Captured ${piece}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    );
  };

  // Flip the board
  const handleFlipBoard = () => {
    setBoardFlipped(!boardFlipped);
  };

  // Add CSS for chess board styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .chess-board {
        display: flex;
        flex-direction: column;
      }
      
      .light-square {
        background-color: #f0d9b5;
      }
      
      .dark-square {
        background-color: #b58863;
      }
      
      .selected-square {
        background-color: rgba(106, 159, 181, 0.7) !important;
      }
      
      .valid-move::after {
        content: '';
        position: absolute;
        width: 25%;
        height: 25%;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
      }
      
      .last-move {
        background-color: rgba(255, 255, 0, 0.3) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render the board
  const renderBoard = () => {
    // If board is flipped, reverse the ranks and files
    const displayBoard = boardFlipped ? [...board].reverse().map(row => [...row].reverse()) : board;
    
    return (
      <div className="chess-board border-2 border-gray-800">
        {displayBoard.map((row, rankIndex) => (
          <div key={`rank-${rankIndex}`} className="flex">
            {row.map((square, fileIndex) => {
              const { piece, square: squareName } = square;
              
              const isWhiteSquare = (rankIndex + fileIndex) % 2 === 1;
              const isSelected = selectedSquare === squareName;
              const isValidMove = validMoves.includes(squareName);
              const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
              
              // Determine square color class
              const squareColorClass = isWhiteSquare ? 'light-square' : 'dark-square';
              
              // Build class string with conditional modifiers
              const squareClasses = `w-14 h-14 flex items-center justify-center cursor-pointer relative
                                     ${squareColorClass}
                                     ${isSelected ? 'selected-square' : ''}
                                     ${isValidMove ? 'valid-move' : ''}
                                     ${isLastMoveSquare ? 'last-move' : ''}`;
              
              return (
                <div
                  key={`square-${squareName}`}
                  className={squareClasses}
                  onClick={() => handleSquareClick(squareName)}
                  data-square={squareName}
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

  // Render promotion dialog
  const renderPromotionDialog = () => {
    if (!showPromotionDialog || !pendingPromotion) return null;
    
    const piece = chess.get(pendingPromotion.from);
    if (!piece) return null;
    
    // Determine promotion pieces based on color
    const pieceColor = piece.color;
    const promotionPieces = ['q', 'r', 'n', 'b']; // queen, rook, knight, bishop
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold mb-2">Choose promotion piece</h3>
          <div className="flex gap-2">
            {promotionPieces.map(p => (
              <div 
                key={p} 
                className="w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                onClick={() => handlePromotionSelect(p)}
              >
                <img
                  src={PIECE_IMAGES[`${pieceColor}${p.toUpperCase()}`]}
                  alt={`${pieceColor}${p}`}
                  className="w-14 h-14 object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
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
          
          {/* Captured pieces by black (shown at top) */}
          <div className="mb-2 p-2 min-h-10 w-full">
            {renderCapturedPieces('black')}
          </div>
          
          {/* Chess board */}
          {renderBoard()}
          
          {/* Captured pieces by white (shown at bottom) */}
          <div className="mt-2 p-2 min-h-10 w-full">
            {renderCapturedPieces('white')}
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
      
      {/* Promotion dialog */}
      {renderPromotionDialog()}
    </div>
  );
};

export default Chess2DGame;