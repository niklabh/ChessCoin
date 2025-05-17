import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Create the chess board
const ChessBoard = () => {
  const boardSize = 8;
  const squares = [];

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const isWhite = (i + j) % 2 === 0;
      const position: [number, number, number] = [i - 3.5, 0, j - 3.5];

      squares.push(
        <mesh 
          key={`${i}-${j}`} 
          position={position}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial 
            color={isWhite ? '#f0d9b5' : '#b58863'} 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      );
    }
  }

  return <group>{squares}</group>;
};

// Create a basic piece
const ChessPiece = ({ 
  position, 
  color = 'white',
  pieceType = 'pawn'
}: { 
  position: [number, number, number]; 
  color?: string;
  pieceType?: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  let geometry;
  let height = 0.5;
  
  // Create a different geometry based on piece type
  switch (pieceType) {
    case 'pawn':
      geometry = <cylinderGeometry args={[0.2, 0.3, 0.5, 16]} />;
      height = 0.5;
      break;
    case 'rook':
      geometry = <boxGeometry args={[0.4, 0.8, 0.4]} />;
      height = 0.8;
      break;
    case 'knight':
      geometry = <cylinderGeometry args={[0.25, 0.25, 0.7, 16]} />;
      height = 0.7;
      break;
    case 'bishop':
      geometry = <coneGeometry args={[0.3, 0.8, 16]} />;
      height = 0.8;
      break;
    case 'queen':
      geometry = <cylinderGeometry args={[0.3, 0.3, 0.9, 16]} />;
      height = 0.9;
      break;
    case 'king':
      geometry = <cylinderGeometry args={[0.3, 0.3, 1, 16]} />;
      height = 1;
      break;
    default:
      geometry = <boxGeometry args={[0.3, 0.5, 0.3]} />;
  }
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.y = height / 2;
    }
  }, [height]);
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {geometry}
      <meshStandardMaterial 
        color={color === 'white' ? '#f9f9f9' : '#333333'} 
        metalness={0.2}
        roughness={0.5}
        emissive={hovered ? new THREE.Color(0x555555) : undefined}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
};

// Set up initial pieces
const setupInitialPieces = () => {
  const pieces = [];
  
  // Pawns
  for (let i = 0; i < 8; i++) {
    pieces.push({
      id: `white-pawn-${i}`,
      position: [i - 3.5, 0, 1.5],
      color: 'white',
      pieceType: 'pawn',
    });
    
    pieces.push({
      id: `black-pawn-${i}`,
      position: [i - 3.5, 0, -1.5],
      color: 'black',
      pieceType: 'pawn',
    });
  }
  
  // Rooks
  pieces.push({ id: 'white-rook-1', position: [-3.5, 0, 3.5], color: 'white', pieceType: 'rook' });
  pieces.push({ id: 'white-rook-2', position: [3.5, 0, 3.5], color: 'white', pieceType: 'rook' });
  pieces.push({ id: 'black-rook-1', position: [-3.5, 0, -3.5], color: 'black', pieceType: 'rook' });
  pieces.push({ id: 'black-rook-2', position: [3.5, 0, -3.5], color: 'black', pieceType: 'rook' });
  
  // Knights
  pieces.push({ id: 'white-knight-1', position: [-2.5, 0, 3.5], color: 'white', pieceType: 'knight' });
  pieces.push({ id: 'white-knight-2', position: [2.5, 0, 3.5], color: 'white', pieceType: 'knight' });
  pieces.push({ id: 'black-knight-1', position: [-2.5, 0, -3.5], color: 'black', pieceType: 'knight' });
  pieces.push({ id: 'black-knight-2', position: [2.5, 0, -3.5], color: 'black', pieceType: 'knight' });
  
  // Bishops
  pieces.push({ id: 'white-bishop-1', position: [-1.5, 0, 3.5], color: 'white', pieceType: 'bishop' });
  pieces.push({ id: 'white-bishop-2', position: [1.5, 0, 3.5], color: 'white', pieceType: 'bishop' });
  pieces.push({ id: 'black-bishop-1', position: [-1.5, 0, -3.5], color: 'black', pieceType: 'bishop' });
  pieces.push({ id: 'black-bishop-2', position: [1.5, 0, -3.5], color: 'black', pieceType: 'bishop' });
  
  // Queens
  pieces.push({ id: 'white-queen', position: [-0.5, 0, 3.5], color: 'white', pieceType: 'queen' });
  pieces.push({ id: 'black-queen', position: [-0.5, 0, -3.5], color: 'black', pieceType: 'queen' });
  
  // Kings
  pieces.push({ id: 'white-king', position: [0.5, 0, 3.5], color: 'white', pieceType: 'king' });
  pieces.push({ id: 'black-king', position: [0.5, 0, -3.5], color: 'black', pieceType: 'king' });
  
  return pieces;
};

// Main chess game component
const BasicChessGame = () => {
  const [pieces] = useState(setupInitialPieces());
  
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        <PerspectiveCamera makeDefault position={[0, 10, 10]} fov={45} />
        <OrbitControls 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minPolarAngle={0.1}
          minDistance={5}
          maxDistance={20}
        />
        
        <color attach="background" args={["#1a202c"]} />
        
        {/* Board base */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[10, 10, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        <ChessBoard />
        
        {pieces.map(piece => (
          <ChessPiece 
            key={piece.id}
            position={piece.position as [number, number, number]}
            color={piece.color}
            pieceType={piece.pieceType}
          />
        ))}
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-xs">
        <h3 className="text-lg font-bold mb-2">Controls:</h3>
        <ul className="text-sm">
          <li>Mouse: Left-click & drag to rotate view</li>
          <li>Mouse: Scroll to zoom in/out</li>
          <li>Mouse: Middle-click & drag to pan</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicChessGame;