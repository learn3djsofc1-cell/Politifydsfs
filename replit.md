# SendlyFi Landing Page & Dashboard

## Overview
A React + TypeScript landing page and dashboard app for **SendlyFi**, a crypto-to-fiat chat banking app. Built with Vite, featuring Solana-themed 3D graphics (Three.js / React Three Fiber), animations (Framer Motion), and Tailwind CSS v4 styling.

**Brand**: SendlyFi ("Chat Is the New Bank")
**X/Twitter**: https://x.com/SendlyFi

## Routing
- **React Router** (`react-router-dom`) provides client-side routing via `BrowserRouter`
- `/` - Landing page with all sections
- `/docs` - Full documentation page with sidebar navigation
- `/signup` - Create account (password > receive ZKID)
- `/login` - Log in with ZKID + password
- `/dashboard/create-wallet` - Wallet creation page (shown if user has no wallet)
- `/dashboard` - Protected dashboard (redirects to /login if unauthenticated; wallet gate redirects to /dashboard/create-wallet if no wallet) with nested routes:
  - `/dashboard` (index) - Overview: wallet balance (live SOL/USDC from Helius RPC), USD conversion (CoinGecko prices), public key display, network badge, quick actions, income/spending cards, empty recent activity, auto-refresh (30s + focus)
  - `/dashboard/wallets` - Wallets page: full wallet address display, SOL/USDC balances with USD conversion, copy address, Solana Explorer link, network badge (Devnet/Mainnet), skeleton loading, error/retry, auto-refresh
  - `/dashboard/chat` - Full chat system: user search, conversation list, real-time messaging (4s polling), send SOL/USDC payments (testnet: simulated DB transfers; mainnet: on-chain), payment message bubbles with Explorer links
  - `/dashboard/cards` - Virtual card management: animated SVG cards (Framer Motion), Visa (blue gradient #1A1F71/#00579F) and Mastercard (dark base #1A1A2E with red/orange overlapping circles), mainnet-only creation, cardholder name input, card detail reveal (Luhn-valid number, CVV, expiry via AES-256-GCM encrypted storage), real-time mainnet wallet balance (SOL+USDC), freeze/unfreeze, 7-day soft delete, responsive bottom-sheet modal
  - `/dashboard/payments` - Scheduled payments with empty state, Set Up Payment CTA, feature cards
  - `/dashboard/settings` - Account settings with profile, security, preferences sections
- Navbar links: Features (`#features`), Community (`#community`), Docs (`/docs`), X (external)
- All "Launch App" buttons (Navbar, CTASection, DocsPage) link to `/dashboard` (redirects to /login if not authenticated)

## Visual Polish (Task #2 Complete)
- Hero badge: "Powered By Solana" with inline Solana SVG icon
- All em-dash characters removed from copy across all components
- FeaturesSection: Card SVGs redesigned (chat thread, shield/privacy, currency swap, floating debit card); inline icons updated (chat bubble, lock, swap arrows, credit card)
- GridFeaturesSection: SVGs redesigned (AI bot hub, clock/scheduled payments, receipt/ledger, shared wallet with people)
- InteractiveCardsSection: Lucide icons updated (MessageSquare, ShieldCheck, CreditCard)
- CommunitySection: SVGs redesigned (person messaging, globe+currencies, DAO network, payroll flow, shield+lock, institution+privacy shield)
- CTASection: Badge changed from "PERFORMANCE 99.9%" to "SETTLEMENT < 1s"
- Logo asset updated in public/sendlyfi-logo.png

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite 6
- **Backend**: Express 4, TypeScript (tsx watch), PostgreSQL
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Routing**: react-router-dom
- **3D**: Three.js, @react-three/fiber, @react-three/drei
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **AI**: @google/genai (Gemini API via Replit AI Integrations) - production-grade NLP payment intent parser supporting multi-token commands, @username recipient extraction, "send all/balance" keywords, English-only parsing
- **Auth**: bcryptjs (password hashing), jsonwebtoken (JWT sessions)
- **Solana**: @solana/web3.js (keypair generation, RPC queries), bs58 (base58 encoding)
- **Database**: pg (PostgreSQL client)
- **Package Manager**: npm

## Project Structure
```
src/
  App.tsx                        # Root with Routes (/, /docs, /dashboard/*)
  main.tsx                       # Entry point with BrowserRouter
  index.css                      # Global styles
  components/
    Navbar.tsx                   # SendlyFi navbar with React Router Links
    HeroGrid.tsx                 # Background grid animation
    HeroContent.tsx              # Hero: "Chat Is the New Bank"
    FeaturesSection.tsx          # 4 feature cards (id="features")
    GridFeaturesSection.tsx      # 6 grid features
    InteractiveCardsSection.tsx  # 3 product pillars (id="product")
    CommunitySection.tsx         # Use cases (id="community")
    CTASection.tsx               # CTA with 3D robot, "Launch App" + "Documentation" buttons
    FooterSection.tsx            # Footer with 3D cubic cluster, SENDLYFI brand, X link
    Solana3D.tsx                 # 3D Solana logo component
    Logo.tsx                     # SendlyFi logo (PNG image from public/)
  contexts/
    AuthContext.tsx               # Auth provider: signup, login, logout, session state
  pages/
    SignUpPage.tsx                # Sign up form → ZKID reveal screen
    LoginPage.tsx                # Login form (ZKID + password)
    DocsPage.tsx                 # Full documentation page with sidebar + content
    dashboard/
      DashboardLayout.tsx        # Responsive layout: sidebar (desktop) + bottom tabs (mobile), testnet/mainnet toggle
      CreateWalletPage.tsx       # Solana wallet creation with private key reveal + Phantom import instructions
      WalletsPage.tsx            # Wallet detail page: address, SOL/USDC balances, USD conversion, copy, Explorer link
      OverviewPage.tsx           # Live wallet balance (SOL/USDC via Helius RPC), USD prices, quick actions, income/spending, activity
      ChatPage.tsx               # AI-powered chat: Gemini intent detection, natural language payments ("send 10 USDC"), inline confirmation cards, password auth
      CardsPage.tsx              # Virtual cards: animated SVG, Visa/Mastercard branding, detail reveal, mainnet-only
      PaymentsPage.tsx           # Scheduled payments with empty state
      SettingsPage.tsx           # Profile, security, preferences settings
server/
  index.ts                       # Express server entry point (port 3001)
  db.ts                          # PostgreSQL connection pool + schema init (users, wallets tables)
  auth.ts                        # Auth utilities: ZKID generation, bcrypt, JWT, AES-256-GCM encryption
  middleware.ts                  # Express middleware: requireAuth (JWT Bearer token validation)
  routes/
    auth.ts                      # POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me
    wallet.ts                    # POST /api/wallet/create (keypair gen + encrypt + store), GET /api/wallet (public key + balances)
    chat.ts                      # GET/POST /api/chat/conversations, GET/POST /api/chat/conversations/:id/messages, POST /api/chat/parse-intent (NLP payment parser)
    transactions.ts              # POST /api/transactions/send (on-chain SOL/USDC transfer), GET /api/transactions/:id, POST /api/transactions/airdrop
    user.ts                      # GET /api/users/search, GET/PUT /api/users/network-mode
    prices.ts                    # GET /api/prices (CoinGecko SOL/USDC prices with 30s cache)
public/
  sendlyfi-logo.png             # SendlyFi logo asset
index.html                      # Title: "SendlyFi - Chat Is the New Bank"
vite.config.ts
```

## Development
- **Dev server**: `npm run dev` - runs Vite (port 5000) + Express API (port 3001) via concurrently
- **API proxy**: Vite proxies `/api/*` requests to Express on port 3001
- **Build**: `npm run build` - outputs to `dist/`
- **Type check**: `npm run lint`

## Environment Variables
- `DATABASE_URL`  - PostgreSQL connection string (auto-set by Replit)
- `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGPORT`  - Individual PG vars
- `JWT_SECRET`  - Secret for signing JWT tokens (auto-generated if not set)
- `SOLANA_RPC_URL`  - Solana RPC endpoint (defaults to devnet: https://api.devnet.solana.com)
- `AI_INTEGRATIONS_GEMINI_API_KEY`  - Gemini API key (set via Replit AI Integrations)
- `AI_INTEGRATIONS_GEMINI_BASE_URL`  - Gemini base URL (set via Replit AI Integrations)
- `APP_URL`  - URL where the app is hosted

## Database Schema
- **users**: id (serial PK), zkid (varchar(8) unique), password_hash, created_at
- **wallets**: id (serial PK), user_id (FK → users), public_key, encrypted_private_key (AES-256-GCM), network, created_at

## Deployment
Configured as a **static** deployment:
- Build command: `npm run build`
- Public directory: `dist`

## API Keys & Integrations
- **Helius RPC**: Used for Solana balance fetching (devnet + mainnet), key stored in `HELIUS_API_KEY` env var
- **CoinGecko**: Used for real-time SOL/USDC price data, key stored in `COINGECKO_API_KEY` env var
- Price cache TTL: 30 seconds to avoid rate limits

## Database Tables
- `users`: id, zkid, username (unique), password_hash, network_mode (devnet/mainnet-beta), created_at
- `wallets`: id, user_id, public_key, encrypted_private_key, network, created_at
- `conversations`: id, user1_id, user2_id, created_at, updated_at
- `messages`: id, conversation_id, sender_id, content, message_type (text/payment), transaction_id, created_at
- `transactions`: id, sender_id, receiver_id, amount, token (SOL/USDC), tx_signature, network, status (pending/confirmed/failed), created_at
- `testnet_balances`: id, user_id (unique), sol_balance (default 10), usdc_balance (default 1000), updated_at

## API Endpoints
- `POST /api/auth/signup`  - requires username + password, returns zkid + token
- `POST /api/auth/login`  - zkid + password login
- `GET /api/auth/me`  - returns user profile with username, networkMode, wallets
- `POST /api/wallet/create`  - creates Solana wallet with encrypted private key
- `GET /api/wallet`  - returns wallet info with balances (testnet: from DB testnet_balances table; mainnet: from Solana RPC)
- `GET /api/users/search?q=`  - searches users by username prefix (excludes self)
- `GET /api/users/network-mode`  - get user's network mode
- `PUT /api/users/network-mode`  - toggle between devnet and mainnet-beta
- `GET /api/prices`  - real-time SOL and USDC prices from CoinGecko (30s cache)
- `GET /api/chat/conversations`  - list user's conversations with last message preview
- `POST /api/chat/conversations`  - create or get existing conversation with another user
- `GET /api/chat/conversations/:id/messages`  - get messages with pagination (before cursor)
- `POST /api/chat/conversations/:id/messages`  - send a text message
- `POST /api/chat/parse-intent`  - AI-powered intent parsing via Gemini 2.5 Flash; detects payment intents from natural language, returns `{type:"payment",amount,token}` or `{type:"text"}`
- `POST /api/transactions/send`  - send SOL/USDC (testnet: DB balance transfer, instant confirmed; mainnet: on-chain Solana transfer with async confirmation)
- `GET /api/transactions/:id`  - get transaction details

## Notes
- Vite file watcher ignores `.local/`, `.cache/`, `.git/`, `.agents/`, `tmp/` to prevent reload loops in Replit
- All 3D scenes, SVG animations, layout structure, and transitions are preserved from the original template  - only text/content was changed
- Logo uses the provided PNG image (`attached_assets/Frame_1171275135_1773729384302.png` → `public/sendlyfi-logo.png`)
- Dashboard uses zero/empty state data only  - no mock numbers or fake transactions
- Auth & Dashboard design: original default styling from initial template (light/white cards, purple accent buttons)
- USDC mints: Devnet=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr, Mainnet=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
