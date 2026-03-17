import React from 'react';
import { motion } from 'motion/react';

const QuantSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <circle cx="70" cy="90" r="20" fill="#FFF" opacity="0.15" />
    <circle cx="70" cy="85" r="7" fill="#FFF" opacity="0.6" />
    <path d="M58,105 Q70,95 82,105" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.6" />

    <motion.g
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: [0, 1, 1, 0], x: [-5, 10, 50, 70] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="85" y="75" width="40" height="18" rx="9" fill="#9945FF" opacity="0.8" />
      <rect x="92" y="82" width="26" height="4" rx="2" fill="#FFF" opacity="0.6" />
    </motion.g>

    <circle cx="140" cy="110" r="20" fill="#FFF" opacity="0.15" />
    <circle cx="140" cy="105" r="7" fill="#9945FF" opacity="0.6" />
    <path d="M128,125 Q140,115 152,125" fill="none" stroke="#9945FF" strokeWidth="2" opacity="0.6" />
  </svg>
);

const PropSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <motion.circle
      cx="100" cy="90" r="35"
      fill="none" stroke="#FFF" strokeWidth="2" opacity="0.3"
      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <circle cx="100" cy="90" r="25" fill="#FFF" opacity="0.1" />
    <text x="100" y="96" fill="#FFF" fontSize="18" fontWeight="bold" textAnchor="middle" opacity="0.8">$</text>

    {[
      { x: 55, y: 140, label: "NGN" },
      { x: 100, y: 150, label: "EUR" },
      { x: 145, y: 140, label: "GBP" }
    ].map((c, i) => (
      <motion.g key={i}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
      >
        <circle cx={c.x} cy={c.y} r="14" fill="#9945FF" opacity="0.3" />
        <text x={c.x} y={c.y + 4} fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.8">{c.label}</text>
      </motion.g>
    ))}
  </svg>
);

const DaoSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <g transform="translate(100, 100)">
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 45;
        const y = Math.sin(rad) * 45;
        return (
          <motion.g key={i}>
            <line x1="0" y1="0" x2={x} y2={y} stroke="#9945FF" strokeWidth="1.5" opacity="0.4" />
            <circle cx={x} cy={y} r="10" fill="#FFF" opacity="0.15" />
            <circle cx={x} cy={y - 3} r="4" fill="#FFF" opacity="0.6" />
            <path d={`M${x - 5},${y + 7} Q${x},${y + 2} ${x + 5},${y + 7}`} fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.6" />
            <motion.circle
              cx={x} cy={y} r="12"
              fill="none" stroke="#9945FF" strokeWidth="1"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          </motion.g>
        );
      })}
      <circle r="12" fill="#9945FF" opacity="0.8" />
      <path d="M-4,-1 L0,3 L4,-3" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

const TraderSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <circle cx="100" cy="70" r="18" fill="#9945FF" opacity="0.3" />
    <text x="100" y="76" fill="#FFF" fontSize="14" fontWeight="bold" textAnchor="middle" opacity="0.8">$</text>

    {[
      { x: 60, y: 145 },
      { x: 100, y: 150 },
      { x: 140, y: 145 }
    ].map((p, i) => (
      <motion.g key={i}>
        <motion.line
          x1="100" y1="88" x2={p.x} y2={p.y - 15}
          stroke="#9945FF" strokeWidth="1.5" opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
        />
        <circle cx={p.x} cy={p.y} r="12" fill="#FFF" opacity="0.15" />
        <circle cx={p.x} cy={p.y - 3} r="5" fill="#FFF" opacity="0.5" />
        <path d={`M${p.x - 6},${p.y + 8} Q${p.x},${p.y + 3} ${p.x + 6},${p.y + 8}`} fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.5" />
      </motion.g>
    ))}
  </svg>
);

const SecuritySVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <motion.path
      d="M100,45 L145,67 V112 C145,145 100,168 100,168 C100,168 55,145 55,112 V67 Z"
      fill="none"
      stroke="#FFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ stroke: ["#FFF", "#9945FF", "#FFF"] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <rect x="85" y="88" width="30" height="25" rx="3" fill="none" stroke="#9945FF" strokeWidth="2" />
    <path d="M92,88 V82 a8,8 0 0 1 16,0 v6" fill="none" stroke="#9945FF" strokeWidth="2" strokeLinecap="round" />
    <motion.circle
      cx="100" cy="100" r="3" fill="#9945FF"
      animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
);

const InstitutionSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <rect x="60" y="140" width="80" height="10" fill="#FFF" opacity="0.5" />
    <rect x="70" y="130" width="60" height="10" fill="#FFF" opacity="0.5" />
    <path d="M60,80 L100,50 L140,80" fill="none" stroke="#9945FF" strokeWidth="3" />
    {[70, 90, 110, 130].map((x, i) => (
      <motion.rect
        key={i}
        x={x} y="80" width="6" height="50" fill="#FFF" opacity="0.8"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: i * 0.2 }}
      />
    ))}
    <motion.g
      animate={{ opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <path d="M125,58 L145,68 V88 C145,98 135,108 125,108 C115,108 105,98 105,88 V68 Z" fill="none" stroke="#9945FF" strokeWidth="1.5" opacity="0.6" />
      <circle cx="125" cy="82" r="4" fill="#9945FF" opacity="0.6" />
    </motion.g>
  </svg>
);

const cards = [
  {
    title: "Everyday Users",
    description: "Send money to friends as easily as sending a text message.",
    icon: QuantSVG,
  },
  {
    title: "Everyday Users, Global",
    description: "Off-ramp crypto to local currency in 100+ countries instantly.",
    icon: PropSVG,
  },
  {
    title: "Web3 Teams & DAOs",
    description: "Manage group funds with shared wallets and approval flows.",
    icon: DaoSVG,
  },
  {
    title: "Web3 Teams, Payroll",
    description: "Pay global contributors in stablecoins with zero wire fees.",
    icon: TraderSVG,
  },
  {
    title: "Privacy-Critical Users",
    description: "Encrypted messaging and zero-knowledge transfers by default.",
    icon: SecuritySVG,
  },
  {
    title: "Privacy-Critical, Business",
    description: "Accept crypto payments with confidential settlement for sensitive operations.",
    icon: InstitutionSVG,
  }
];

export const CommunitySection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section id="community" className="w-full py-24 relative overflow-hidden bg-[#050505]">
      {/* Dynamic Solana Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(153, 69, 255, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 70%, rgba(20, 241, 149, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 30%, rgba(0, 194, 255, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 30%, rgba(153, 69, 255, 0.15) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0"
        />
        
        {/* Floating Orbs */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#9945FF] rounded-full blur-[120px] opacity-20 mix-blend-screen"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#14F195] rounded-full blur-[140px] opacity-10 mix-blend-screen"
        />
         <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00C2FF] rounded-full blur-[100px] opacity-15 mix-blend-screen"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] max-w-2xl tracking-tight">
            Built For Everyone
          </h2>
          <div className="pl-6 border-l-2 border-[#9945FF] max-w-md">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              SendlyFi works for anyone who moves money, from splitting dinner to running payroll across borders.
            </p>
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className="group relative h-[280px] rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-[#9945FF]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-[#C4A6FC] transition-colors">{card.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
