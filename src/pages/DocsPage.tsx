import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';
import {
  BookOpen, MessageSquare, Shield, CreditCard, ArrowLeftRight,
  Users, Bot, Clock, BarChart3, FileText, ChevronRight,
  Rocket, Menu, X, Play, Code
} from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Overview', icon: BookOpen },
  { id: 'getting-started', title: 'Getting Started', icon: Play },
  { id: 'chat-wallet', title: 'Chat Wallet', icon: MessageSquare },
  { id: 'crypto-to-fiat', title: 'Crypto to Fiat', icon: ArrowLeftRight },
  { id: 'virtual-cards', title: 'Virtual Cards', icon: CreditCard },
  { id: 'privacy', title: 'Privacy & Security', icon: Shield },
  { id: 'ai-assistant', title: 'AI Banking Assistant', icon: Bot },
  { id: 'group-wallets', title: 'Group Wallets', icon: Users },
  { id: 'scheduled-payments', title: 'Scheduled Payments', icon: Clock },
  { id: 'dashboard', title: 'Spending Dashboard', icon: BarChart3 },
  { id: 'on-chain-receipts', title: 'On-Chain Receipts', icon: FileText },
  { id: 'api-reference', title: 'API Reference', icon: Code },
  { id: 'architecture', title: 'Architecture', icon: BookOpen },
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
              SendlyFi is a chat-first banking application built on the Solana blockchain. It enables users to send and receive cryptocurrency, off-ramp to local fiat currencies, generate virtual debit cards, and manage shared wallets, all from within a single conversational interface.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-10">
              This documentation covers every feature of the SendlyFi platform, its privacy architecture, the AI banking assistant, and the underlying technical infrastructure that makes sub-second settlement and confidential transactions possible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Chat Wallet', desc: 'Send payments via conversation', id: 'chat-wallet', color: 'bg-[#9945FF]' },
                { title: 'Crypto to Fiat', desc: 'Off-ramp to 100+ currencies', id: 'crypto-to-fiat', color: 'bg-[#14F195]' },
                { title: 'Virtual Cards', desc: 'Spend crypto anywhere', id: 'virtual-cards', color: 'bg-[#00C2FF]' },
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
            <SectionHeader icon={Play} title="Getting Started" subtitle="Get up and running with SendlyFi in minutes." />
            <DocSubheading>1. Create Your Account</DocSubheading>
            <DocParagraph>
              Download the SendlyFi app from the App Store or Google Play, or visit the web application. Sign up using your email address or connect an existing Solana wallet. If you do not have a wallet, SendlyFi will generate one for you automatically, secured by your device's biometric authentication (Face ID, fingerprint, or device PIN).
            </DocParagraph>
            <DocSubheading>2. Fund Your Wallet</DocSubheading>
            <DocParagraph>
              Deposit SOL, USDC, USDT, or any supported SPL token into your SendlyFi wallet address. You can fund your account by transferring tokens from an external wallet, purchasing crypto directly within the app using a debit card, or receiving a payment from another SendlyFi user.
            </DocParagraph>
            <DocSubheading>3. Start a Conversation</DocSubheading>
            <DocParagraph>
              Open a new chat thread with any contact using their wallet address, SendlyFi username, or Solana Name Service (SNS) domain. Type a message to start chatting, or use the inline payment composer to send your first payment. Payments are confirmed with a single tap and settle on Solana in under one second.
            </DocParagraph>
            <DocSubheading>4. Explore Features</DocSubheading>
            <DocList items={[
              'Generate a virtual debit card from the Cards tab to start spending crypto at any merchant',
              'Set up an off-ramp to your bank account from the Wallet tab to convert stablecoins to local fiat currency',
              'Create a group wallet from the Groups tab to pool funds with friends, teammates, or DAO members',
              'Enable the AI Banking Assistant from Settings to get spending insights and automated budget tracking',
              'Configure scheduled payments for recurring transfers, rent, or payroll',
            ]} />
            <DocSubheading>Prerequisites</DocSubheading>
            <DocList items={[
              'A smartphone (iOS 15+ or Android 10+) or a modern web browser (Chrome, Firefox, Safari, Edge)',
              'An email address for account creation (or an existing Solana wallet)',
              'SOL for transaction fees (typically under $0.001 per transaction)',
              'For off-ramp: a bank account in a supported country',
              'For virtual cards: identity verification (KYC) may be required for higher spending tiers',
            ]} />
          </section>

          <section id="chat-wallet" className="mb-20 scroll-mt-24">
            <SectionHeader icon={MessageSquare} title="Chat Wallet" subtitle="Wallet-native messaging that turns every conversation into a payment channel." />
            <DocParagraph>
              The Chat Wallet is the core interface of SendlyFi. Every SendlyFi user is identified by their Solana wallet address, and every conversation thread doubles as a payment rail. Users can send SOL, USDC, USDT, and other SPL tokens directly within a chat message, with no need to switch between applications or copy-paste addresses.
            </DocParagraph>
            <DocParagraph>
              Payments are initiated with natural language commands or through an inline payment composer. Typing a message such as "Send 50 USDC" to a contact triggers a confirmation modal with transaction details, estimated fees, and a one-tap approval flow. The recipient receives the funds in their SendlyFi wallet within seconds, accompanied by a chat notification.
            </DocParagraph>
            <DocSubheading>Key Capabilities</DocSubheading>
            <DocList items={[
              'Peer-to-peer transfers using any SPL token within the chat interface',
              'Payment requests with shareable deep links',
              'Bill splitting across group conversations with automatic settlement',
              'Transaction receipts embedded inline with message history',
              'QR code generation for in-person payments',
              'Contact resolution via wallet address, SendlyFi username, or Solana Name Service (SNS) domain',
            ]} />
            <DocSubheading>How It Works</DocSubheading>
            <DocParagraph>
              When a user initiates a payment, SendlyFi constructs a Solana transaction using the SPL Token program. The transaction is signed client-side using the user's embedded wallet (powered by a secure enclave on mobile devices or a browser extension on desktop). The signed transaction is submitted to a Solana RPC node, and SendlyFi monitors the transaction until finality is confirmed. The entire flow completes in under one second on average.
            </DocParagraph>
          </section>

          <section id="crypto-to-fiat" className="mb-20 scroll-mt-24">
            <SectionHeader icon={ArrowLeftRight} title="Crypto to Fiat" subtitle="Off-ramp stablecoins to local bank accounts in seconds." />
            <DocParagraph>
              SendlyFi provides a built-in off-ramp that converts stablecoins (USDC, USDT) into local fiat currencies and deposits them directly into the user's linked bank account. The service is available in over 100 countries and supports major currencies including USD, EUR, GBP, NGN, KES, GHS, ZAR, INR, BRL, and PHP.
            </DocParagraph>
            <DocParagraph>
              The off-ramp is powered by a network of regulated liquidity partners. SendlyFi aggregates quotes from multiple providers in real time to ensure users receive the best available exchange rate. There are no hidden markups; the displayed rate is the rate the user receives.
            </DocParagraph>
            <DocSubheading>Settlement Flow</DocSubheading>
            <DocParagraph>
              When a user initiates an off-ramp, the stablecoins are locked in a smart contract escrow on Solana. The escrow releases the tokens to the liquidity provider only after the fiat settlement is confirmed. If the fiat transfer fails, the escrowed tokens are returned to the user automatically. Settlement times vary by corridor but are typically under 60 seconds for supported instant-payment networks (e.g., SEPA Instant, Faster Payments, NIBSS Instant Payment).
            </DocParagraph>
            <DocSubheading>Supported Corridors</DocSubheading>
            <DocList items={[
              'USDC/USDT to NGN via local bank transfer (instant)',
              'USDC/USDT to USD via ACH or wire transfer',
              'USDC/USDT to EUR via SEPA or SEPA Instant',
              'USDC/USDT to GBP via Faster Payments',
              'USDC/USDT to KES, GHS, ZAR, INR, BRL, PHP via local rails',
              'Additional corridors are added regularly based on user demand',
            ]} />
          </section>

          <section id="virtual-cards" className="mb-20 scroll-mt-24">
            <SectionHeader icon={CreditCard} title="Virtual Cards" subtitle="Spend crypto anywhere with instantly generated virtual debit cards." />
            <DocParagraph>
              SendlyFi allows users to generate virtual Visa debit cards that are funded directly from their SendlyFi wallet. These cards can be used for online purchases, subscription payments, and anywhere Visa is accepted globally. Cards are created instantly and can be frozen, unfrozen, or deleted at any time from the SendlyFi interface.
            </DocParagraph>
            <DocSubheading>Card Features</DocSubheading>
            <DocList items={[
              'Instant issuance with no KYC friction for low-value cards',
              'Real-time spend notifications within the chat interface',
              'Per-card spending limits and merchant category controls',
              'Auto-top-up from wallet balance when the card balance is low',
              'Support for multiple active cards (e.g., one for subscriptions, one for daily spending)',
              'Temporary cards with automatic expiration for one-time purchases',
            ]} />
            <DocParagraph>
              When a card transaction is authorized, SendlyFi converts the required amount of USDC from the user's wallet into fiat at the prevailing market rate and settles with the card network. The conversion rate and any applicable fees are displayed in the transaction receipt.
            </DocParagraph>
          </section>

          <section id="privacy" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Shield} title="Privacy & Security" subtitle="End-to-end encrypted messaging and zero-knowledge transaction proofs." />
            <DocParagraph>
              Privacy is a foundational principle of SendlyFi. All messages between users are encrypted end-to-end using the Signal Protocol, ensuring that SendlyFi servers never have access to message content. Financial transactions are further protected using zero-knowledge proofs, which allow the network to verify transaction validity without revealing the sender, recipient, or amount to any third party.
            </DocParagraph>
            <DocSubheading>Zero-Knowledge Infrastructure</DocSubheading>
            <DocParagraph>
              SendlyFi uses a custom zero-knowledge proof system built on top of Solana's programmable infrastructure. When a user sends a private payment, a zk-SNARK proof is generated client-side that attests to the validity of the transaction (sufficient balance, correct token type, authorized sender) without revealing the transaction details on-chain. The proof is submitted alongside the transaction and verified by the SendlyFi program on Solana.
            </DocParagraph>
            <DocSubheading>Security Measures</DocSubheading>
            <DocList items={[
              'End-to-end encrypted messaging (Signal Protocol)',
              'Client-side zk-SNARK proof generation for private payments',
              'Biometric authentication (Face ID, fingerprint) for transaction signing',
              'Hardware-backed key storage using device secure enclaves',
              'Rate limiting and anomaly detection on all API endpoints',
              'Regular third-party security audits and penetration testing',
              'Bug bounty program for responsible vulnerability disclosure',
            ]} />
          </section>

          <section id="ai-assistant" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Bot} title="AI Banking Assistant" subtitle="A conversational AI that helps manage finances within the chat." />
            <DocParagraph>
              The SendlyFi AI Assistant is an integrated conversational agent that helps users manage their finances without leaving the chat interface. Users can interact with the assistant using natural language to check balances, review spending patterns, set up budgets, automate payments, and receive personalized financial insights.
            </DocParagraph>
            <DocSubheading>Capabilities</DocSubheading>
            <DocList items={[
              'Balance inquiries across all tokens and fiat accounts',
              'Spending summaries by category, time period, or merchant',
              'Budget creation and tracking with automated alerts',
              'Payment scheduling and recurring transfer setup',
              'Transaction search and filtering by amount, date, or contact',
              'Currency conversion quotes and rate alerts',
              'Guided onboarding for new users',
            ]} />
            <DocParagraph>
              The AI Assistant processes all queries locally where possible and never stores conversation history on external servers. For queries that require server-side processing (e.g., transaction history lookups), requests are encrypted in transit and at rest.
            </DocParagraph>
          </section>

          <section id="group-wallets" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Users} title="Group Wallets" subtitle="Shared wallets for teams, DAOs, and everyday group expenses." />
            <DocParagraph>
              SendlyFi Group Wallets allow multiple users to pool funds into a shared account with configurable access controls. Group wallets are ideal for roommates splitting rent, teams managing project budgets, or DAOs coordinating treasury operations.
            </DocParagraph>
            <DocSubheading>Access Control Model</DocSubheading>
            <DocParagraph>
              Each group wallet supports role-based permissions. The wallet creator (Admin) can assign roles to members: Admin (full control), Spender (can initiate transactions up to a defined limit), and Viewer (read-only access to balance and history). Transactions above the configured threshold require multi-signature approval from a quorum of Admins.
            </DocParagraph>
            <DocList items={[
              'Role-based access: Admin, Spender, Viewer',
              'Configurable spending limits per member',
              'Multi-signature approval for high-value transactions',
              'Shared transaction history visible to all members',
              'Integration with the chat interface for group discussions about finances',
              'Export of group wallet activity for accounting and tax reporting',
            ]} />
          </section>

          <section id="scheduled-payments" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Clock} title="Scheduled Payments" subtitle="Automate recurring transfers, bill splits, and payouts." />
            <DocParagraph>
              SendlyFi Scheduled Payments allow users to set up recurring transfers that execute automatically at defined intervals. Common use cases include salary payouts to global contributors, monthly rent payments, subscription top-ups, and recurring bill splits among group members.
            </DocParagraph>
            <DocSubheading>Configuration Options</DocSubheading>
            <DocList items={[
              'Frequency: daily, weekly, bi-weekly, monthly, or custom cron expressions',
              'Fixed amount or percentage-of-balance transfers',
              'Multi-recipient payouts in a single scheduled batch',
              'Automatic retry with configurable failure policies',
              'Notification preferences for upcoming and completed payments',
              'Pause, resume, or cancel schedules at any time',
            ]} />
            <DocParagraph>
              Scheduled payments are managed by the SendlyFi orchestration layer, which submits transactions to Solana at the specified intervals. If a scheduled payment fails (e.g., due to insufficient balance), the system retries according to the configured policy and notifies the user.
            </DocParagraph>
          </section>

          <section id="dashboard" className="mb-20 scroll-mt-24">
            <SectionHeader icon={BarChart3} title="Spending Dashboard" subtitle="Track balances, transaction history, and spending trends." />
            <DocParagraph>
              The Spending Dashboard provides a comprehensive view of a user's financial activity across all SendlyFi accounts. It aggregates data from the chat wallet, virtual cards, group wallets, and off-ramp transactions into a single, unified interface.
            </DocParagraph>
            <DocSubheading>Dashboard Features</DocSubheading>
            <DocList items={[
              'Real-time balance display across all tokens and fiat accounts',
              'Transaction history with search, filter, and export capabilities',
              'Spending categorization by merchant type, contact, or custom tags',
              'Weekly and monthly spending trend charts',
              'Budget progress indicators with visual alerts',
              'Downloadable CSV and PDF reports for accounting',
            ]} />
          </section>

          <section id="on-chain-receipts" className="mb-20 scroll-mt-24">
            <SectionHeader icon={FileText} title="On-Chain Receipts" subtitle="Immutable transaction records for compliance and accounting." />
            <DocParagraph>
              Every transaction processed through SendlyFi generates an on-chain receipt that is permanently recorded on the Solana blockchain. These receipts serve as immutable, timestamped proof of payment and are accessible to both sender and recipient at any time.
            </DocParagraph>
            <DocSubheading>Receipt Contents</DocSubheading>
            <DocList items={[
              'Transaction hash and Solana block number',
              'Sender and recipient identifiers (wallet address or SendlyFi username)',
              'Token type, amount, and USD-equivalent value at time of transfer',
              'Timestamp and confirmation status',
              'Associated memo or message (if included by the sender)',
              'Link to Solana Explorer for independent verification',
            ]} />
            <DocParagraph>
              On-chain receipts can be exported individually or in bulk for tax preparation and compliance reporting. SendlyFi provides integrations with popular accounting tools and generates formatted reports compatible with tax filing requirements in supported jurisdictions.
            </DocParagraph>
          </section>

          <section id="api-reference" className="mb-20 scroll-mt-24">
            <SectionHeader icon={Code} title="API Reference" subtitle="Programmatic access to SendlyFi's core banking and payment functionality." />
            <DocParagraph>
              The SendlyFi API provides RESTful endpoints for integrating SendlyFi's payment, wallet, and card management capabilities into third-party applications. All API requests are authenticated using API keys issued from the SendlyFi developer dashboard. Requests and responses use JSON encoding over HTTPS.
            </DocParagraph>
            <DocSubheading>Base URL</DocSubheading>
            <div className="bg-[#111] text-[#14F195] font-mono text-sm p-4 rounded-xl mb-6 max-w-3xl overflow-x-auto">
              https://api.sendlyfi.com/v1
            </div>
            <DocSubheading>Authentication</DocSubheading>
            <DocParagraph>
              All API requests require an API key passed in the Authorization header. API keys are scoped to specific permissions (read-only, transactional, admin) and can be rotated from the developer dashboard. Rate limits are enforced per key: 100 requests per second for read endpoints and 10 requests per second for write endpoints.
            </DocParagraph>
            <div className="bg-[#111] text-gray-300 font-mono text-sm p-4 rounded-xl mb-6 max-w-3xl overflow-x-auto">
              <span className="text-[#9945FF]">Authorization:</span> Bearer sk_live_your_api_key
            </div>
            <DocSubheading>Core Endpoints</DocSubheading>
            <div className="space-y-4 max-w-3xl mb-6">
              {[
                { method: 'GET', path: '/wallets/:id', desc: 'Retrieve wallet balance and metadata' },
                { method: 'POST', path: '/transfers', desc: 'Initiate a peer-to-peer token transfer' },
                { method: 'POST', path: '/offramp', desc: 'Convert stablecoins to fiat and initiate bank deposit' },
                { method: 'GET', path: '/transactions', desc: 'List transaction history with filtering and pagination' },
                { method: 'POST', path: '/cards', desc: 'Create a new virtual debit card' },
                { method: 'PATCH', path: '/cards/:id', desc: 'Update card status, limits, or merchant controls' },
                { method: 'DELETE', path: '/cards/:id', desc: 'Permanently delete a virtual card' },
                { method: 'POST', path: '/groups', desc: 'Create a new group wallet' },
                { method: 'POST', path: '/groups/:id/members', desc: 'Add a member with role-based permissions' },
                { method: 'POST', path: '/schedules', desc: 'Create a scheduled recurring payment' },
                { method: 'GET', path: '/receipts/:txHash', desc: 'Retrieve on-chain receipt for a transaction' },
              ].map((ep, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100">
                  <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                    ep.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    ep.method === 'POST' ? 'bg-green-100 text-green-700' :
                    ep.method === 'PATCH' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{ep.method}</span>
                  <div>
                    <code className="text-sm font-mono text-gray-800">{ep.path}</code>
                    <p className="text-sm text-gray-500 mt-0.5">{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <DocSubheading>Webhooks</DocSubheading>
            <DocParagraph>
              SendlyFi supports webhook notifications for real-time event delivery. Configure webhook URLs in the developer dashboard to receive HTTP POST callbacks for events such as payment completion, off-ramp settlement, card authorization, and scheduled payment execution. All webhook payloads are signed with HMAC-SHA256 for authenticity verification.
            </DocParagraph>
            <DocSubheading>SDKs</DocSubheading>
            <DocParagraph>
              Official SDKs are available for JavaScript/TypeScript, Python, and Rust. The SDKs wrap the REST API with typed interfaces, automatic retry logic, and webhook signature verification utilities. SDKs are published to npm, PyPI, and crates.io respectively.
            </DocParagraph>
          </section>

          <section id="architecture" className="mb-20 scroll-mt-24">
            <SectionHeader icon={BookOpen} title="Architecture" subtitle="Technical overview of the SendlyFi platform." />
            <DocParagraph>
              SendlyFi is built on the Solana blockchain, chosen for its high throughput (up to 65,000 transactions per second), sub-second finality, and minimal transaction fees (typically under $0.001 per transaction). The platform consists of three primary layers: the client application, the orchestration layer, and the on-chain programs.
            </DocParagraph>
            <DocSubheading>Client Application</DocSubheading>
            <DocParagraph>
              The SendlyFi client is available as a mobile application (iOS and Android) and a web application. The client handles wallet management, message encryption/decryption, zk-SNARK proof generation, and transaction signing. All sensitive operations (key storage, biometric authentication, proof generation) are performed client-side to minimize trust assumptions.
            </DocParagraph>
            <DocSubheading>Orchestration Layer</DocSubheading>
            <DocParagraph>
              The orchestration layer manages scheduled payments, off-ramp coordination, card issuance, and notification delivery. It communicates with the Solana blockchain via RPC nodes and with external partners (liquidity providers, card networks) via secure API integrations. The orchestration layer does not have access to user private keys or message content.
            </DocParagraph>
            <DocSubheading>On-Chain Programs</DocSubheading>
            <DocParagraph>
              SendlyFi deploys a set of Solana programs (smart contracts) that handle escrow, multi-signature approval, zero-knowledge proof verification, and on-chain receipt generation. These programs are open-source, audited, and upgradeable via a governance mechanism controlled by the SendlyFi DAO.
            </DocParagraph>

            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-[#9945FF]/5 to-[#14F195]/5 border border-[#9945FF]/10">
              <h4 className="font-semibold text-gray-900 mb-3">Technology Stack</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {[
                  'Solana Blockchain',
                  'SPL Token Program',
                  'Signal Protocol (E2EE)',
                  'zk-SNARKs',
                  'Rust (On-Chain)',
                  'React Native (Mobile)',
                  'TypeScript (Web)',
                  'Solana Web3.js',
                  'Anchor Framework',
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
                <p className="text-gray-400 text-sm">Join the future of chat-based banking on Solana.</p>
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
