import { useRef } from "react";
import * as THREE from "three";
import { useHelper } from "@react-three/drei";

const Lights = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  
  // Uncomment this line to debug the light direction
  // useHelper(directionalLightRef, THREE.DirectionalLightHelper, 1, 'red');
  
  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light with shadows */}
      <directionalLight
        ref={directionalLightRef}
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light from the opposite side */}
      <directionalLight 
        position={[-5, 8, -5]} 
        intensity={0.3} 
      />
      
      {/* Soft light from below for subtle highlights */}
      <hemisphereLight
        args={["#ffffff", "#303030", 0.3]}
      />
    </>
  );
};

export default Lights;
