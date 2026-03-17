import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Lightformer, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const SolanaBlock = ({ position, rotation, scale = 1, gradientTexture }: any) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const width = 4.5;
    const height = 1.2;
    const skew = 1.2;
    
    s.moveTo(-width/2 - skew/2, -height/2);
    s.lineTo(width/2 - skew/2, -height/2);
    s.lineTo(width/2 + skew/2, height/2);
    s.lineTo(-width/2 + skew/2, height/2);
    s.lineTo(-width/2 - skew/2, -height/2);
    return s;
  }, []);

  const extrudeSettings = {
    depth: 0.8,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  };

  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshPhysicalMaterial 
        map={gradientTexture}
        metalness={0.6} 
        roughness={0.1} 
        clearcoat={1} 
        clearcoatRoughness={0.1}
        envMapIntensity={2}
      />
    </mesh>
  );
};

const SolanaLogo = ({ scale = 1 }: { scale?: number }) => {
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 512, 0);
      gradient.addColorStop(0, '#C4A6FC'); // Light Purple
      gradient.addColorStop(1, '#311B92'); // Dark Purple
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.05, 0.05);
    return texture;
  }, []);

  const zOffset = -0.4;

  return (
    <group scale={scale}>
      {/* Top */}
      <SolanaBlock position={[0, 2, zOffset]} rotation={[0, 0, 0]} gradientTexture={gradientTexture} />
      {/* Middle */}
      <SolanaBlock position={[0, 0, zOffset]} rotation={[0, Math.PI, 0]} gradientTexture={gradientTexture} />
      {/* Bottom */}
      <SolanaBlock position={[0, -2, zOffset]} rotation={[0, 0, 0]} gradientTexture={gradientTexture} />
    </group>
  );
};

const SceneAssembly = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Global mouse tracking so the object moves even when the mouse is outside the canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      // Smooth linear interpolation (lerp) towards pointer position
      const targetX = mousePosition.x * (Math.PI / 4);
      const targetY = mousePosition.y * (Math.PI / 4);
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={1.5}>
        {/* Center Solana Logo */}
        <SolanaLogo scale={0.45} />

        {/* Inner Ring */}
        <mesh rotation={[-0.2, 0.4, 0]} castShadow receiveShadow>
          <torusGeometry args={[2.8, 0.35, 64, 128]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.4} roughness={0.15} clearcoat={1} />
        </mesh>

        {/* Outer Ring */}
        <mesh rotation={[0.2, -0.4, 0]} castShadow receiveShadow>
          <torusGeometry args={[4.2, 0.35, 64, 128]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.4} roughness={0.15} clearcoat={1} />
        </mesh>

        {/* Purple Sphere (Top Left on Outer Ring) */}
        <mesh position={[-2.8, 2.8, 1.2]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshPhysicalMaterial color="#4527A0" metalness={0.9} roughness={0.05} clearcoat={1} />
        </mesh>

        {/* White Sphere (Left on Inner Ring) */}
        <mesh position={[-2.8, -0.2, 0.8]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.5} roughness={0.1} clearcoat={1} />
        </mesh>

        {/* Floating Gem (Icosahedron Top Left) */}
        <mesh position={[-4.5, 3.5, -1]} rotation={[0.5, 0.5, 0]} castShadow receiveShadow>
          <icosahedronGeometry args={[0.25, 0]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.5} roughness={0.1} clearcoat={1} />
        </mesh>
      </Float>
    </group>
  );
};

export const Solana3D = () => {
  return (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-none">
      <Canvas shadows camera={{ position: [0, 0, 18], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow shadow-bias={-0.0001} />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={1} color="#9945FF" />
        
        <SceneAssembly />

        <Environment resolution={256}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
            <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
            <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
            <Lightformer form="ring" color="#C4A6FC" intensity={5} scale={10} position={[-15, 4, -18]} target={[0, 0, 0]} />
            <Lightformer form="ring" color="#9945FF" intensity={5} scale={10} position={[15, 4, -18]} target={[0, 0, 0]} />
          </group>
        </Environment>

        <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2.5} far={6} />
      </Canvas>
    </div>
  );
};

