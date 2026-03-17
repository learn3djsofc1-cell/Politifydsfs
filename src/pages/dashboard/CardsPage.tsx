import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, Plus, Shield, Zap, Globe, Wifi } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const features = [
  { icon: Zap, label: 'Instant Issuance', desc: 'Get a card in seconds', chipClass: 'sf-icon-chip-purple' },
  { icon: Shield, label: 'Secure', desc: 'Freeze or delete anytime', chipClass: 'sf-icon-chip-green' },
  { icon: Globe, label: 'Global', desc: 'Accepted everywhere Visa is', chipClass: 'sf-icon-chip-blue' },
];

export const CardsPage = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] mx-auto"
    >
      <motion.div variants={item} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Cards</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your virtual debit cards</p>
        </div>
        <button className="sf-btn-primary">
          <Plus className="w-4 h-4" />
          Create Card
        </button>
      </motion.div>

      <motion.div variants={item} className="sf-card overflow-hidden mb-8">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-8">
            <div className="rounded-2xl p-5 flex flex-col justify-between transform -rotate-3 shadow-[0_20px_50px_-12px_rgba(153,69,255,0.3)] border border-white/10 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #9945FF 0%, #7B2FE0 50%, #5A1DB5 100%)', width: '224px', height: '136px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-[0_2px_8px_rgba(234,179,8,0.3)] flex items-center justify-center">
                  <div className="w-6 h-4 border border-yellow-600/30 rounded-sm" />
                </div>
                <Wifi className="w-5 h-5 text-white/40 rotate-90" />
              </div>
              <div className="relative z-10">
                <div className="text-[10px] text-white/40 font-mono tracking-[0.25em] mb-1">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;</div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/30 font-mono">SENDLYFI</span>
                  <span className="text-[10px] text-white/50 font-bold tracking-wider">VISA</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-xl sf-icon-chip-purple flex items-center justify-center border border-gray-200 shadow-md bg-white">
              <CreditCard className="w-5 h-5 text-[#9945FF]" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No cards yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Create your first virtual debit card to start spending crypto anywhere Visa is accepted.
          </p>
          <button className="sf-btn-primary">
            <Plus className="w-4 h-4" />
            Create Your First Card
          </button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="sf-section-title">Card Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="sf-card p-5 flex items-start gap-4 group"
            >
              <div className={`sf-icon-chip ${f.chipClass} group-hover:scale-105`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">{f.label}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
