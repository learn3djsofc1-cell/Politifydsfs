import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Robot Component ---
const Robot = (props: any) => {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  
  // Animation state
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t / 2) * 0.1;
      headRef.current.rotation.z = Math.cos(t / 1.5) * 0.05;
      headRef.current.position.y = 1.5 + Math.sin(t * 1.5) * 0.1;
    }
    
    if (bodyRef.current) {
      bodyRef.current.rotation.y = Math.sin(t / 2) * 0.05;
      bodyRef.current.position.y = 0 + Math.sin(t * 1.5 - 0.5) * 0.1;
    }

    // Blinking eyes
    if (eyesRef.current) {
      if (Math.random() > 0.99) {
        eyesRef.current.scale.y = 0.1;
      } else {
        eyesRef.current.scale.y = THREE.MathUtils.lerp(eyesRef.current.scale.y, 1, 0.2);
      }
    }
  });

  return (
    <group {...props}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* HEAD */}
        <group ref={headRef} position={[0, 1.5, 0]}>
          {/* Main Head Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.2, 1.2]} />
            <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
          </mesh>
          
          {/* Glowing Face Screen */}
          <mesh position={[0, 0, 0.61]}>
            <planeGeometry args={[1.1, 0.9]} />
            <meshStandardMaterial color="#000" roughness={0.2} metalness={0.9} emissive="#1a0b2e" emissiveIntensity={0.5} />
          </mesh>

          {/* Purple Rim Light on Head */}
          <mesh position={[0, 0, 0.62]}>
            <ringGeometry args={[0.6, 0.65, 4]} />
            <meshBasicMaterial color="#9945FF" toneMapped={false} />
          </mesh>

          {/* Eyes */}
          <group ref={eyesRef} position={[0, 0.1, 0.62]}>
            <mesh position={[-0.25, 0, 0]}>
              <circleGeometry args={[0.12, 32]} />
              <meshBasicMaterial color="#FFF" toneMapped={false} />
            </mesh>
            <mesh position={[0.25, 0, 0]}>
              <circleGeometry args={[0.12, 32]} />
              <meshBasicMaterial color="#FFF" toneMapped={false} />
            </mesh>
          </group>

          {/* Antennas */}
          <mesh position={[-0.6, 0.7, 0]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0.6, 0.7, 0]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[-0.6, 0.95, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="#9945FF" emissive="#9945FF" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <mesh position={[0.6, 0.95, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="#9945FF" emissive="#9945FF" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>

        {/* BODY */}
        <group ref={bodyRef} position={[0, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 1.2, 0.8]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.3} metalness={0.7} />
          </mesh>
          
          {/* Chest Light */}
          <mesh position={[0, 0.2, 0.41]}>
            <boxGeometry args={[0.4, 0.1, 0.05]} />
            <meshStandardMaterial color="#9945FF" emissive="#9945FF" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>

        {/* FLOATING HANDS */}
        <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[-0.8, 0, 0.2]} rotation={[0, 0, 0.2]} castShadow>
            <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
        </Float>
        <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[0.8, 0, 0.2]} rotation={[0, 0, -0.2]} castShadow>
            <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
        </Float>
      </Float>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} castShadow shadow-bias={-0.0001} />
      <pointLight position={[-10, -10, -10]} intensity={5} color="#9945FF" />
      <pointLight position={[0, 5, 3]} intensity={2} color="#C4A6FC" />
      
      <Robot position={[0, -0.5, 0]} />
      
      <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000" />
      
      <Environment preset="city">
        <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 2, 1]} />
      </Environment>
    </>
  );
};

export const CTASection = () => {
  return (
    <section id="cta" className="w-full bg-[#050505] py-24 relative overflow-hidden border-t border-white/5">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#9945FF] rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#14F195] rounded-full blur-[150px] opacity-5" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Cyberpunk Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            {/* The "Cut" Card Container */}
            <div 
              className="relative bg-[#0A0A0A] p-1"
              style={{
                clipPath: "polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)"
              }}
            >
              {/* Animated Border Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#9945FF] opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" />
              
              {/* Inner Content Content */}
              <div 
                className="relative bg-[#080808] p-8 md:p-12 h-full flex flex-col justify-center"
                style={{
                  clipPath: "polygon(38px 0, 100% 0, 100% calc(100% - 38px), calc(100% - 38px) 100%, 0 100%, 0 38px)"
                }}
              >
                {/* Decorative Tech Lines */}
                <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/10 opacity-50" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-white/10 opacity-50" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 bg-[#14F195] rounded-full animate-pulse" />
                  <span className="text-[#14F195] font-mono text-sm tracking-widest uppercase">System Ready</span>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                  The Future of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#C4A6FC]">
                    Money Is a Message
                  </span>
                </h2>
                
                <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
                  Join thousands of users who are already banking through chat. Send, spend, and save with SendlyFi.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/dashboard" className="px-8 py-4 bg-[#9945FF] text-white font-bold text-lg hover:bg-[#8030E0] transition-all flex items-center justify-center gap-2 group relative overflow-hidden clip-path-button">
                    <span className="relative z-10 flex items-center gap-2">
                      Launch App <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  
                  <Link to="/docs" className="px-8 py-4 bg-transparent text-white border border-white/20 font-bold text-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group">
                    <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    Documentation
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: 3D Robot Scene */}
          <div className="h-[500px] w-full relative">
            <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }}>
              <Scene />
            </Canvas>
            
            {/* Floating UI Elements around Robot */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-10 right-10 bg-black/40 backdrop-blur-md border border-[#9945FF]/30 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-[#9945FF]" />
                <span className="text-xs text-[#9945FF] font-mono">SETTLEMENT</span>
              </div>
              <div className="text-2xl font-bold text-white">&lt; 1s</div>
            </motion.div>

             <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-20 left-0 bg-black/40 backdrop-blur-md border border-[#14F195]/30 p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-[#14F195] rounded-full animate-pulse" />
                <span className="text-xs text-[#14F195] font-mono">STATUS</span>
              </div>
              <div className="text-lg font-bold text-white">Online</div>
            </motion.div>
          </div>

        </div>
      </div>
      
      <style>{`
        .clip-path-button {
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
      `}</style>
    </section>
  );
};
