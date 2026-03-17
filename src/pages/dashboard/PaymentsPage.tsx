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
  { icon: Clock, label: 'Flexible Scheduling', desc: 'Daily, weekly, monthly, or custom', chipClass: 'sf-icon-chip-purple' },
  { icon: RefreshCw, label: 'Auto-retry', desc: 'Smart retry on failures', chipClass: 'sf-icon-chip-green' },
  { icon: Bell, label: 'Notifications', desc: 'Alerts for every payment', chipClass: 'sf-icon-chip-blue' },
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
          <p className="text-gray-500 text-sm mt-1">Scheduled and recurring payments</p>
        </div>
        <button className="sf-btn-primary">
          <Plus className="w-4 h-4" />
          Set Up Payment
        </button>
      </motion.div>

      <motion.div variants={item} className="sf-card overflow-hidden mb-8">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
            <CalendarClock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No scheduled payments</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Set up recurring transfers, automatic bill splits, or payroll distributions to automate your finances.
          </p>
          <button className="sf-btn-primary">
            <Plus className="w-4 h-4" />
            Set Up Your First Payment
          </button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h2 className="sf-section-title">Payment Features</h2>
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
