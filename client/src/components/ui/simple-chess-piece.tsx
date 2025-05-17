import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PieceSymbol, Color } from "chess.js";

interface SimpleChessPieceProps {
  type: PieceSymbol;
  color: Color;
  position: [number, number, number];
  isSelected?: boolean;
}

export default function SimpleChessPiece({ 
  type, 
  color, 
  position, 
  isSelected = false 
}: SimpleChessPieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Handle animation and visual effects
  useFrame(() => {
    if (!groupRef.current) return;
    
    // Add hover or selection effects if needed
    if (isSelected) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0.2,
        0.1
      );
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        0.1
      );
    }
  });
  
  // Determine geometry based on piece type
  const renderPiece = () => {
    const pieceColor = color === "w" ? "#f9f9f9" : "#333333";
    
    // Common material properties
    const materialProps = {
      color: pieceColor,
      roughness: 0.5,
      metalness: 0.2,
      emissive: isSelected ? new THREE.Color(0x555555) : undefined,
      emissiveIntensity: isSelected ? 0.5 : 0
    };
    
    switch (type) {
      case "p": // Pawn
        return (
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 0.5, 16]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
        
      case "r": // Rook
        return (
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.4, 0.8, 0.4]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
        
      case "n": // Knight
        return (
          <group position={[0, 0.35, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.3, 0.4, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0.15, 0.25, 0]} castShadow>
              <boxGeometry args={[0.25, 0.5, 0.2]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        );
        
      case "b": // Bishop
        return (
          <group position={[0, 0.4, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.35, 0.6, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 0.4, 0]} castShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        );
        
      case "q": // Queen
        return (
          <group position={[0, 0.5, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 0.7, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 0.45, 0]} castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        );
        
      case "k": // King
        return (
          <group position={[0, 0.6, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 0.7, 16]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.15, 0.3, 0.15]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };
  
  return (
    <group 
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
    >
      {renderPiece()}
    </group>
  );
}