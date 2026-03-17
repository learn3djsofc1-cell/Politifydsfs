import React from 'react';
import { motion } from 'motion/react';

const ExecutionSVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full">
    <defs>
      <linearGradient id="execGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#9945FF" />
        <stop offset="100%" stopColor="#C4A6FC" />
      </linearGradient>
      <filter id="glowExec" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#9945FF" floodOpacity="0.4" />
      </filter>
    </defs>

    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E5E5" strokeWidth="1" opacity="0.5"/>
    </pattern>
    <rect width="100%" height="100%" fill="url(#grid)" />

    <motion.g
      initial={{ scale: 0.9 }}
      animate={{ scale: [0.9, 1, 0.9] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="200" cy="100" r="40" fill="#111" stroke="url(#execGrad)" strokeWidth="2" filter="url(#glowExec)" />
      <rect x="185" y="82" width="30" height="22" rx="4" fill="none" stroke="#9945FF" strokeWidth="2" />
      <circle cx="193" cy="92" r="2" fill="#9945FF" />
      <circle cx="207" cy="92" r="2" fill="#9945FF" />
      <path d="M190,100 Q200,108 210,100" fill="none" stroke="#9945FF" strokeWidth="2" strokeLinecap="round" />
      <line x1="200" y1="104" x2="200" y2="115" stroke="#9945FF" strokeWidth="2" />
      <circle cx="200" cy="118" r="3" fill="#9945FF" />
    </motion.g>

    {[0, 72, 144, 216, 288].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x = 200 + Math.cos(rad) * 120;
      const y = 100 + Math.sin(rad) * 80;
      return (
        <g key={i}>
          <line x1="200" y1="100" x2={x} y2={y} stroke="#9945FF" strokeWidth="1" opacity="0.3" />
          <circle cx={x} cy={y} r="8" fill="#FFF" stroke="#111" strokeWidth="2" />

          <motion.circle
            r="4"
            fill="#9945FF"
            initial={{ cx: 200, cy: 100, opacity: 0 }}
            animate={{
              cx: [200, x],
              cy: [100, y],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.4
            }}
          />
        </g>
      );
    })}
  </svg>
);

const OrchestrationSVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full">
    <defs>
      <linearGradient id="orchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF" />
        <stop offset="100%" stopColor="#F0F0F0" />
      </linearGradient>
    </defs>

    <rect x="130" y="30" width="140" height="140" rx="16" fill="url(#orchGrad)" stroke="#E5E5E5" strokeWidth="1" />

    <circle cx="200" cy="90" r="30" fill="none" stroke="#9945FF" strokeWidth="3" />
    <line x1="200" y1="90" x2="200" y2="70" stroke="#111" strokeWidth="3" strokeLinecap="round" />
    <motion.line
      x1="200" y1="90" x2="218" y2="98"
      stroke="#9945FF" strokeWidth="2" strokeLinecap="round"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: '200px 90px' }}
    />
    <circle cx="200" cy="90" r="3" fill="#9945FF" />

    {[0, 1, 2].map((i) => (
      <motion.g key={i}>
        <rect x={150 + i * 30} y="138" width="20" height="6" rx="3" fill="#9945FF" opacity="0.2" />
        <motion.rect
          x={150 + i * 30} y="138" width="20" height="6" rx="3"
          fill="#9945FF"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeInOut" }}
          style={{ transformOrigin: `${150 + i * 30}px 141px` }}
        />
      </motion.g>
    ))}
  </svg>
);

const RiskSVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full">
    <defs>
      <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#9945FF" floodOpacity="0.3" />
      </filter>
    </defs>

    {/* Incoming Data Stream (Threats) */}
    {[0, 1, 2, 3].map((i) => (
      <motion.rect
        key={i}
        x="0"
        y={60 + i * 25}
        width="20"
        height="4"
        fill="#111"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: [0, 180], opacity: [0, 1, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          delay: i * 0.5,
          ease: "linear" 
        }}
      />
    ))}

    {/* Shield */}
    <motion.g
      transform="translate(200, 100)"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path 
        d="M0,-60 C40,-60 60,-20 60,0 C60,40 40,80 0,90 C-40,80 -60,40 -60,0 C-60,-20 -40,-60 0,-60 Z" 
        fill="#FFFFFF" 
        stroke="#9945FF" 
        strokeWidth="3"
        filter="url(#shieldGlow)"
      />
      <path 
        d="M0,-40 L0,70 M-30,0 L30,0" 
        stroke="#9945FF" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.2"
      />
      <circle cx="0" cy="0" r="15" fill="#9945FF" />
      <path d="M-5,0 L0,5 L5,-5" stroke="#FFF" strokeWidth="2" fill="none" />
    </motion.g>
  </svg>
);

const ObservabilitySVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full">
    <defs>
      <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#9945FF" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#9945FF" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Dashboard Frame */}
    <rect x="50" y="30" width="300" height="140" rx="12" fill="#FFF" stroke="#E5E5E5" strokeWidth="1" />
    
    {/* Header */}
    <rect x="50" y="30" width="300" height="30" rx="12" fill="#FAFAFA" />
    <circle cx="70" cy="45" r="4" fill="#FF5F56" />
    <circle cx="85" cy="45" r="4" fill="#FFBD2E" />
    <circle cx="100" cy="45" r="4" fill="#27C93F" />

    {/* Line Chart */}
    <g transform="translate(70, 80)">
      <motion.path
        d="M0,50 L20,40 L40,45 L60,20 L80,30 L100,10 L120,25 L140,5"
        fill="none"
        stroke="#9945FF"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <path d="M0,50 L20,40 L40,45 L60,20 L80,30 L100,10 L120,25 L140,5 V60 H0 Z" fill="url(#chartFill)" />
    </g>

    {/* Bar Chart */}
    <g transform="translate(240, 80)">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.rect
          key={i}
          x={i * 15}
          y="0"
          width="10"
          height="50"
          fill="#111"
          opacity="0.8"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0.2, 0.8, 0.4, 1, 0.6][i] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.1
          }}
          style={{ transformOrigin: 'bottom' }}
        />
      ))}
    </g>
  </svg>
);

const CollaborationSVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full">
    <g stroke="#9945FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.3">
      <line x1="200" y1="55" x2="130" y2="130" />
      <line x1="200" y1="55" x2="270" y2="130" />
      <line x1="130" y1="130" x2="270" y2="130" />
    </g>

    <rect x="170" y="140" width="60" height="35" rx="8" fill="#FFF" stroke="#9945FF" strokeWidth="2" />
    <rect x="180" y="150" width="20" height="4" rx="2" fill="#9945FF" opacity="0.5" />
    <rect x="180" y="160" width="40" height="4" rx="2" fill="#111" opacity="0.3" />

    {[
      { x: 200, y: 55, delay: 0 },
      { x: 130, y: 130, delay: 1 },
      { x: 270, y: 130, delay: 2 }
    ].map((node, i) => (
      <motion.g
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: node.delay }}
      >
        <circle cx={node.x} cy={node.y} r="24" fill="#FFF" stroke="#111" strokeWidth="2" />
        <circle cx={node.x} cy={node.y - 5} r="8" fill="#111" />
        <path d={`M${node.x - 10},${node.y + 15} Q${node.x},${node.y + 5} ${node.x + 10},${node.y + 15}`} fill="none" stroke="#111" strokeWidth="2" />

        <motion.circle
          cx={node.x + 18}
          cy={node.y - 18}
          r="6"
          fill="#9945FF"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.g>
    ))}
  </svg>
);

const VersioningSVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full">
    <rect x="130" y="20" width="140" height="160" rx="12" fill="#FFF" stroke="#E5E5E5" strokeWidth="1" />

    <rect x="140" y="30" width="120" height="14" rx="4" fill="#9945FF" opacity="0.1" />
    <rect x="148" y="35" width="50" height="4" rx="2" fill="#9945FF" opacity="0.5" />
    <rect x="230" y="35" width="22" height="4" rx="2" fill="#111" opacity="0.3" />

    {[0, 1, 2, 3].map((i) => (
      <motion.g
        key={i}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: i * 0.4 }}
      >
        <rect x="140" y={55 + i * 30} width="120" height="22" rx="4" fill="#FAFAFA" stroke="#E5E5E5" strokeWidth="0.5" />
        <rect x="148" y={61 + i * 30} width={40 + (i % 3) * 15} height="4" rx="2" fill="#111" opacity="0.3" />
        <rect x="148" y={69 + i * 30} width={25 + (i % 2) * 20} height="3" rx="1.5" fill="#999" opacity="0.3" />
        <motion.circle
          cx="252" cy={66 + i * 30} r="4"
          fill="#14F195"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
        />
      </motion.g>
    ))}
  </svg>
);

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const FeatureCard = ({ title, description, SVGComponent, className, horizontal }: { title: string, description: string, SVGComponent: React.FC, className?: string, horizontal?: boolean }) => (
  <motion.div 
    variants={cardVariants}
    className={`bg-[#FAFAFA] rounded-[2.5rem] p-8 md:p-10 flex ${horizontal ? 'flex-col md:flex-row items-center text-left' : 'flex-col items-center text-center'} border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative ${className || ''}`}
  >
    {horizontal ? (
      <>
        <div className="flex-1 pr-0 md:pr-8 mb-8 md:mb-0 relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h3>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-[280px] md:max-w-md">
            {description}
          </p>
        </div>
        <div className="w-full md:w-1/2 h-48 md:h-64 relative z-0 flex items-center justify-center">
          <SVGComponent />
        </div>
      </>
    ) : (
      <>
        <div className="w-full h-48 mb-8 relative z-0 flex items-center justify-center">
          <SVGComponent />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h3>
          <p className="text-gray-500 text-base leading-relaxed max-w-[280px]">
            {description}
          </p>
        </div>
      </>
    )}
  </motion.div>
);

export const GridFeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const features = [
    {
      title: "AI Banking Assistant",
      description: "A conversational AI that helps you manage budgets, track spending, and automate payments, right inside the chat.",
      SVGComponent: ExecutionSVG,
      className: "md:col-span-2",
      horizontal: true
    },
    {
      title: "Scheduled Payments",
      description: "Set up recurring transfers, bill splits, and salary payouts on autopilot.",
      SVGComponent: OrchestrationSVG,
      className: "md:col-span-1",
      horizontal: false
    },
    {
      title: "Zero-Knowledge Infrastructure",
      description: "Privacy-preserving transactions powered by zero-knowledge proofs. Your balances and transfers stay confidential.",
      SVGComponent: RiskSVG,
      className: "md:col-span-1",
      horizontal: false
    },
    {
      title: "Spending Dashboard",
      description: "Track balances, transaction history, and spending trends in one clear view.",
      SVGComponent: ObservabilitySVG,
      className: "md:col-span-2",
      horizontal: true
    },
    {
      title: "Group Chats & Shared Wallets",
      description: "Create group wallets for roommates, teams, or DAOs with role-based spending permissions.",
      SVGComponent: CollaborationSVG,
      className: "md:col-span-2",
      horizontal: true
    },
    {
      title: "On-Chain Receipts & History",
      description: "Immutable on-chain receipts for every payment with exportable records for tax and accounting.",
      SVGComponent: VersioningSVG,
      className: "md:col-span-1",
      horizontal: false
    }
  ];

  return (
    <section id="key-features" className="w-full max-w-[1400px] mx-auto px-4 py-12 md:py-24 relative z-20">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 md:mb-16 text-center md:text-left"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Key Features</h2>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl leading-relaxed">
          Built for speed, privacy, and everyday use. SendlyFi gives you the tools to manage your money without leaving the chat.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            title={feature.title}
            description={feature.description}
            SVGComponent={feature.SVGComponent}
            className={feature.className}
            horizontal={feature.horizontal}
          />
        ))}
      </motion.div>
    </section>
  );
};
