import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useChessStore } from "../../lib/stores/useChessStore";
import { ChessPiece as ChessPieceType, BoardPosition } from "../../lib/types";
import { PIECE_MODELS } from "../../lib/constants";

interface ChessPieceProps {
  piece: ChessPieceType;
  isSelected: boolean;
  position: [number, number, number];
}

const ChessPiece = ({ piece, isSelected, position }: ChessPieceProps) => {
  const { startDrag, updateDrag, endDrag, draggedPiece, turn } = useChessStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isDragged = draggedPiece?.piece.square === piece.square;
  const isDraggable = turn === piece.color;
  
  // Get piece model information
  const pieceType = PIECE_MODELS[piece.type].geometry;
  const pieceHeight = PIECE_MODELS[piece.type].height;
  
  // Handle animation and drag effects
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Hover effect - slight elevation
    if (hovered && isDraggable && !isDragged) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        0.3,
        0.1
      );
    } 
    // Selection effect - more prominent elevation
    else if (isSelected && !isDragged) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        0.5,
        0.1
      );
    }
    // Dragging effect - follow cursor
    else if (isDragged && draggedPiece) {
      meshRef.current.position.x = draggedPiece.current.x;
      meshRef.current.position.y = Math.max(0.5, draggedPiece.current.y);
      meshRef.current.position.z = draggedPiece.current.z;
    }
    // Default position
    else {
      meshRef.current.position.x = position[0];
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        position[1],
        0.1
      );
      meshRef.current.position.z = position[2];
    }
    
    // Scale effect on hover/select
    if ((hovered && isDraggable) || isSelected) {
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, 1.1, 0.1)
      );
    } else {
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, 1.0, 0.1)
      );
    }
  });
  
  // Handle pointer events for drag and drop
  const handlePointerDown = (e: any) => {
    if (!isDraggable || !meshRef.current) return;
    
    e.stopPropagation();
    const { x, y, z } = meshRef.current.position;
    startDrag(piece, { x, y, z });
  };
  
  const handlePointerMove = (e: any) => {
    if (!isDragged || !meshRef.current) return;
    
    e.stopPropagation();
    
    // Get the intersection point with the board plane
    const boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    
    // Use pointer coordinates from the event
    if (e.pointer) {
      raycaster.setFromCamera(e.pointer, e.camera);
    } else {
      // Fallback to a default position if pointer not available
      return;
    }
    
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(boardPlane, intersection);
    
    // Update drag position
    updateDrag({ x: intersection.x, y: intersection.y, z: intersection.z });
  };
  
  const handlePointerUp = (e: any) => {
    if (!isDragged || !meshRef.current) return;
    
    e.stopPropagation();
    
    // Get the intersection point with the board plane
    const boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    
    // Use pointer coordinates from the event
    if (e.pointer) {
      raycaster.setFromCamera(e.pointer, e.camera);
    } else {
      // Fallback to a default position if pointer not available
      return;
    }
    
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(boardPlane, intersection);
    
    // End drag
    endDrag({ x: intersection.x, y: intersection.y, z: intersection.z });
  };
  
  // Get correct geometry based on piece type
  const renderGeometry = () => {
    switch(pieceType) {
      case "cylinder":
        return <cylinderGeometry args={[0.2, 0.3, 0.5, 16]} />;
      case "box":
        return <boxGeometry args={[0.4, 0.8, 0.4]} />;
      case "knight":
        return (
          <>
            <cylinderGeometry args={[0.25, 0.3, 0.4, 16]} />
            <boxGeometry args={[0.25, 0.5, 0.2]} />
          </>
        );
      case "bishop":
        return (
          <>
            <cylinderGeometry args={[0.2, 0.35, 0.6, 16]} />
            <sphereGeometry args={[0.2, 16, 16]} />
          </>
        );
      case "queen":
        return (
          <>
            <cylinderGeometry args={[0.3, 0.4, 0.7, 16]} />
            <sphereGeometry args={[0.25, 16, 16]} />
          </>
        );
      case "king":
        return (
          <>
            <cylinderGeometry args={[0.3, 0.4, 0.7, 16]} />
            <boxGeometry args={[0.15, 0.3, 0.15]} />
          </>
        );
      default:
        return <boxGeometry args={[0.3, 0.3, 0.3]} />;
    }
  };
  
  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1] + pieceHeight / 2, position[2]]}
      castShadow
      receiveShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      userData={{ type: piece.type, color: piece.color, square: piece.square }}
    >
      {renderGeometry()}
      <meshStandardMaterial 
        color={piece.color === "w" ? "#f9f9f9" : "#333333"}
        roughness={0.5}
        metalness={0.2}
        emissive={isSelected ? new THREE.Color(0x555555) : undefined}
        emissiveIntensity={isSelected ? 0.5 : 0}
      />
    </mesh>
  );
};

export default ChessPiece;
