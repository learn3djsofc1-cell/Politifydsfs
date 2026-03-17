import React, { useState } from 'react';
import { Rocket, Menu, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleHashLink = (hash: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="w-full max-w-[1400px] mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">SendlyFi</span>
        </Link>

        <div className="hidden md:flex items-center bg-white/40 backdrop-blur-md border border-white/60 rounded-full px-2 py-1.5 shadow-sm">
          <button
            onClick={() => handleHashLink('#features')}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors rounded-full hover:bg-white/50"
          >
            Features
          </button>
          <button
            onClick={() => handleHashLink('#community')}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors rounded-full hover:bg-white/50"
          >
            Community
          </button>
          <Link
            to="/docs"
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors rounded-full hover:bg-white/50"
          >
            Docs
          </Link>
          <a
            href="https://x.com/SendlyFi"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors rounded-full hover:bg-white/50"
          >
            X
          </a>
        </div>

        <div className="hidden md:block">
          <Link to="/dashboard" className="bg-[#111] hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-transform hover:scale-105">
            Launch App
            <Rocket className="w-4 h-4" />
          </Link>
        </div>

        <button 
          className="md:hidden p-2 text-gray-600 hover:text-black"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col"
          >
            <div className="flex flex-col gap-6 mb-8">
              <button
                onClick={() => handleHashLink('#features')}
                className="text-2xl font-semibold text-gray-800 hover:text-[#9945FF] transition-colors text-left"
              >
                Features
              </button>
              <button
                onClick={() => handleHashLink('#community')}
                className="text-2xl font-semibold text-gray-800 hover:text-[#9945FF] transition-colors text-left"
              >
                Community
              </button>
              <Link
                to="/docs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-semibold text-gray-800 hover:text-[#9945FF] transition-colors"
              >
                Docs
              </Link>
              <a
                href="https://x.com/SendlyFi"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-semibold text-gray-800 hover:text-[#9945FF] transition-colors"
              >
                X
              </a>
            </div>

            <div className="flex flex-col gap-4 mt-auto mb-12">
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-[#111] text-white px-6 py-4 rounded-xl text-lg font-medium flex items-center justify-center gap-2"
              >
                Launch App
                <Rocket className="w-5 h-5" />
              </Link>
              <Link
                to="/docs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-white border border-gray-200 text-gray-900 px-6 py-4 rounded-xl text-lg font-medium flex items-center justify-center gap-2"
              >
                Documentation
                <BookOpen className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
