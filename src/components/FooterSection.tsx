import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Environment, ContactShadows, Stars } from '@react-three/drei';
import { Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const Cube = ({ position, color, emissive, ...props }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Subtle breathing animation for individual cubes
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.05;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[1, 1, 1]} // Width, Height, Depth
      radius={0.05} // Radius of the rounded corners
      smoothness={4} // Number of segments
      position={position}
      {...props}
    >
      <meshPhysicalMaterial
        color={color}
        emissive={emissive || "#000"}
        emissiveIntensity={emissive ? 2 : 0}
        roughness={0.1}
        metalness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.1}
        reflectivity={1}
      />
    </RoundedBox>
  );
};

const CubicCluster = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Slow rotation of the entire cluster
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.1;
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const cubeSize = 1.05; // Slightly larger than 1 to leave a gap if needed, or tight fit

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Center Cube (Black/Dark) */}
        <Cube position={[0, 0, 0]} color="#050505" />

        {/* Surrounding Cubes (Purple & White accents) */}
        <Cube position={[cubeSize, 0, 0]} color="#111" emissive="#9945FF" /> {/* Right - Purple Glow */}
        <Cube position={[-cubeSize, 0, 0]} color="#111" /> {/* Left */}
        
        <Cube position={[0, cubeSize, 0]} color="#FFF" /> {/* Top - White */}
        <Cube position={[0, -cubeSize, 0]} color="#111" /> {/* Bottom */}
        
        <Cube position={[0, 0, cubeSize]} color="#111" /> {/* Front */}
        <Cube position={[0, 0, -cubeSize]} color="#111" emissive="#9945FF" /> {/* Back - Purple Glow */}
      </Float>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={10} color="#FFF" />
      <pointLight position={[-10, -10, -10]} intensity={5} color="#9945FF" />
      <spotLight position={[0, 10, 0]} intensity={5} penumbra={1} color="#C4A6FC" />
      
      <CubicCluster />
      
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000" />
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

import { Logo } from './Logo';

export const FooterSection = () => {
  return (
    <footer className="w-full bg-black text-white pt-24 relative overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
          <Scene />
        </Canvas>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-32">
          
          {/* Left Column: Logo & Socials */}
          <div className="md:col-span-4 flex flex-col">
            <h4 className="text-sm font-semibold mb-6 text-gray-400">Built by</h4>
            
            {/* Logo Mockup */}
            <Link to="/" className="flex items-center gap-3 mb-8">
              <Logo className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="text-xl font-bold leading-none tracking-wider">SENDLYFI</span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm mb-1">© 2026 SendlyFi.</p>
            <p className="text-gray-400 text-sm mb-8">All rights reserved.</p>

            {/* Social Icons */}
            <div className="flex items-center gap-6 text-gray-400">
              <a href="https://x.com/SendlyFi" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DA1F2] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Middle Column: Product Links */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="text-sm font-semibold mb-6 text-white">Product</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-sm">
              <li><Link to="/dashboard/chat" className="hover:text-[#9945FF] transition-colors">Chat Wallet</Link></li>
              <li><Link to="/dashboard/cards" className="hover:text-[#9945FF] transition-colors">Virtual Cards</Link></li>
              <li><Link to="/docs#privacy" className="hover:text-[#9945FF] transition-colors">Privacy & Security</Link></li>
            </ul>
          </div>

          {/* Middle Column: Resources Links */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="text-sm font-semibold mb-6 text-white">Resources</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-sm">
              <li><Link to="/docs" className="hover:text-[#14F195] transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Right Column: Connect Links */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="text-sm font-semibold mb-6 text-white">Connect</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-sm">
              <li><a href="https://x.com/SendlyFi" target="_blank" rel="noopener noreferrer" className="hover:text-[#00C2FF] transition-colors">X / Twitter</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Far Right Column: Legal Links */}
          <div className="md:col-span-2 flex flex-col">
            <h4 className="text-sm font-semibold mb-6 text-white">Legal</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};
