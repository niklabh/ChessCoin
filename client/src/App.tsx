import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import ChessBoard from "./components/game/ChessBoard";
import Lights from "./components/game/Lights";
import GameUI from "./components/game/GameUI";
import { Controls } from "./components/game/Controls";

// Define control keys for the game
const keyMap = [
  { name: Controls.rotateLeft, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rotateRight, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.zoomIn, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.zoomOut, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.reset, keys: ["KeyR"] },
];

// Main App component
function App() {
  const { setHitSound, setSuccessSound } = useAudio();

  // Set up sounds
  useEffect(() => {
    // Load sound effects
    const moveSound = new Audio("/sounds/hit.mp3");
    const captureSound = new Audio("/sounds/success.mp3");
    
    setHitSound(moveSound);
    setSuccessSound(captureSound);
  }, [setHitSound, setSuccessSound]);

  return (
    <div className="w-full h-full">
      <KeyboardControls map={keyMap}>
        <Canvas
          camera={{
            position: [0, 10, 10],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={["#1a202c"]} />
          <fog attach="fog" args={["#1a202c", 10, 30]} />
          
          <Lights />
          
          <Suspense fallback={null}>
            <ChessBoard />
          </Suspense>
        </Canvas>
        
        <GameUI />
      </KeyboardControls>
    </div>
  );
}

export default App;
