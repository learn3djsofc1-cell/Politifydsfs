import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ShieldCheck, CreditCard } from 'lucide-react';

const LumenCard = ({ title, description, Icon, defaultActive = false }: { title: string, description: string, Icon: React.ElementType, defaultActive?: boolean }) => {
  const [isActive, setIsActive] = useState(defaultActive);

  const toggle = () => setIsActive(!isActive);

  // Flicker animation for the neon light shelf
  const lightVariants = {
    off: {
      opacity: 0.3,
      boxShadow: "0px 0px 0px rgba(153, 69, 255, 0)",
      backgroundColor: "#333333",
      transition: { duration: 0.3 }
    },
    on: {
      opacity: [0.3, 1, 0.5, 1, 0.8, 1],
      boxShadow: [
        "0px 0px 0px rgba(153, 69, 255, 0)",
        "0px 10px 50px rgba(153, 69, 255, 1)",
        "0px 5px 25px rgba(153, 69, 255, 0.6)",
        "0px 10px 50px rgba(153, 69, 255, 1)",
        "0px 8px 35px rgba(153, 69, 255, 0.8)",
        "0px 20px 80px rgba(153, 69, 255, 0.9)", // Final steady glow
      ],
      backgroundColor: "#EFEAFC", // Bright white/purple core
      transition: { duration: 0.5, times: [0, 0.1, 0.2, 0.3, 0.4, 1] }
    }
  };

  const ambientVariants = {
    off: { opacity: 0, scale: 0.8, transition: { duration: 0.5 } },
    on: { opacity: 0.25, scale: 1.1, transition: { duration: 1, delay: 0.2 } }
  };

  return (
    <div className="relative bg-[#111111] rounded-[2rem] p-8 border border-white/5 overflow-hidden flex flex-col justify-between h-[400px] group transition-colors duration-500 hover:border-white/10">
      {/* Ambient Background Glow */}
      <motion.div
        variants={ambientVariants}
        initial="off"
        animate={isActive ? "on" : "off"}
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-64 h-64 bg-[#9945FF] rounded-full blur-[100px] pointer-events-none"
      />

      {/* Top Section: Icon & Light Shelf */}
      <div className="relative z-10 flex flex-col items-center pt-8">
        <motion.div
          animate={{ 
            color: isActive ? "#EFEAFC" : "#444444",
            y: isActive ? -5 : 0,
            scale: isActive ? 1.1 : 1,
            filter: isActive ? "drop-shadow(0px -10px 20px rgba(153, 69, 255, 0.6))" : "drop-shadow(0px 0px 0px rgba(0,0,0,0))"
          }}
          transition={{ duration: 0.3 }}
          className="mb-12 relative"
        >
          <Icon size={48} strokeWidth={1.5} />
        </motion.div>

        {/* The Light Shelf */}
        <div className="relative w-3/4 max-w-[200px] h-1 rounded-full">
          <motion.div
            variants={lightVariants}
            initial="off"
            animate={isActive ? "on" : "off"}
            className="absolute inset-0 rounded-full"
          />
          {/* Subtle reflection on the "wall" below the shelf */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 0.8 : 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-1 left-[10%] right-[10%] h-16 bg-gradient-to-b from-[#9945FF]/60 to-transparent blur-md pointer-events-none"
          />
        </div>
      </div>

      {/* Bottom Section: Text & Toggle */}
      <div className="relative z-10 mt-auto">
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        <div className="flex items-end justify-between gap-4">
          <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">
            {description}
          </p>
          
          {/* Custom Toggle Switch */}
          <div className="flex flex-col items-end gap-2 relative">
            <div 
              onClick={toggle}
              className="w-16 h-8 bg-[#0A0A0A] rounded-full p-1 border border-white/10 relative shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] cursor-pointer flex items-center"
            >
              {/* Active Track Background */}
              <motion.div
                className="absolute left-1 top-1 bottom-1 rounded-full bg-gradient-to-r from-[#5E35B1] to-[#9945FF]"
                initial={false}
                animate={{ 
                  width: isActive ? 'calc(100% - 8px)' : '24px', 
                  opacity: isActive ? 1 : 0.2,
                  filter: isActive ? 'blur(0px)' : 'blur(2px)'
                }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              />
              
              {/* Knob */}
              <motion.div
                className="w-6 h-6 bg-gradient-to-b from-[#EFEAFC] to-[#999999] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 flex items-center justify-center border border-white/20"
                initial={false}
                animate={{ x: isActive ? 32 : 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Indicator line on knob */}
                <motion.div 
                  className="w-0.5 h-3 rounded-full"
                  animate={{ 
                    backgroundColor: isActive ? "#9945FF" : "#666666",
                    boxShadow: isActive ? "0 0 5px #9945FF" : "none"
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InteractiveCardsSection = () => {
  const cards = [
    {
      title: "Chat Banking",
      description: "A beautiful messaging interface where you send money, request payments, and manage your finances, all in one thread.",
      Icon: MessageSquare,
      defaultActive: true
    },
    {
      title: "Privacy Engine",
      description: "Zero-knowledge proofs and end-to-end encryption ensure your transactions and balances remain private by default.",
      Icon: ShieldCheck,
      defaultActive: false
    },
    {
      title: "Smart Cards",
      description: "Instantly generate virtual debit cards linked to your wallet. Spend crypto anywhere cards are accepted, with real-time controls.",
      Icon: CreditCard,
      defaultActive: false
    }
  ];

  return (
    <section id="product" className="w-full bg-[#050505] relative py-24 overflow-hidden border-t border-white/5">
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      {/* Decorative background elements (wireframe boxes) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] border border-white/5 rounded-[4rem] pointer-events-none opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[100%] border border-white/5 rounded-[5rem] pointer-events-none opacity-30" />

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 md:mb-16 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">The SendlyFi Stack</h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl leading-relaxed">
            SendlyFi is built on three pillars: conversational banking, privacy-first infrastructure, and smart card technology.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map((card, idx) => (
            <LumenCard key={idx} {...card} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
