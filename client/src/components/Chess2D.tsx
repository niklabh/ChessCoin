import React, { useState, useEffect } from 'react';
import Chess from 'chess.js';
import type { Square, Color } from '../lib/chess.d.ts';

// Define pieces images 
const PIECES: Record<string, string> = {
  'wp': '♙', // white pawn
  'wn': '♘', // white knight
  'wb': '♗', // white bishop
  'wr': '♖', // white rook
  'wq': '♕', // white queen
  'wk': '♔', // white king
  'bp': '♟', // black pawn
  'bn': '♞', // black knight
  'bb': '♝', // black bishop
  'br': '♜', // black rook
  'bq': '♛', // black queen
  'bk': '♚', // black king
};

const Chess2D: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [gameStatus, setGameStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [playerTurn, setPlayerTurn] = useState<'w' | 'b'>('w');

  // Load the game on mount
  useEffect(() => {
    updateGameStatus();
  }, []);

  // Update the game status
  const updateGameStatus = () => {
    if (game.isCheckmate()) {
      setGameStatus(`Checkmate! ${playerTurn === 'w' ? 'Black' : 'White'} wins`);
    } else if (game.isDraw()) {
      setGameStatus('Draw!');
    } else if (game.isCheck()) {
      setGameStatus(`${playerTurn === 'w' ? 'White' : 'Black'} is in check`);
    } else {
      setGameStatus(`${playerTurn === 'w' ? 'White' : 'Black'} to move`);
    }
  };

  // Get the legal moves for a square
  const getLegalMoves = (square: Square): Square[] => {
    try {
      return game.moves({ square, verbose: true })
        .map(move => move.to as Square);
    } catch (e) {
      console.error('Error getting legal moves:', e);
      return [];
    }
  };

  // Handle square click
  const handleSquareClick = (square: Square) => {
    const piece = game.get(square);

    // If no square is selected and the clicked square has a piece of the current player's color
    if (!selectedSquare && piece && piece.color === playerTurn) {
      setSelectedSquare(square);
      setValidMoves(getLegalMoves(square));
      return;
    }

    // If a square is already selected
    if (selectedSquare) {
      // Try to make a move
      try {
        const moveResult = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q' // always promote to queen for simplicity
        });

        if (moveResult) {
          // Move was successful
          setMoveHistory(prev => [...prev, moveResult.san]);
          setPlayerTurn(game.turn() as 'w' | 'b');
          updateGameStatus();
        }
      } catch (e) {
        // Invalid move, check if we're selecting a new piece
        if (piece && piece.color === playerTurn) {
          setSelectedSquare(square);
          setValidMoves(getLegalMoves(square));
          return;
        }
      }

      // Clear selection
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Undo the last move
  const handleUndoMove = () => {
    game.undo();
    setSelectedSquare(null);
    setValidMoves([]);
    setPlayerTurn(game.turn() as 'w' | 'b');
    setMoveHistory(moveHistory.slice(0, -1));
    updateGameStatus();
  };

  // Reset the game
  const handleResetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setValidMoves([]);
    setPlayerTurn('w');
    setMoveHistory([]);
    setGameStatus('White to move');
  };

  // Render board
  const renderBoard = () => {
    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const square = `${files[fileIndex]}${ranks[rankIndex]}` as Square;
        const piece = game.get(square);
        const isWhiteSquare = (fileIndex + rankIndex) % 2 === 1;
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves.includes(square);

        let squareStyle = `w-12 h-12 flex items-center justify-center text-3xl cursor-pointer 
                          ${isWhiteSquare ? 'bg-slate-200' : 'bg-slate-500'} 
                          ${isSelected ? 'ring-4 ring-blue-500' : ''}
                          ${isValidMove ? 'bg-green-300' : ''}`;

        let pieceChar = '';
        if (piece) {
          pieceChar = PIECES[`${piece.color}${piece.type}`];
        }

        board.push(
          <div
            key={square}
            className={squareStyle}
            onClick={() => handleSquareClick(square)}
            data-square={square}
          >
            <span className={`${piece?.color === 'b' ? 'text-black' : 'text-amber-600'}`}>
              {pieceChar}
            </span>
          </div>
        );
      }
    }

    return board;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Chess Game</h1>
      
      <div className="flex space-x-8">
        <div className="flex flex-col items-center">
          <div className="mb-4 p-2 bg-white rounded shadow">
            <div className="text-lg font-bold">{gameStatus}</div>
          </div>
          
          <div className="grid grid-cols-8 border-2 border-gray-800 bg-gray-800 shadow-lg">
            {renderBoard()}
          </div>
          
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleUndoMove}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={moveHistory.length === 0}
            >
              Undo Move
            </button>
            <button
              onClick={handleResetGame}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              New Game
            </button>
          </div>
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

export default Chess2D;