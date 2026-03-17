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
  { icon: Clock, label: 'Flexible Scheduling', desc: 'Daily, weekly, monthly, or custom' },
  { icon: RefreshCw, label: 'Auto-retry', desc: 'Smart retry on failures' },
  { icon: Bell, label: 'Notifications', desc: 'Alerts for every payment' },
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
          <p className="text-gray-600 text-sm mt-1">Scheduled and recurring payments</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Set Up Payment
        </button>
      </motion.div>

      <motion.div variants={item} className="rounded-2xl bg-white border border-gray-200 overflow-hidden mb-8">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <CalendarClock className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No scheduled payments</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Set up recurring transfers, automatic bill splits, or payroll distributions to automate your finances.
          </p>
          <button className="px-6 py-3 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Set Up Your First Payment
          </button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Payment Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl bg-white border border-gray-200 p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-[#14F195]/10 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-[#0DAA6D]" />
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
