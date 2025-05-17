import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useChessStore } from "../../lib/stores/useChessStore";
import ChessPiece from "./ChessPiece";
import MoveIndicator from "./MoveIndicator";
import { Controls } from "./Controls";
import { useKeyboardControls } from "@react-three/drei";
import type { Vector3 } from "@react-three/fiber";

const ChessBoard = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const texture = useTexture("/textures/wood.jpg");
  const game = useChessStore(state => state.game);
  const legalMoves = useChessStore(state => state.legalMoves);
  const selectedPiece = useChessStore(state => state.selectedPiece);
  const flipped = useChessStore(state => state.flipped);
  
  // Get keyboard controls
  const rotateLeft = useKeyboardControls<Controls>(state => state.rotateLeft);
  const rotateRight = useKeyboardControls<Controls>(state => state.rotateRight);
  const zoomIn = useKeyboardControls<Controls>(state => state.zoomIn);
  const zoomOut = useKeyboardControls<Controls>(state => state.zoomOut);
  const reset = useKeyboardControls<Controls>(state => state.reset);
  
  // Handle keyboard controls
  useFrame(() => {
    if (!controlsRef.current) return;
    
    if (rotateLeft) {
      controlsRef.current.rotateLeft(0.05);
    }
    if (rotateRight) {
      controlsRef.current.rotateRight(0.05);
    }
    if (zoomIn) {
      controlsRef.current.zoomIn(0.5);
    }
    if (zoomOut) {
      controlsRef.current.zoomOut(0.5);
    }
    if (reset) {
      controlsRef.current.reset();
    }
  });

  // Update camera position based on board orientation
  useEffect(() => {
    if (flipped) {
      camera.position.set(0, 10, -10);
    } else {
      camera.position.set(0, 10, 10);
    }
    camera.lookAt(0, 0, 0);
  }, [flipped, camera]);

  // Create pieces based on current game state
  const pieces = useMemo(() => {
    const piecesArray = [];
    const board = game.board();
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
          piecesArray.push({
            id: `${piece.color}${piece.type}-${square}`,
            type: piece.type,
            color: piece.color,
            square: square,
            file,
            rank
          });
        }
      }
    }
    
    return piecesArray;
  }, [game]);

  // Create the checkerboard pattern
  const squares = useMemo(() => {
    const squaresArray = [];
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isWhite = (file + rank) % 2 === 0;
        const posX = file - 3.5;
        const posY = -0.1;
        const posZ = rank - 3.5;
        
        squaresArray.push(
          <mesh
            key={`square-${file}-${rank}`}
            position={[posX, posY, posZ]}
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
    
    return squaresArray;
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
        <meshStandardMaterial map={texture} />
      </mesh>
      
      {/* Chess board squares */}
      <group position={[0, 0, 0]}>
        {squares}
        
        {/* Rank and file labels */}
        {Array.from({ length: 8 }).map((_, i) => (
          <group key={`labels-${i}`}>
            <mesh position={[i - 3.5, 0, -4.2]}>
              <boxGeometry args={[0.01, 0.01, 0.01]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-4.2, 0, i - 3.5]}>
              <boxGeometry args={[0.01, 0.01, 0.01]} />
              <meshStandardMaterial color="white" />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Legal move indicators */}
      {legalMoves.map(move => (
        <MoveIndicator key={`indicator-${move}`} square={move} />
      ))}
      
      {/* Chess pieces */}
      {pieces.map(piece => (
        <ChessPiece
          key={piece.id}
          piece={piece}
          isSelected={selectedPiece?.square === piece.square}
          position={[
            piece.file - 3.5,
            0,
            piece.rank - 3.5
          ]}
        />
      ))}
    </>
  );
};

export default ChessBoard;
