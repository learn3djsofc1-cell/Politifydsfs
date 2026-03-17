import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Card1SVG = () => (
  <motion.svg viewBox="0 0 400 300" className="absolute bottom-0 left-0 w-full h-auto translate-y-[10%]">
    <defs>
      <filter id="shadow1" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" floodOpacity="0.1" />
      </filter>
    </defs>
    <motion.g
      initial={{ y: 20 }}
      animate={{ y: [20, 0, 20] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="60" y="70" width="220" height="200" rx="16" fill="#111111" filter="url(#shadow1)" />
      <circle cx="80" cy="90" r="4" fill="#333" />
      <circle cx="95" cy="90" r="4" fill="#333" />
      <circle cx="110" cy="90" r="4" fill="#333" />

      <rect x="80" y="115" width="140" height="28" rx="14" fill="#9945FF" opacity="0.2" />
      <rect x="90" y="125" width="80" height="8" rx="4" fill="#9945FF" opacity="0.8" />

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="120" y="155" width="150" height="28" rx="14" fill="#FFF" opacity="0.15" />
        <rect x="130" y="165" width="100" height="8" rx="4" fill="#FFF" opacity="0.4" />
      </motion.g>

      <rect x="80" y="195" width="130" height="28" rx="14" fill="#9945FF" opacity="0.2" />
      <rect x="90" y="205" width="70" height="8" rx="4" fill="#9945FF" opacity="0.8" />

      <motion.g
        initial={{ x: 20 }}
        animate={{ x: [20, 10, 20] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="200" y="100" width="160" height="170" rx="16" fill="#FFFFFF" filter="url(#shadow1)" stroke="#E5E5E5" strokeWidth="1" />
        <circle cx="230" cy="130" r="16" fill="#9945FF" opacity="0.2" />
        <circle cx="230" cy="130" r="8" fill="#9945FF" />
        <rect x="255" y="122" width="80" height="6" rx="3" fill="#111" />
        <rect x="255" y="136" width="50" height="6" rx="3" fill="#999" />

        <rect x="220" y="160" width="120" height="1" fill="#E5E5E5" />

        <rect x="220" y="175" width="60" height="20" rx="10" fill="#9945FF" />
        <text x="250" y="189" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle">Send</text>
        <rect x="290" y="175" width="50" height="20" rx="10" fill="#F0F0F0" />
        <text x="315" y="189" fill="#111" fontSize="10" fontWeight="bold" textAnchor="middle">Split</text>
      </motion.g>
    </motion.g>
  </motion.svg>
);

const Card2SVG = () => (
  <motion.svg viewBox="0 0 400 300" className="absolute bottom-0 left-0 w-full h-auto translate-y-[15%]">
    <defs>
      <filter id="glowShield" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#9945FF" floodOpacity="0.6" />
      </filter>
    </defs>
    <motion.g
      initial={{ y: 10 }}
      animate={{ y: [10, -5, 10] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.g
        transform="translate(200, 150)"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M0,-70 C50,-70 70,-30 70,0 C70,50 50,90 0,105 C-50,90 -70,50 -70,0 C-70,-30 -50,-70 0,-70 Z"
          fill="#1A1A1A"
          stroke="#9945FF"
          strokeWidth="3"
          filter="url(#glowShield)"
        />
        <path d="M0,-50 L0,80 M-40,0 L40,0" stroke="#9945FF" strokeWidth="1" opacity="0.15" />
        <circle cx="0" cy="0" r="20" fill="#9945FF" opacity="0.3" />
        <path d="M-8,-2 L-2,6 L10,-8" stroke="#FFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>

      {[0, 1, 2].map((i) => (
        <motion.g key={i}>
          <motion.rect
            x="0"
            y={100 + i * 30}
            width="16"
            height="3"
            rx="1.5"
            fill="#9945FF"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [20, 130], opacity: [0, 0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "linear" }}
          />
          <motion.rect
            x="0"
            y={100 + i * 30}
            width="16"
            height="3"
            rx="1.5"
            fill="#14F195"
            initial={{ x: 270, opacity: 0 }}
            animate={{ x: [270, 380], opacity: [0, 0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 + 1, ease: "linear" }}
          />
        </motion.g>
      ))}
    </motion.g>
  </motion.svg>
);

const Card3SVG = () => (
  <motion.svg viewBox="0 0 400 300" className="absolute bottom-0 left-0 w-full h-auto translate-y-[10%]">
    <defs>
      <filter id="shadow3" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.15" />
      </filter>
    </defs>

    <motion.g
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.g
        animate={{ x: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="60" y="100" width="120" height="80" rx="12" fill="#FFF" filter="url(#shadow3)" stroke="#E5E5E5" strokeWidth="1" />
        <circle cx="90" cy="130" r="14" fill="#9945FF" opacity="0.15" />
        <text x="90" y="135" fill="#9945FF" fontSize="14" fontWeight="bold" textAnchor="middle">$</text>
        <rect x="112" y="122" width="50" height="6" rx="3" fill="#111" />
        <rect x="112" y="136" width="35" height="6" rx="3" fill="#999" />
        <rect x="75" y="158" width="90" height="8" rx="4" fill="#14F195" opacity="0.3" />
      </motion.g>

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0], x: [140, 200, 200, 260] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="0" cy="140" r="10" fill="#9945FF" opacity="0.6" />
        <path d="M-4,140 L4,140 M0,136 L0,144" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      <motion.g
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <rect x="220" y="100" width="120" height="80" rx="12" fill="#FFF" filter="url(#shadow3)" stroke="#E5E5E5" strokeWidth="1" />
        <circle cx="250" cy="130" r="14" fill="#14F195" opacity="0.15" />
        <text x="250" y="135" fill="#14F195" fontSize="12" fontWeight="bold" textAnchor="middle">&#8358;</text>
        <rect x="272" y="122" width="50" height="6" rx="3" fill="#111" />
        <rect x="272" y="136" width="35" height="6" rx="3" fill="#999" />
        <rect x="235" y="158" width="90" height="8" rx="4" fill="#14F195" opacity="0.3" />
      </motion.g>
    </motion.g>
  </motion.svg>
);

const Card4SVG = () => (
  <motion.svg viewBox="0 0 400 300" className="absolute bottom-0 left-0 w-full h-auto translate-y-[20%]">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C4A6FC" />
        <stop offset="100%" stopColor="#9945FF" />
      </linearGradient>
      <filter id="glowCard" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#9945FF" floodOpacity="0.4" />
      </filter>
    </defs>

    <motion.g
      initial={{ y: 20 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.g
        animate={{ rotateY: [0, 5, 0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="100" y="80" width="200" height="130" rx="14" fill="url(#cardGrad)" filter="url(#glowCard)" />

        <rect x="120" y="100" width="40" height="28" rx="4" fill="#FFF" opacity="0.25" />
        <rect x="124" y="108" width="10" height="12" rx="2" fill="#FFF" opacity="0.4" />

        <rect x="120" y="145" width="30" height="4" rx="2" fill="#FFF" opacity="0.4" />
        <rect x="158" y="145" width="30" height="4" rx="2" fill="#FFF" opacity="0.4" />
        <rect x="196" y="145" width="30" height="4" rx="2" fill="#FFF" opacity="0.4" />
        <rect x="234" y="145" width="30" height="4" rx="2" fill="#FFF" opacity="0.4" />

        <text x="120" y="180" fill="#FFF" fontSize="10" fontWeight="bold" opacity="0.8">SENDLYFI</text>
        <text x="268" y="180" fill="#FFF" fontSize="10" fontWeight="bold" opacity="0.6">VISA</text>
      </motion.g>

      <motion.g
        animate={{ y: [-3, 3, -3], x: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="240" y="170" width="110" height="50" rx="10" fill="#111" stroke="#333" strokeWidth="1" />
        <circle cx="260" cy="195" r="8" fill="#14F195" opacity="0.3" />
        <path d="M257,195 L260,198 L264,192" stroke="#14F195" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="275" y="188" width="55" height="5" rx="2.5" fill="#FFF" opacity="0.6" />
        <rect x="275" y="198" width="35" height="5" rx="2.5" fill="#FFF" opacity="0.3" />
      </motion.g>
    </motion.g>
  </motion.svg>
);

export const FeaturesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const features = [
    {
      title: "Wallet-Native Messaging",
      description: "Chat with any wallet address. Send payments, request money, and split bills, all inside the conversation.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      bg: "bg-white",
      iconBg: "bg-[#111]",
      titleColor: "text-gray-900",
      descColor: "text-gray-500",
      Svg: Card1SVG
    },
    {
      title: "Private Payments",
      description: "End-to-end encrypted transfers with zero-knowledge proofs. Your financial data stays yours.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="#FFF" strokeWidth="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      bg: "bg-[#111111]",
      iconBg: "bg-[#9945FF]",
      titleColor: "text-white",
      descColor: "text-gray-400",
      Svg: Card2SVG,
      shadow: "shadow-xl"
    },
    {
      title: "Crypto to Fiat",
      description: "Off-ramp stablecoins to your local bank account in seconds with the best rates, powered by Solana.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 16l-4-4 4-4" stroke="#9945FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 8l4 4-4 4" stroke="#9945FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12h18" stroke="#9945FF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      bg: "bg-[#9945FF]",
      iconBg: "bg-white",
      titleColor: "text-white",
      descColor: "text-white/80",
      Svg: Card3SVG
    },
    {
      title: "Virtual Cards",
      description: "Spend your crypto anywhere with instantly generated virtual debit cards linked to your SendlyFi wallet.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="1" y="4" width="22" height="16" rx="2" stroke="#FFF" strokeWidth="2"/>
          <path d="M1 10h22" stroke="#FFF" strokeWidth="2"/>
        </svg>
      ),
      bg: "bg-[#0B0D10]",
      iconBg: "bg-[#9945FF]",
      titleColor: "text-white",
      descColor: "text-gray-400",
      Svg: Card4SVG
    }
  ];

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    })
  };

  const FeatureCard = ({ feature }: { feature: any }) => {
    const Svg = feature.Svg;
    return (
      <div className={`${feature.bg} rounded-[2.5rem] p-8 md:p-14 flex flex-col relative overflow-hidden h-[450px] md:h-[600px] ${feature.shadow || 'shadow-sm'} w-full`}>
        <div className="relative z-10">
          <div className={`w-14 h-14 md:w-16 md:h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 md:mb-8 ${feature.iconBg === 'bg-white' ? 'shadow-sm' : ''}`}>
            {feature.icon}
          </div>
          <h3 className={`text-2xl md:text-4xl font-bold ${feature.titleColor} mb-3 md:mb-4 tracking-tight`}>{feature.title}</h3>
          <p className={`${feature.descColor} text-base md:text-lg leading-relaxed max-w-md`}>
            {feature.description}
          </p>
        </div>
        <Svg />
      </div>
    );
  };

  return (
    <section id="features" className="w-full max-w-[1400px] mx-auto px-4 py-12 md:py-24 relative z-20">
      
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 md:mb-16 text-center md:text-left"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">What is SendlyFi</h2>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl leading-relaxed">
          SendlyFi is a chat-first banking app that lets you send crypto, off-ramp to fiat, and manage virtual cards, all from a single conversation thread.
        </p>
      </motion.div>

      {/* Mobile Controls */}
      <div className="flex justify-end items-center mb-6 md:hidden">
        <div className="flex gap-2">
          <button onClick={prev} className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={next} className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile View (Carousel) */}
      <div className="block md:hidden relative overflow-hidden rounded-[2.5rem]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <FeatureCard feature={features[currentIndex]} />
          </motion.div>
        </AnimatePresence>
        
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {features.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-[#9945FF]' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop View (Grid) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="hidden md:grid md:grid-cols-2 gap-6"
      >
        {features.map((feature, idx) => (
          <motion.div key={idx} variants={cardVariants}>
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};
