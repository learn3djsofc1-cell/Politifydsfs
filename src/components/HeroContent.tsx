import React from 'react';
import { motion } from 'motion/react';
import { Solana3D } from './Solana3D';

export const HeroContent = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center mt-4 md:mt-8 relative z-10 w-full max-w-4xl mx-auto px-4"
    >
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/50 backdrop-blur-md border border-white/80 rounded-full px-5 py-2 flex flex-wrap justify-center items-center gap-2 md:gap-3 shadow-sm mb-6 md:mb-8"
      >
        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-800 uppercase text-center">
          Powered By
        </span>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="#111"/>
            <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="#111"/>
            <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="#111"/>
          </svg>
          <span className="text-[10px] md:text-xs font-bold tracking-[0.1em] text-black">SOLANA</span>
        </div>
      </motion.div>

      {/* Text Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-4 md:mb-6 relative z-20 px-4"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#111] mb-4 leading-[1.1]">
          Chat Is the New Bank
        </h1>
        <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Send money, swap crypto, and off-ramp to your bank, all from a single chat thread.
        </p>
      </motion.div>

      {/* 3D Object */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[220px] md:max-w-[320px] aspect-square flex items-center justify-center mb-6 md:mb-8"
      >
        <Solana3D />
      </motion.div>

      {/* Value Proposition */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative z-20 px-4 max-w-3xl mx-auto"
      >
        <p className="text-gray-500 text-sm md:text-base leading-relaxed">
          SendlyFi turns any messaging thread into a full-service wallet. Pay friends in stablecoins, convert crypto to local currency in seconds, and manage virtual cards. No bank app required. Simple, private, and built on Solana for instant settlement.
        </p>
      </motion.div>
    </motion.div>
  );
};
