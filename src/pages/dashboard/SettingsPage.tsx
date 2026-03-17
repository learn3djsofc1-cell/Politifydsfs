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

const iconConfig: Record<string, { chipClass: string }> = {
  User: { chipClass: 'sf-icon-chip-purple' },
  Mail: { chipClass: 'sf-icon-chip-blue' },
  Globe: { chipClass: 'sf-icon-chip-green' },
  Key: { chipClass: 'sf-icon-chip-purple' },
  Smartphone: { chipClass: 'sf-icon-chip-red' },
  Lock: { chipClass: 'sf-icon-chip-blue' },
  Bell: { chipClass: 'sf-icon-chip-green' },
  Palette: { chipClass: 'sf-icon-chip-purple' },
  Shield: { chipClass: 'sf-icon-chip-red' },
};

const SettingRow = ({ icon: Icon, iconName, label, desc, action }: {
  icon: React.ElementType;
  iconName: string;
  label: string;
  desc: string;
  action?: React.ReactNode;
}) => {
  const config = iconConfig[iconName] || iconConfig.User;
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-all duration-200 group cursor-pointer">
      <div className={`sf-icon-chip ${config.chipClass} group-hover:scale-105`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
      </div>
      {action || <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />}
    </div>
  );
};

const Toggle = ({ enabled, label }: { enabled: boolean; label: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={label}
    className={`sf-toggle ${enabled ? 'sf-toggle-on' : 'sf-toggle-off'}`}
  >
    <div className={`sf-toggle-knob ${enabled ? 'sf-toggle-knob-on' : ''}`} />
  </button>
);

export const SettingsPage = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[800px] mx-auto"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences</p>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <div className="sf-card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 flex items-center justify-center flex-shrink-0 border border-gray-200">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-gray-800">No Name Set</div>
            <div className="text-sm text-gray-500 mt-0.5">No wallet connected</div>
          </div>
          <button className="sf-btn-secondary flex-shrink-0">
            Edit Profile
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="sf-section-title">Profile</h2>
        <div className="sf-card-flat divide-y divide-gray-100 overflow-hidden">
          <SettingRow icon={User} iconName="User" label="Display Name" desc="Set your public display name" />
          <SettingRow icon={Mail} iconName="Mail" label="Email" desc="Add an email for notifications" />
          <SettingRow icon={Globe} iconName="Globe" label="Language" desc="English" />
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="sf-section-title">Security</h2>
        <div className="sf-card-flat divide-y divide-gray-100 overflow-hidden">
          <SettingRow icon={Key} iconName="Key" label="Wallet" desc="Connect or manage your Solana wallet" />
          <SettingRow icon={Smartphone} iconName="Smartphone" label="Two-Factor Auth" desc="Not enabled" />
          <SettingRow icon={Lock} iconName="Lock" label="Biometric Login" desc="Use Face ID or fingerprint" action={<Toggle enabled={false} label="Toggle biometric login" />} />
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="sf-section-title">Preferences</h2>
        <div className="sf-card-flat divide-y divide-gray-100 overflow-hidden">
          <SettingRow icon={Bell} iconName="Bell" label="Notifications" desc="Push and email notifications" action={<Toggle enabled={true} label="Toggle notifications" />} />
          <SettingRow icon={Palette} iconName="Palette" label="Theme" desc="Light" />
          <SettingRow icon={Shield} iconName="Shield" label="Privacy" desc="Manage data and privacy settings" />
        </div>
      </motion.div>
    </motion.div>
  );
};
