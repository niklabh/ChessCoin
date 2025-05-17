import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Square } from "chess.js";

interface MoveIndicatorProps {
  square: Square;
}

const MoveIndicator = ({ square }: MoveIndicatorProps) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Convert chess square notation to board position
  const file = square.charCodeAt(0) - 97; // 'a' through 'h' converted to 0-7
  const rank = 8 - parseInt(square[1]); // '1' through '8' converted to 0-7
  
  // Animate the indicator
  useFrame(({ clock }) => {
    if (ref.current) {
      // Pulse animation
      ref.current.scale.setScalar(0.4 + Math.sin(clock.getElapsedTime() * 3) * 0.1);
      
      // Slow rotation
      ref.current.rotation.y += 0.01;
    }
  });
  
  return (
    <mesh
      ref={ref}
      position={[file - 3.5, 0.01, rank - 3.5]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <circleGeometry args={[0.3, 32]} />
      <meshBasicMaterial 
        color={0x88ff88} 
        transparent 
        opacity={0.5} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

export default MoveIndicator;
