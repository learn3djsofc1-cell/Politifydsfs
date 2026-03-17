import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, MessageSquare, CreditCard, CalendarClock,
  Settings, Menu, X
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
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 flex">
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white fixed h-full z-30">
        <Link to="/" className="px-6 py-6 flex items-center gap-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
          <Logo className="w-7 h-7" />
          <span className="font-bold text-lg tracking-tight">SendlyFi</span>
        </Link>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#9945FF]/10 text-[#9945FF]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="w-6 h-6" />
            <span className="font-bold text-base tracking-tight">SendlyFi</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-900"
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
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 lg:hidden"
            >
              <div className="px-6 py-6 flex items-center justify-between border-b border-gray-200">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
                  <Logo className="w-7 h-7" />
                  <span className="font-bold text-lg tracking-tight">SendlyFi</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-900">
                  <X size={18} />
                </button>
              </div>
              <nav className="px-3 py-4 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#9945FF]/10 text-[#9945FF]'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="hidden lg:flex items-center justify-between px-8 h-16 border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="text-sm text-gray-500">
            <span className="text-gray-500">SendlyFi</span>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-700 font-medium capitalize">
              {location.pathname === '/dashboard' ? 'Overview' : location.pathname.split('/').pop()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">@{user?.username || 'user'}</span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF]/15 to-[#14F195]/15 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">{user?.username ? user.username.slice(0, 2).toUpperCase() : 'SF'}</span>
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-[#9945FF]'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
