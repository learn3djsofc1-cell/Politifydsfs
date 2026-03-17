import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, Plus, Shield, Zap, Globe } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const features = [
  { icon: Zap, label: 'Instant Issuance', desc: 'Get a card in seconds' },
  { icon: Shield, label: 'Secure', desc: 'Freeze or delete anytime' },
  { icon: Globe, label: 'Global', desc: 'Accepted everywhere Visa is' },
];

export const CardsPage = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] w-full mx-auto overflow-x-hidden"
    >
      <motion.div variants={item} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Cards</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your virtual debit cards</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Card
        </button>
      </motion.div>

      <motion.div variants={item} className="rounded-2xl bg-white border border-gray-200 overflow-hidden mb-8">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-6">
            <div className="w-48 h-28 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#7B2FE0] border border-[#9945FF]/20 p-4 flex flex-col justify-between transform -rotate-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-8 h-6 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-80" />
                <span className="text-[10px] text-white/60 font-mono">VISA</span>
              </div>
              <div>
                <div className="text-[10px] text-white/50 font-mono tracking-widest">•••• •••• •••• ••••</div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-[#9945FF]/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#9945FF]" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No cards yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Create your first virtual debit card to start spending crypto anywhere Visa is accepted.
          </p>
          <button className="px-6 py-3 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Card
          </button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Card Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl bg-white border border-gray-200 p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-[#9945FF]" />
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
