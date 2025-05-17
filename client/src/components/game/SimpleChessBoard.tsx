import { useRef, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Chess } from "chess.js";
import SimpleChessPiece from "../ui/simple-chess-piece";

export default function SimpleChessBoard() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Create a new chess game instance
  const chess = useMemo(() => new Chess(), []);
  
  // Create the pieces based on the chess board
  const pieces = useMemo(() => {
    const items = [];
    const board = chess.board();
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
          
          items.push({
            id: `${piece.color}${piece.type}-${square}`,
            type: piece.type,
            color: piece.color,
            position: [
              file - 3.5,
              0,
              rank - 3.5
            ] as [number, number, number],
            square
          });
        }
      }
    }
    
    return items;
  }, [chess]);
  
  // Create the checkerboard
  const squares = useMemo(() => {
    const items = [];
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isWhite = (file + rank) % 2 === 0;
        const posX = file - 3.5;
        const posY = -0.1;
        const posZ = rank - 3.5;
        
        items.push(
          <mesh 
            key={`square-${file}-${rank}`}
            position={[posX, posY, posZ] as [number, number, number]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={isWhite ? "#f0d9b5" : "#b58863"}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }
    }
    
    return items;
  }, []);
  
  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={0.1}
        minDistance={5}
        maxDistance={20}
        target={[0, 0, 0]}
      />
      
      {/* Board base */}
      <mesh receiveShadow position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[10, 10, 0.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Chess board squares */}
      <group position={[0, 0, 0]}>
        {squares}
      </group>
      
      {/* Chess pieces */}
      {pieces.map(piece => (
        <SimpleChessPiece
          key={piece.id}
          type={piece.type}
          color={piece.color}
          position={piece.position}
        />
      ))}
    </>
  );
}