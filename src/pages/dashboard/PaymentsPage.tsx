import React from 'react';
import { motion } from 'motion/react';
import { CalendarClock, Plus, Clock, RefreshCw, Bell } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const features = [
  { icon: Clock, label: 'Flexible Scheduling', desc: 'Daily, weekly, monthly, or custom', color: '#9945FF', gradient: 'from-[#9945FF]/15 to-[#7B2FE0]/10' },
  { icon: RefreshCw, label: 'Auto-retry', desc: 'Smart retry on failures', color: '#14F195', gradient: 'from-[#14F195]/15 to-[#0DAA6D]/10' },
  { icon: Bell, label: 'Notifications', desc: 'Alerts for every payment', color: '#00C2FF', gradient: 'from-[#00C2FF]/15 to-[#0090B8]/10' },
];

export const PaymentsPage = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] mx-auto"
    >
      <motion.div variants={item} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">Payments</h1>
          <p className="text-white/40 text-sm mt-1">Scheduled and recurring payments</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white text-sm font-semibold hover:shadow-[0_0_25px_-4px_rgba(153,69,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <Plus className="w-4 h-4" />
          Set Up Payment
        </button>
      </motion.div>

      <motion.div variants={item} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden mb-8">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 border border-white/[0.06] flex items-center justify-center mb-5 shadow-[0_8px_40px_-12px_rgba(153,69,255,0.15)]">
            <CalendarClock className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-semibold text-white/80 mb-2">No scheduled payments</h3>
          <p className="text-white/35 text-sm max-w-sm mb-6">
            Set up recurring transfers, automatic bill splits, or payroll distributions to automate your finances.
          </p>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] text-white text-sm font-semibold hover:shadow-[0_0_25px_-4px_rgba(153,69,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center gap-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <Plus className="w-4 h-4" />
            Set Up Your First Payment
          </button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Payment Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 flex items-start gap-4 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center flex-shrink-0 border border-white/[0.06] group-hover:scale-105 transition-transform duration-200`}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <div>
                <h3 className="font-medium text-white/80 text-sm">{f.label}</h3>
                <p className="text-white/35 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
