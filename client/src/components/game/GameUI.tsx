import { useEffect } from "react";
import { useChessStore } from "../../lib/stores/useChessStore";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { RotateCcw, VolumeX, Volume2, RotateCw } from "lucide-react";

const GameUI = () => {
  const { message, isGameOver, resetGame, turn, toggleBoardOrientation, checkmate, check, undoMove } = useChessStore();
  const { isMuted, toggleMute } = useAudio();
  
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'N' key for new game
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetGame();
      }
      
      // 'F' key for flip board
      if (e.key === 'f') {
        toggleBoardOrientation();
      }
      
      // 'Z' key for undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undoMove();
      }
      
      // 'M' key for mute toggle
      if (e.key === 'm') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame, toggleBoardOrientation, undoMove, toggleMute]);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top header with game info */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${turn === 'w' ? 'bg-white' : 'bg-black border border-white'}`}></div>
          <span className="font-bold">{message}</span>
          {check && !checkmate && <span className="text-red-500 font-bold">CHECK!</span>}
          {checkmate && <span className="text-red-500 font-bold">CHECKMATE!</span>}
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleMute}
            title={isMuted ? "Unmute (M)" : "Mute (M)"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleBoardOrientation}
            title="Flip Board (F)"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={undoMove}
            title="Undo Move (Ctrl+Z)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={isGameOver ? "destructive" : "outline"} 
            size="sm" 
            onClick={resetGame}
            title="New Game (Ctrl+N)"
          >
            New Game
          </Button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-xs">
        <h3 className="text-lg font-bold mb-2">Controls:</h3>
        <ul className="text-sm">
          <li>Click to select a piece</li>
          <li>Drag and drop to move</li>
          <li>Arrow keys or WASD to rotate/zoom</li>
          <li>R key to reset camera</li>
          <li>F key to flip board</li>
          <li>Ctrl+Z to undo move</li>
        </ul>
      </div>
    </div>
  );
};

export default GameUI;
