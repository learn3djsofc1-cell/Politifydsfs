import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, MessageSquare, CreditCard, CalendarClock,
  Settings, Menu, X, LogOut
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/chat', icon: MessageSquare, label: 'Chat', end: false },
  { to: '/dashboard/cards', icon: CreditCard, label: 'Cards', end: false },
  { to: '/dashboard/payments', icon: CalendarClock, label: 'Payments', end: false },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings', end: false },
];

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const SidebarNav = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onItemClick}
          className={({ isActive }) =>
            `sf-sidebar-item ${isActive ? 'sf-sidebar-item-active' : ''}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <div className="sf-sidebar-indicator" />}
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#14F195]' : ''}`} />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      <aside className="hidden lg:flex flex-col w-[260px] sf-sidebar fixed h-full z-30">
        <Link to="/" className="px-6 py-5 flex items-center gap-3 border-b border-white/[0.08] hover:bg-white/[0.04] transition-colors">
          <Logo className="w-7 h-7" />
          <span className="font-bold text-lg tracking-tight text-white">SendlyFi</span>
        </Link>
        <SidebarNav />
        <div className="px-3 pb-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="w-6 h-6" />
            <span className="font-bold text-base tracking-tight text-gray-900">SendlyFi</span>
          </Link>
          <button
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 w-[260px] h-full sf-sidebar lg:hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.08]">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
                  <Logo className="w-7 h-7" />
                  <span className="font-bold text-lg tracking-tight text-white">SendlyFi</span>
                </Link>
                <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="p-1 text-white/30 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <SidebarNav onItemClick={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-[260px] pb-20 lg:pb-0">
        <div className="hidden lg:flex items-center justify-between px-8 h-16 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="text-sm text-gray-400">
            <span className="text-gray-300">SendlyFi</span>
            <span className="mx-2 text-gray-200">/</span>
            <span className="text-gray-600 font-medium capitalize">
              {location.pathname === '/dashboard' ? 'Overview' : location.pathname.split('/').pop()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center border border-gray-200">
              <span className="text-xs font-bold text-gray-600">
                {user?.zkid ? user.zkid.slice(0, 2) : 'SF'}
              </span>
            </div>
          </div>
        </div>
        <div className="pt-14 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive ? 'text-[#9945FF]' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#9945FF]" />
                    )}
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
