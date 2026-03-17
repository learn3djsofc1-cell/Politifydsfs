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

const iconColors: Record<string, { color: string; gradient: string }> = {
  User: { color: '#9945FF', gradient: 'from-[#9945FF]/15 to-[#7B2FE0]/10' },
  Mail: { color: '#00C2FF', gradient: 'from-[#00C2FF]/15 to-[#0090B8]/10' },
  Globe: { color: '#14F195', gradient: 'from-[#14F195]/15 to-[#0DAA6D]/10' },
  Key: { color: '#9945FF', gradient: 'from-[#9945FF]/15 to-[#7B2FE0]/10' },
  Smartphone: { color: '#FF6B6B', gradient: 'from-[#FF6B6B]/15 to-[#E04545]/10' },
  Lock: { color: '#00C2FF', gradient: 'from-[#00C2FF]/15 to-[#0090B8]/10' },
  Bell: { color: '#14F195', gradient: 'from-[#14F195]/15 to-[#0DAA6D]/10' },
  Palette: { color: '#9945FF', gradient: 'from-[#9945FF]/15 to-[#7B2FE0]/10' },
  Shield: { color: '#FF6B6B', gradient: 'from-[#FF6B6B]/15 to-[#E04545]/10' },
};

const SettingRow = ({ icon: Icon, iconName, label, desc, action }: {
  icon: React.ElementType;
  iconName: string;
  label: string;
  desc: string;
  action?: React.ReactNode;
}) => {
  const style = iconColors[iconName] || iconColors.User;
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0 border border-white/[0.06] group-hover:scale-105 transition-transform duration-200`}>
        <Icon className="w-5 h-5" style={{ color: style.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/80">{label}</div>
        <div className="text-xs text-white/35 mt-0.5">{desc}</div>
      </div>
      {action || <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all duration-200" />}
    </div>
  );
};

const Toggle = ({ enabled, label }: { enabled: boolean; label: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={label}
    className={`w-11 h-6 rounded-full flex items-center transition-all duration-300 cursor-pointer ${
      enabled
        ? 'bg-gradient-to-r from-[#9945FF] to-[#7B2FE0] shadow-[0_0_12px_-2px_rgba(153,69,255,0.4)]'
        : 'bg-white/10'
    }`}
  >
    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 mx-0.5 ${
      enabled ? 'translate-x-5' : ''
    }`} />
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
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account preferences</p>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 flex items-center gap-5 hover:bg-white/[0.05] transition-all duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center flex-shrink-0 border border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(153,69,255,0.2)]">
            <User className="w-8 h-8 text-white/40" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-white/80">No Name Set</div>
            <div className="text-sm text-white/35 mt-0.5">No wallet connected</div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all duration-200 flex-shrink-0">
            Edit Profile
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-1">Profile</h2>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          <SettingRow icon={User} iconName="User" label="Display Name" desc="Set your public display name" />
          <SettingRow icon={Mail} iconName="Mail" label="Email" desc="Add an email for notifications" />
          <SettingRow icon={Globe} iconName="Globe" label="Language" desc="English" />
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-1">Security</h2>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          <SettingRow icon={Key} iconName="Key" label="Wallet" desc="Connect or manage your Solana wallet" />
          <SettingRow icon={Smartphone} iconName="Smartphone" label="Two-Factor Auth" desc="Not enabled" />
          <SettingRow icon={Lock} iconName="Lock" label="Biometric Login" desc="Use Face ID or fingerprint" action={<Toggle enabled={false} label="Toggle biometric login" />} />
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-1">Preferences</h2>
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          <SettingRow icon={Bell} iconName="Bell" label="Notifications" desc="Push and email notifications" action={<Toggle enabled={true} label="Toggle notifications" />} />
          <SettingRow icon={Palette} iconName="Palette" label="Theme" desc="Dark" />
          <SettingRow icon={Shield} iconName="Shield" label="Privacy" desc="Manage data and privacy settings" />
        </div>
      </motion.div>
    </motion.div>
  );
};
