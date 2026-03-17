import React from 'react';
import { motion } from 'motion/react';
import {
  User, Shield, Bell, Palette, Globe, Key,
  ChevronRight, Smartphone, Mail, Lock
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const SettingRow = ({ icon: Icon, label, desc, action }: {
  icon: React.ElementType;
  label: string;
  desc: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-800">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
    </div>
    {action || <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
  </div>
);

const Toggle = ({ enabled }: { enabled: boolean }) => (
  <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${enabled ? 'bg-[#9945FF]' : 'bg-gray-200'}`}>
    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${enabled ? 'translate-x-4' : ''}`} />
  </div>
);

export const SettingsPage = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[800px] w-full mx-auto overflow-x-hidden"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your account preferences</p>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <div className="rounded-2xl bg-white border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-gray-800">No Name Set</div>
            <div className="text-sm text-gray-500 mt-0.5">No wallet connected</div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors flex-shrink-0">
            Edit Profile
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Profile</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <SettingRow icon={User} label="Display Name" desc="Set your public display name" />
          <SettingRow icon={Mail} label="Email" desc="Add an email for notifications" />
          <SettingRow icon={Globe} label="Language" desc="English" />
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Security</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <SettingRow icon={Key} label="Wallet" desc="Connect or manage your Solana wallet" />
          <SettingRow icon={Smartphone} label="Two-Factor Auth" desc="Not enabled" />
          <SettingRow icon={Lock} label="Biometric Login" desc="Use Face ID or fingerprint" action={<Toggle enabled={false} />} />
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Preferences</h2>
        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          <SettingRow icon={Bell} label="Notifications" desc="Push and email notifications" action={<Toggle enabled={true} />} />
          <SettingRow icon={Palette} label="Theme" desc="Light" />
          <SettingRow icon={Shield} label="Privacy" desc="Manage data and privacy settings" />
        </div>
      </motion.div>
    </motion.div>
  );
};
