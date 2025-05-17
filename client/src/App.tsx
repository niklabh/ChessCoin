import { useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import Chess2DGame from "./components/Chess2DGame";
import "./styles.css";

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

  return <Chess2DGame />;
}

export default App;
