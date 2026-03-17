import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HeroGrid } from './components/HeroGrid';
import { HeroContent } from './components/HeroContent';
import { FeaturesSection } from './components/FeaturesSection';
import { GridFeaturesSection } from './components/GridFeaturesSection';
import { InteractiveCardsSection } from './components/InteractiveCardsSection';
import { CommunitySection } from './components/CommunitySection';
import { CTASection } from './components/CTASection';
import { FooterSection } from './components/FooterSection';
import { DocsPage } from './pages/DocsPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { ChatPage } from './pages/dashboard/ChatPage';
import { CardsPage } from './pages/dashboard/CardsPage';
import { NetworkPage } from './pages/dashboard/PaymentsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { WalletsPage } from './pages/dashboard/WalletsPage';
import { CreateWalletPage } from './pages/dashboard/CreateWalletPage';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#9945FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function WalletGate({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#9945FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.wallets.length === 0) {
    return <Navigate to="/dashboard/create-wallet" replace />;
  }

  return <>{children}</>;
}

function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-gray-900 bg-[#F4F5F7]">
      <HeroGrid />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pb-10">
          <HeroContent />
        </main>
        <FeaturesSection />
        <GridFeaturesSection />
        <InteractiveCardsSection />
        <CommunitySection />
        <CTASection />
        <FooterSection />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard/create-wallet"
        element={
          <ProtectedRoute>
            <CreateWalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <WalletGate>
              <DashboardLayout />
            </WalletGate>
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="wallets" element={<WalletsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="cards" element={<CardsPage />} />
        <Route path="network" element={<NetworkPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
