import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';
import {
  BookOpen, MessageSquare, Shield, CreditCard,
  Bot, Clock, BarChart3, ChevronRight,
  Rocket, Menu, X, Play, Code, Layers
} from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Overview', icon: BookOpen },
  { id: 'getting-started', title: 'Getting Started', icon: Play },
  { id: 'chat-wallet', title: 'Chat Wallet', icon: MessageSquare },
  { id: 'virtual-cards', title: 'Virtual Cards', icon: CreditCard },
  { id: 'privacy', title: 'Privacy & Security', icon: Shield },
  { id: 'ai-assistant', title: 'AI Payment Parser', icon: Bot },
  { id: 'scheduled-payments', title: 'Scheduled Payments', icon: Clock, comingSoon: true },
  { id: 'dashboard', title: 'Dashboard', icon: BarChart3 },
  { id: 'architecture', title: 'Architecture', icon: Layers },
];

export const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top <= offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <Logo className="w-7 h-7" />
              <span className="font-bold text-lg tracking-tight">SendlyFi</span>
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-sm font-medium text-gray-500">Documentation</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-black"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex relative">
        <aside className={`
          fixed lg:sticky top-16 left-0 z-40 w-72 h-[calc(100vh-4rem)] overflow-y-auto
          bg-white lg:bg-transparent border-r border-gray-200 lg:border-0 p-6
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="flex flex-col gap-1">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#9945FF]/10 text-[#9945FF]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {s.title}
                  {'comingSoon' in s && s.comingSoon && (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Soon</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 px-6 lg:px-16 py-12 lg:py-16">
          <section id="overview" className="mb-20 scroll-mt-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9945FF]/10 text-[#9945FF] text-xs font-semibold mb-6 uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              Documentation
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              SendlyFi Documentation
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-8">
              SendlyFi is a chat-first crypto wallet and payment platform built on Solana. Users send and receive SOL and USDC through natural language chat messages, manage virtual debit cards, and track their balances, all from a single conversational interface.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-10">
              This documentation covers every implemented feature of the platform, the security model, the AI-powered payment parser, and the underlying technical architecture.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Chat Wallet', desc: 'Send payments via natural language', id: 'chat-wallet', color: 'bg-[#9945FF]' },
                { title: 'Virtual Cards', desc: 'Visa & Mastercard, mainnet only', id: 'virtual-cards', color: 'bg-[#00C2FF]' },
                { title: 'AI Payment Parser', desc: 'Gemini-powered intent detection', id: 'ai-assistant', color: 'bg-[#14F195]' },
              ].map((card) => (
                <button
                  key={card.id}
                  onClick={() => scrollTo(card.id)}
                  className="group text-left p-5 rounded-2xl border border-gray-200 hover:border-[#9945FF]/30 hover:shadow-lg transition-all bg-white"
                >
                  <div className={`w-2 h-2 rounded-full ${card.color} mb-3`} />
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#9945FF] transition-colors">{card.title}</h3>
                  <p className="text-sm text-gray-500">{card.desc}</p>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#9945FF] mt-3 transition-colors" />
                </button>
              ))}
            </div>
          </section>

          <section id="getting-started" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Play} title="Getting Started" subtitle="Create an account and start sending payments in minutes." />
            <DocSubheading>1. Create Your Account</DocSubheading>
            <DocParagraph>
              Visit the SendlyFi web application and click "Launch App." On the sign-up screen, choose a username and set a password. SendlyFi will generate a unique 8-character ZKID for you. This ZKID is your login identifier, so save it securely. No email address or phone number is required.
            </DocParagraph>
            <DocSubheading>2. Create a Wallet</DocSubheading>
            <DocParagraph>
              After signing up, you will be prompted to create a Solana wallet. SendlyFi generates a new keypair for you, with the private key encrypted using your password via PBKDF2 + AES-256-GCM before being stored. Your public key is your wallet address. You can also import this wallet into Phantom or other Solana wallets using the private key shown during creation.
            </DocParagraph>
            <DocSubheading>3. Fund Your Wallet</DocSubheading>
            <DocParagraph>
              On devnet, you start with 10 SOL and 1,000 USDC in simulated balances for testing. On mainnet, deposit SOL or USDC to your wallet address from any external wallet or exchange. Your balances update automatically via Solana RPC queries.
            </DocParagraph>
            <DocSubheading>4. Start Chatting & Paying</DocSubheading>
            <DocParagraph>
              Open the Chat tab, search for another user by username, and start a conversation. Type natural language messages like "send 50 USDC" or "pay 2 SOL" and the AI parser will detect your intent and prompt you to confirm the payment.
            </DocParagraph>
            <DocSubheading>Prerequisites</DocSubheading>
            <DocList items={[
              'A modern web browser (Chrome, Firefox, Safari, or Edge)',
              'SOL for transaction fees on mainnet (typically under $0.001 per transaction)',
              'No email, phone number, or KYC required for basic usage',
            ]} />
          </section>

          <section id="chat-wallet" className="mb-20 scroll-mt-24">
            <SectionHeader icon={MessageSquare} title="Chat Wallet" subtitle="Peer-to-peer payments through natural language chat messages." />
            <DocParagraph>
              The Chat Wallet is the core interface of SendlyFi. Users search for other SendlyFi users by username, open a conversation, and send messages or payments within a single thread. Conversations are real-time with 4-second polling for new messages.
            </DocParagraph>
            <DocParagraph>
              Payments are initiated by typing natural language commands such as "send 50 USDC" or "pay @alice 2 SOL." The AI payment parser (powered by Gemini 2.5 Flash) detects the intent and presents a confirmation card with transaction details. After the user confirms with their password, the transfer is executed.
            </DocParagraph>
            <DocSubheading>How Payments Work</DocSubheading>
            <DocList items={[
              'Devnet: Transfers are simulated using database balance updates (instant, no on-chain transaction)',
              'Mainnet: Transfers are executed on-chain via @solana/web3.js with real SOL or USDC SPL token transfers',
              'Payment messages appear as styled cards in the chat thread with amount, token, and status',
              'Mainnet transactions include a link to Solana Explorer for verification',
            ]} />
            <DocSubheading>Supported Tokens</DocSubheading>
            <DocList items={[
              'SOL (native Solana token)',
              'USDC (SPL token, Devnet: Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr, Mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)',
            ]} />
            <DocSubheading>Network Modes</DocSubheading>
            <DocParagraph>
              Users can toggle between devnet and mainnet from the dashboard sidebar. Devnet is for testing with simulated balances. Mainnet uses real Solana tokens and on-chain transactions. The active network is displayed as a badge throughout the dashboard.
            </DocParagraph>
          </section>

          <section id="virtual-cards" className="mb-20 scroll-mt-24">
            <SectionHeader icon={CreditCard} title="Virtual Cards" subtitle="Visa and Mastercard virtual debit cards, available on mainnet." />
            <DocParagraph>
              SendlyFi allows mainnet users to generate virtual debit cards (Visa and Mastercard) directly from the dashboard. Cards feature animated SVG designs with realistic branding and styling. Card details (number, CVV, expiry) are encrypted with AES-256-GCM and only revealed on demand.
            </DocParagraph>
            <DocSubheading>Card Features</DocSubheading>
            <DocList items={[
              'Visa cards with blue gradient design (#1A1F71/#00579F)',
              'Mastercard cards with dark base (#1A1A2E) and red/orange overlapping circles',
              'Luhn-valid 16-digit card numbers generated at creation',
              'AES-256-GCM encrypted storage for card number, CVV, and expiry date',
              'Cardholder name customization during creation',
              'Freeze and unfreeze cards instantly',
              '7-day soft delete with permanent removal after the grace period',
              'Real-time mainnet wallet balance display (SOL + USDC) on the cards page',
            ]} />
            <DocSubheading>Mainnet Only</DocSubheading>
            <DocParagraph>
              Virtual card creation is restricted to mainnet mode. Users on devnet will see a prompt to switch to mainnet before they can create cards. This ensures cards are only associated with real wallet balances.
            </DocParagraph>
          </section>

          <section id="privacy" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Shield} title="Privacy & Security" subtitle="How SendlyFi protects your account and wallet data." />
            <DocParagraph>
              SendlyFi is designed with security at every layer. User passwords are hashed with bcrypt before storage. Session tokens are signed with JWT and validated on every API request. Wallet private keys and card details are encrypted with AES-256-GCM using a server-side secret key.
            </DocParagraph>
            <DocSubheading>Authentication</DocSubheading>
            <DocList items={[
              'ZKID-based login: Each user receives a unique 8-character alphanumeric identifier at signup',
              'Passwords are hashed with bcrypt (salt rounds) and never stored in plaintext',
              'JWT bearer tokens are used for API session authentication',
              'Token validation occurs on every protected API endpoint via middleware',
            ]} />
            <DocSubheading>Encryption</DocSubheading>
            <DocList items={[
              'Wallet private keys are encrypted with AES-256-GCM using a password-derived key (PBKDF2 with 100,000 iterations and SHA-256), meaning only the user\'s password can decrypt their private key',
              'Virtual card details (number, CVV, expiry) are encrypted with AES-256-GCM using a server-side encryption key (CARD_ENCRYPTION_KEY or JWT_SECRET fallback)',
              'All API communication uses HTTPS',
            ]} />
            <DocSubheading>Data Handling</DocSubheading>
            <DocParagraph>
              SendlyFi does not collect email addresses, phone numbers, or any personal identification documents for basic usage. User accounts are identified solely by their ZKID and chosen username. The platform does not use third-party analytics or tracking.
            </DocParagraph>
          </section>

          <section id="ai-assistant" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Bot} title="AI Payment Parser" subtitle="Gemini-powered natural language payment intent detection." />
            <DocParagraph>
              SendlyFi uses Google's Gemini 2.5 Flash model to parse natural language messages and detect payment intents. When a user types something like "send 100 USDC to @bob" in a chat, the AI parser extracts the action, amount, and token, then presents a confirmation card before executing the transfer.
            </DocParagraph>
            <DocSubheading>How It Works</DocSubheading>
            <DocList items={[
              'Each outgoing message is sent to the /api/chat/parse-intent endpoint',
              'The endpoint calls Gemini 2.5 Flash with a structured prompt to classify the message',
              'If a payment intent is detected, the response includes type: "payment", amount, and token (SOL or USDC)',
              'If no payment intent is found, the response is type: "text" and the message is sent as a regular chat message',
              'The parser supports "send all" and "send balance" keywords to transfer the full balance',
              'Recipient extraction via @username mentions is supported',
              'Parsing is English-only',
            ]} />
            <DocSubheading>Fallback Behavior</DocSubheading>
            <DocParagraph>
              If the AI parser encounters an error or is temporarily unavailable, the message is sent as plain text with an informational notice. The chat system never blocks message delivery due to a parsing failure.
            </DocParagraph>
          </section>

          <section id="scheduled-payments" className="mb-20 scroll-mt-24">
            <div className="flex items-center gap-3 mb-3">
              <SectionHeader icon={Clock} title="Scheduled Payments" subtitle="Automate recurring transfers and payouts." />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold mb-6 uppercase tracking-widest">
              Coming Soon
            </div>
            <DocParagraph>
              Scheduled Payments will allow users to set up recurring transfers that execute automatically at defined intervals. The payments page is currently available in the dashboard with a placeholder interface. Full scheduling functionality, including interval configuration, multi-recipient payouts, and automatic retry, is planned for a future release.
            </DocParagraph>
          </section>

          <section id="dashboard" className="mb-20 scroll-mt-24">
            <SectionHeader icon={BarChart3} title="Dashboard" subtitle="Wallet overview, balances, and account management." />
            <DocParagraph>
              The SendlyFi dashboard provides a complete view of your wallet and account. On desktop, it features a fixed sidebar with all navigation items and a network selector at the bottom. On mobile, it uses a top bar with a hamburger menu (slide-out drawer) and a fixed bottom tab bar showing the four most-used pages (Overview, Chat, Cards, Settings).
            </DocParagraph>
            <DocSubheading>Dashboard Pages</DocSubheading>
            <DocList items={[
              'Overview: Live wallet balance (SOL and USDC) fetched from Solana RPC, USD conversion via CoinGecko prices, public key display, network badge, quick action buttons, auto-refresh every 30 seconds',
              'Wallets: Full wallet address, per-token balances with USD conversion, copy address, link to Solana Explorer, network badge (Devnet or Mainnet)',
              'Chat: User search, conversation list with last message preview, real-time messaging with 4-second polling, AI-powered payment initiation',
              'Cards: Virtual card management with animated SVG Visa and Mastercard cards, card detail reveal, freeze/unfreeze, delete (mainnet only)',
              'Network: Dedicated page for switching between Devnet and Mainnet',
              'Settings: Profile information, security settings, and preferences',
            ]} />
            <DocSubheading>Network Selector</DocSubheading>
            <DocParagraph>
              The network can be switched from the dedicated Network page or via the network selector in the sidebar (desktop) and top bar (mobile). Devnet uses simulated balances stored in the database. Mainnet queries live balances from the Solana blockchain via Helius RPC. The current network mode is persisted per user and displayed as a badge throughout the interface.
            </DocParagraph>
          </section>

          <section id="architecture" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Layers} title="Architecture" subtitle="Technical overview of the SendlyFi platform." />
            <DocParagraph>
              SendlyFi is built on the Solana blockchain, chosen for its high throughput, sub-second finality, and minimal transaction fees (typically under $0.001 per transaction). The platform is a full-stack web application with a React frontend and Express API backend, connected to PostgreSQL for persistent storage and Solana RPC for blockchain operations.
            </DocParagraph>
            <DocSubheading>Frontend</DocSubheading>
            <DocParagraph>
              The client is a React 19 + TypeScript single-page application built with Vite 6. It uses Tailwind CSS v4 for styling, React Router for client-side navigation, Framer Motion for animations, and React Three Fiber with Three.js for 3D graphics on the landing page. The frontend runs on port 5000 and proxies API requests to the backend.
            </DocParagraph>
            <DocSubheading>Backend</DocSubheading>
            <DocParagraph>
              The API server is an Express 4 application running on port 3001 with TypeScript (via tsx). It handles authentication (bcrypt + JWT), wallet management (keypair generation via @solana/web3.js, AES-256-GCM encryption), chat and messaging, AI intent parsing (Google Gemini via @google/genai), and Solana transactions (on-chain transfers for mainnet, database transfers for devnet).
            </DocParagraph>
            <DocSubheading>Database</DocSubheading>
            <DocParagraph>
              PostgreSQL stores user accounts, encrypted wallet keys, conversations, messages, transactions, virtual card data, and devnet simulated balances. The schema includes tables for users, wallets, conversations, messages, transactions, testnet_balances, and virtual_cards.
            </DocParagraph>
            <DocSubheading>External Services</DocSubheading>
            <DocList items={[
              'Solana RPC (Helius): Blockchain queries for mainnet balances and transaction submission',
              'Solana Devnet RPC: Development and testing environment',
              'Google Gemini 2.5 Flash: Natural language payment intent parsing via Replit AI Integrations',
              'CoinGecko API: Real-time SOL and USDC price data with 30-second cache',
            ]} />

            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-[#9945FF]/5 to-[#14F195]/5 border border-[#9945FF]/10">
              <h4 className="font-semibold text-gray-900 mb-3">Technology Stack</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {[
                  'React 19 + TypeScript',
                  'Vite 6',
                  'Tailwind CSS v4',
                  'Express 4',
                  'PostgreSQL',
                  '@solana/web3.js',
                  'Three.js / R3F',
                  'Framer Motion',
                  '@google/genai (Gemini)',
                ].map((tech) => (
                  <div key={tech} className="flex items-center gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9945FF]" />
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-16 p-8 rounded-2xl bg-[#111] text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to get started?</h3>
                <p className="text-gray-400 text-sm">Join the future of chat-based payments on Solana.</p>
              </div>
              <Link to="/dashboard" className="bg-[#9945FF] hover:bg-[#8030E0] text-white px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap">
                Launch App
                <Rocket className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <footer className="mt-16 pt-8 border-t border-gray-200 pb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
              <p>&copy; 2026 SendlyFi. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link to="/" className="hover:text-[#9945FF] transition-colors">Home</Link>
                <a href="https://x.com/SendlyFi" target="_blank" rel="noopener noreferrer" className="hover:text-[#9945FF] transition-colors">X / Twitter</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-[#9945FF]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#9945FF]" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
    </div>
    <p className="text-gray-500 text-lg">{subtitle}</p>
  </div>
);

const DocParagraph = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600 leading-relaxed mb-6 max-w-3xl">{children}</p>
);

const DocSubheading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">{children}</h3>
);

const DocList = ({ items }: { items: string[] }) => (
  <ul className="space-y-3 mb-6 max-w-3xl">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-gray-600">
        <div className="w-1.5 h-1.5 rounded-full bg-[#9945FF] mt-2.5 flex-shrink-0" />
        <span className="leading-relaxed">{item}</span>
      </li>
    ))}
  </ul>
);
