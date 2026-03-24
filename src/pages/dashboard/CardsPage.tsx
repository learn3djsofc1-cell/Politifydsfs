import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Snowflake, Trash2, Undo2,
  AlertCircle, Loader2, X, CheckCircle2, Eye, EyeOff, Wallet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Card {
  id: number;
  card_type: 'visa' | 'mastercard';
  card_number_last4: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  status: 'active' | 'frozen' | 'pending_deletion';
  previous_status: string | null;
  deletion_requested_at: string | null;
  created_at: string;
}

interface CardDetails {
  cardNumber: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
}

interface WalletBalances {
  sol: number;
  usdc: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function getDeletionDate(deletionRequestedAt: string): Date {
  const d = new Date(deletionRequestedAt);
  d.setDate(d.getDate() + 7);
  return d;
}

function formatCountdown(deletionRequestedAt: string): string {
  const deleteDate = getDeletionDate(deletionRequestedAt);
  const now = Date.now();
  const diffMs = deleteDate.getTime() - now;
  if (diffMs <= 0) return 'Deleting soon';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

function formatExpiry(month: number, year: number): string {
  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
}

function formatCardNumber(num: string): string {
  return num.replace(/(.{4})/g, '$1 ').trim();
}

function VisaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 780 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M293.2 348.7L331.3 152.0H390.8L352.7 348.7H293.2Z" fill="white"/>
      <path d="M560.7 158.0C548.0 153.2 528.6 148.0 504.8 148.0C445.9 148.0 404.0 179.5 403.7 224.0C403.1 257.3 434.0 275.7 457.1 286.7C480.8 297.9 488.8 305.2 488.7 315.2C488.4 330.7 469.5 337.8 451.9 337.8C427.8 337.8 415.0 334.4 395.3 325.8L388.0 322.3L380.0 371.5C394.5 378.0 420.8 383.8 448.2 384.0C511.0 384.0 552.0 353.0 552.5 305.8C552.7 279.3 536.0 259.0 500.3 242.3C479.0 231.7 466.0 224.5 466.2 213.7C466.2 204.2 477.2 194.0 500.8 194.0C520.5 193.7 534.8 198.3 546.0 203.0L551.5 205.7L560.7 158.0Z" fill="white"/>
      <path d="M640.0 152.0C655.0 152.0 666.0 156.5 673.5 172.0L750.0 348.7H688.5L676.5 313.0H600.5L592.0 348.7H535.0L601.5 164.0C607.0 152.0 618.0 152.0 640.0 152.0ZM652.0 214.0L623.0 276.0H668.0L652.0 214.0Z" fill="white"/>
      <path d="M248.0 152.0L190.0 287.0L183.5 254.0C172.5 218.0 139.0 179.0 102.0 159.5L155.5 348.5H219.0L312.0 152.0H248.0Z" fill="white"/>
      <path d="M146.5 152.0H51.0L50.0 156.5C125.0 175.5 174.5 218.0 191.0 270.0L174.0 172.5C171.0 157.0 159.5 152.5 146.5 152.0Z" fill="#F7B600"/>
    </svg>
  );
}

function MastercardLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 152 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#EB001B" opacity="0.9"/>
      <circle cx="102" cy="50" r="40" fill="#F79E1B" opacity="0.9"/>
      <path d="M76 19.4C84.8 26.6 90.2 37.6 90.2 50C90.2 62.4 84.8 73.4 76 80.6C67.2 73.4 61.8 62.4 61.8 50C61.8 37.6 67.2 26.6 76 19.4Z" fill="#FF5F00"/>
    </svg>
  );
}

function AnimatedCardSVG({
  cardType,
  last4,
  cardholderName,
  expiryMonth,
  expiryYear,
  isFrozen,
  isPendingDeletion,
  showDetails,
  details,
  balances,
}: {
  cardType: 'visa' | 'mastercard';
  last4: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  isFrozen: boolean;
  isPendingDeletion: boolean;
  showDetails: boolean;
  details: CardDetails | null;
  balances: WalletBalances;
}) {
  const isVisa = cardType === 'visa';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={!isFrozen && !isPendingDeletion ? { scale: 1.02, y: -4 } : {}}
      className={`relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-lg ${
        isPendingDeletion ? 'opacity-60' : isFrozen ? 'opacity-75' : ''
      }`}
    >
      <svg viewBox="0 0 400 252" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {isVisa ? (
            <linearGradient id={`cardGrad-${last4}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A1F71"/>
              <stop offset="50%" stopColor="#00579F"/>
              <stop offset="100%" stopColor="#1A1F71"/>
            </linearGradient>
          ) : (
            <linearGradient id={`cardGrad-${last4}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EB001B"/>
              <stop offset="50%" stopColor="#FF5F00"/>
              <stop offset="100%" stopColor="#F79E1B"/>
            </linearGradient>
          )}
          <linearGradient id={`chipGrad-${last4}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7D66A"/>
            <stop offset="100%" stopColor="#D4A843"/>
          </linearGradient>
        </defs>

        <rect width="400" height="252" rx="16" fill={`url(#cardGrad-${last4})`}/>

        {isVisa ? (
          <>
            <circle cx="350" cy="80" r="120" fill="white" opacity="0.03"/>
            <circle cx="360" cy="60" r="80" fill="white" opacity="0.04"/>
          </>
        ) : (
          <>
            <circle cx="120" cy="-20" r="140" fill="white" opacity="0.08"/>
            <circle cx="300" cy="-10" r="130" fill="white" opacity="0.06"/>
            <circle cx="380" cy="200" r="100" fill="white" opacity="0.05"/>
          </>
        )}

        <rect x="32" y="70" width="45" height="34" rx="5" fill={`url(#chipGrad-${last4})`}/>
        <line x1="32" y1="82" x2="77" y2="82" stroke="#C4993D" strokeWidth="0.5" opacity="0.6"/>
        <line x1="32" y1="92" x2="77" y2="92" stroke="#C4993D" strokeWidth="0.5" opacity="0.6"/>
        <line x1="55" y1="70" x2="55" y2="104" stroke="#C4993D" strokeWidth="0.5" opacity="0.6"/>

        <text x="32" y="145" fill="white" opacity="0.9" fontFamily="monospace" fontSize="18" letterSpacing="3">
          {showDetails && details
            ? formatCardNumber(details.cardNumber)
            : `**** **** **** ${last4}`}
        </text>

        <text x="32" y="185" fill="white" opacity="0.5" fontFamily="sans-serif" fontSize="8" letterSpacing="1">
          CARD HOLDER
        </text>
        <text x="32" y="200" fill="white" opacity="0.85" fontFamily="sans-serif" fontSize="12" letterSpacing="0.5">
          {cardholderName}
        </text>

        <text x="220" y="185" fill="white" opacity="0.5" fontFamily="sans-serif" fontSize="8" letterSpacing="1">
          EXPIRES
        </text>
        <text x="220" y="200" fill="white" opacity="0.85" fontFamily="monospace" fontSize="12">
          {formatExpiry(expiryMonth, expiryYear)}
        </text>

        {showDetails && details && (
          <>
            <text x="300" y="185" fill="white" opacity="0.5" fontFamily="sans-serif" fontSize="8" letterSpacing="1">
              CVV
            </text>
            <text x="300" y="200" fill="white" opacity="0.85" fontFamily="monospace" fontSize="12">
              {details.cvv}
            </text>
          </>
        )}

        <text x="32" y="235" fill="white" opacity="0.4" fontFamily="sans-serif" fontSize="7" letterSpacing="0.5">
          SOL {balances.sol.toFixed(4)} | USDC {balances.usdc.toFixed(2)}
        </text>

        {isVisa ? (
          <g transform="translate(300, 20) scale(0.12)">
            <path d="M293.2 348.7L331.3 152.0H390.8L352.7 348.7H293.2Z" fill="white"/>
            <path d="M560.7 158.0C548.0 153.2 528.6 148.0 504.8 148.0C445.9 148.0 404.0 179.5 403.7 224.0C403.1 257.3 434.0 275.7 457.1 286.7C480.8 297.9 488.8 305.2 488.7 315.2C488.4 330.7 469.5 337.8 451.9 337.8C427.8 337.8 415.0 334.4 395.3 325.8L388.0 322.3L380.0 371.5C394.5 378.0 420.8 383.8 448.2 384.0C511.0 384.0 552.0 353.0 552.5 305.8C552.7 279.3 536.0 259.0 500.3 242.3C479.0 231.7 466.0 224.5 466.2 213.7C466.2 204.2 477.2 194.0 500.8 194.0C520.5 193.7 534.8 198.3 546.0 203.0L551.5 205.7L560.7 158.0Z" fill="white"/>
            <path d="M640.0 152.0C655.0 152.0 666.0 156.5 673.5 172.0L750.0 348.7H688.5L676.5 313.0H600.5L592.0 348.7H535.0L601.5 164.0C607.0 152.0 618.0 152.0 640.0 152.0ZM652.0 214.0L623.0 276.0H668.0L652.0 214.0Z" fill="white"/>
            <path d="M248.0 152.0L190.0 287.0L183.5 254.0C172.5 218.0 139.0 179.0 102.0 159.5L155.5 348.5H219.0L312.0 152.0H248.0Z" fill="white"/>
            <path d="M146.5 152.0H51.0L50.0 156.5C125.0 175.5 174.5 218.0 191.0 270.0L174.0 172.5C171.0 157.0 159.5 152.5 146.5 152.0Z" fill="#F7B600"/>
          </g>
        ) : (
          <g transform="translate(310, 20)">
            <circle cx="25" cy="25" r="22" fill="#EB001B" opacity="0.9"/>
            <circle cx="55" cy="25" r="22" fill="#F79E1B" opacity="0.9"/>
            <path d="M40 8.5C45.5 13.5 49 20.8 49 29C49 37.2 45.5 44.5 40 49.5C34.5 44.5 31 37.2 31 29C31 20.8 34.5 13.5 40 8.5Z" fill="#FF5F00"/>
          </g>
        )}
      </svg>

      {isFrozen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px] flex items-center justify-center"
        >
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
            <Snowflake className="w-5 h-5 text-blue-200" />
            <span className="text-white font-medium text-sm">Card Frozen</span>
          </div>
        </motion.div>
      )}

      {isPendingDeletion && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/40 text-red-200 uppercase backdrop-blur-sm">
            Deleting
          </span>
        </div>
      )}
    </motion.div>
  );
}

function CardPreviewSVG({ cardType, selected }: { cardType: 'visa' | 'mastercard'; selected: boolean }) {
  const isVisa = cardType === 'visa';
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="w-full aspect-[1.6/1] rounded-lg overflow-hidden"
    >
      <svg viewBox="0 0 200 125" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {isVisa ? (
            <linearGradient id={`previewGrad-${cardType}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A1F71"/>
              <stop offset="100%" stopColor="#00579F"/>
            </linearGradient>
          ) : (
            <linearGradient id={`previewGrad-${cardType}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EB001B"/>
              <stop offset="100%" stopColor="#F79E1B"/>
            </linearGradient>
          )}
        </defs>
        <rect width="200" height="125" rx="10" fill={`url(#previewGrad-${cardType})`}/>
        {!isVisa && (
          <>
            <circle cx="60" cy="-5" r="60" fill="white" opacity="0.1"/>
            <circle cx="150" cy="0" r="55" fill="white" opacity="0.08"/>
          </>
        )}
        <rect x="16" y="40" width="24" height="18" rx="3" fill="#F7D66A" opacity="0.8"/>
        {isVisa ? (
          <g transform="translate(140, 15) scale(0.06)">
            <path d="M293.2 348.7L331.3 152.0H390.8L352.7 348.7H293.2Z" fill="white"/>
            <path d="M560.7 158.0C548.0 153.2 528.6 148.0 504.8 148.0C445.9 148.0 404.0 179.5 403.7 224.0C403.1 257.3 434.0 275.7 457.1 286.7C480.8 297.9 488.8 305.2 488.7 315.2C488.4 330.7 469.5 337.8 451.9 337.8C427.8 337.8 415.0 334.4 395.3 325.8L388.0 322.3L380.0 371.5C394.5 378.0 420.8 383.8 448.2 384.0C511.0 384.0 552.0 353.0 552.5 305.8C552.7 279.3 536.0 259.0 500.3 242.3C479.0 231.7 466.0 224.5 466.2 213.7C466.2 204.2 477.2 194.0 500.8 194.0C520.5 193.7 534.8 198.3 546.0 203.0L551.5 205.7L560.7 158.0Z" fill="white"/>
            <path d="M640.0 152.0C655.0 152.0 666.0 156.5 673.5 172.0L750.0 348.7H688.5L676.5 313.0H600.5L592.0 348.7H535.0L601.5 164.0C607.0 152.0 618.0 152.0 640.0 152.0ZM652.0 214.0L623.0 276.0H668.0L652.0 214.0Z" fill="white"/>
            <path d="M248.0 152.0L190.0 287.0L183.5 254.0C172.5 218.0 139.0 179.0 102.0 159.5L155.5 348.5H219.0L312.0 152.0H248.0Z" fill="white"/>
            <path d="M146.5 152.0H51.0L50.0 156.5C125.0 175.5 174.5 218.0 191.0 270.0L174.0 172.5C171.0 157.0 159.5 152.5 146.5 152.0Z" fill="#F7B600"/>
          </g>
        ) : (
          <g transform="translate(140, 15)">
            <circle cx="18" cy="18" r="15" fill="#EB001B" opacity="0.9"/>
            <circle cx="38" cy="18" r="15" fill="#F79E1B" opacity="0.9"/>
            <path d="M28 6C32 9.5 34.5 14.5 34.5 20C34.5 25.5 32 30.5 28 34C24 30.5 21.5 25.5 21.5 20C21.5 14.5 24 9.5 28 6Z" fill="#FF5F00"/>
          </g>
        )}
        <text x="16" y="85" fill="white" opacity="0.6" fontFamily="monospace" fontSize="8" letterSpacing="2">
          **** **** **** ****
        </text>
        {selected && (
          <rect width="200" height="125" rx="10" stroke={isVisa ? '#4A90D9' : '#FF5F00'} strokeWidth="3" fill="none"/>
        )}
      </svg>
    </motion.div>
  );
}

export const CardsPage = () => {
  const { token, user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [createType, setCreateType] = useState<'visa' | 'mastercard'>('visa');
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [networkMode, setNetworkMode] = useState('devnet');
  const [balances, setBalances] = useState<WalletBalances>({ sol: 0, usdc: 0 });
  const [cardholderNameInput, setCardholderNameInput] = useState('');

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const fetchCards = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/cards', { headers: headers() });
      if (!res.ok) throw new Error('Failed to fetch cards');
      const data = await res.json();
      setCards(data.cards || []);
      setNetworkMode(data.networkMode || 'devnet');
      setBalances(data.balances || { sol: 0, usdc: 0 });
    } catch {
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    setLoading(true);
    fetchCards();
  }, [fetchCards]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCreate = async () => {
    clearMessages();
    setCreating(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          cardType: createType,
          cardholderName: cardholderNameInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create card');
        return;
      }
      setSuccess(`${createType === 'visa' ? 'Visa' : 'Mastercard'} card created successfully`);
      setShowCreateModal(false);
      setCardholderNameInput('');
      await fetchCards();
    } catch {
      setError('Failed to create card');
    } finally {
      setCreating(false);
    }
  };

  const handleFreeze = async (cardId: number) => {
    clearMessages();
    setActionLoading(cardId);
    try {
      const res = await fetch(`/api/cards/${cardId}/freeze`, {
        method: 'PATCH',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update card');
        return;
      }
      await fetchCards();
    } catch {
      setError('Failed to update card');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (cardId: number) => {
    clearMessages();
    setActionLoading(cardId);
    setShowDeleteConfirm(null);
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to delete card');
        return;
      }
      setSuccess('Card scheduled for deletion in 7 days');
      await fetchCards();
    } catch {
      setError('Failed to delete card');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelDeletion = async (cardId: number) => {
    clearMessages();
    setActionLoading(cardId);
    try {
      const res = await fetch(`/api/cards/${cardId}/cancel-deletion`, {
        method: 'PATCH',
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to cancel deletion');
        return;
      }
      setSuccess('Card deletion cancelled');
      await fetchCards();
    } catch {
      setError('Failed to cancel deletion');
    } finally {
      setActionLoading(null);
    }
  };

  const hasVisa = cards.some(c => c.card_type === 'visa');
  const hasMastercard = cards.some(c => c.card_type === 'mastercard');
  const canCreateMore = !hasVisa || !hasMastercard;
  const isMainnet = networkMode === 'mainnet-beta';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] w-full mx-auto overflow-x-hidden"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Cards</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your virtual debit cards</p>
        </div>
        <div className="flex items-center gap-3">
          {isMainnet && cards.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <Wallet className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">
                {balances.sol.toFixed(4)} SOL | {balances.usdc.toFixed(2)} USDC
              </span>
            </div>
          )}
          {canCreateMore && (
            <button
              onClick={() => {
                clearMessages();
                if (!hasVisa) setCreateType('visa');
                else setCreateType('mastercard');
                setCardholderNameInput(user?.username?.toUpperCase() || '');
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Card
            </button>
          )}
        </div>
      </motion.div>

      {!isMainnet && cards.length === 0 && (
        <motion.div variants={item} className="mb-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 text-sm font-medium">Mainnet Required</p>
              <p className="text-amber-700 text-xs mt-1">
                Card creation is only available on Mainnet. Switch to Mainnet in Settings to create virtual cards with your real wallet balance.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="aspect-[1.586/1] rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </motion.div>
      ) : cards.length === 0 ? (
        <motion.div variants={item} className="rounded-2xl bg-white border border-gray-200 overflow-hidden mb-8">
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
            <div className="relative mb-6 w-56 sm:w-64">
              <motion.div
                initial={{ rotate: -6, opacity: 0 }}
                animate={{ rotate: -6, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <CardPreviewSVG cardType="visa" selected={false} />
              </motion.div>
              <motion.div
                initial={{ rotate: 4, opacity: 0, x: 20 }}
                animate={{ rotate: 4, opacity: 0.7, x: 20 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute top-4 left-8"
              >
                <CardPreviewSVG cardType="mastercard" selected={false} />
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No cards yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              {isMainnet
                ? 'Create your first virtual debit card. You can have up to 1 Visa and 1 Mastercard.'
                : 'Switch to Mainnet in Settings to create virtual debit cards linked to your real wallet balance.'}
            </p>
            {isMainnet && (
              <button
                onClick={() => {
                  clearMessages();
                  setCreateType('visa');
                  setCardholderNameInput(user?.username?.toUpperCase() || '');
                  setShowCreateModal(true);
                }}
                className="px-6 py-3 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Card
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {cards.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              actionLoading={actionLoading === card.id}
              showDeleteConfirm={showDeleteConfirm === card.id}
              balances={balances}
              token={token}
              onFreeze={() => handleFreeze(card.id)}
              onDelete={() => setShowDeleteConfirm(card.id)}
              onConfirmDelete={() => handleDelete(card.id)}
              onCancelDeleteConfirm={() => setShowDeleteConfirm(null)}
              onCancelDeletion={() => handleCancelDeletion(card.id)}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <CreateCardModal
            createType={createType}
            setCreateType={setCreateType}
            hasVisa={hasVisa}
            hasMastercard={hasMastercard}
            creating={creating}
            isMainnet={isMainnet}
            cardholderName={cardholderNameInput}
            setCardholderName={setCardholderNameInput}
            onClose={() => { setShowCreateModal(false); setCardholderNameInput(''); }}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function CardComponent({
  card,
  actionLoading,
  showDeleteConfirm,
  balances,
  token,
  onFreeze,
  onDelete,
  onConfirmDelete,
  onCancelDeleteConfirm,
  onCancelDeletion,
}: {
  card: Card;
  actionLoading: boolean;
  showDeleteConfirm: boolean;
  balances: WalletBalances;
  token: string | null;
  onFreeze: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDeleteConfirm: () => void;
  onCancelDeletion: () => void;
}) {
  const isFrozen = card.status === 'frozen';
  const isPendingDeletion = card.status === 'pending_deletion';
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState<CardDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleToggleDetails = async () => {
    if (showDetails) {
      setShowDetails(false);
      setDetails(null);
      return;
    }

    if (isFrozen) return;

    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/cards/${card.id}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to get card details:', data.error);
        return;
      }
      const data = await res.json();
      setDetails(data);
      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching card details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="relative">
      <AnimatedCardSVG
        cardType={card.card_type}
        last4={card.card_number_last4}
        cardholderName={card.cardholder_name}
        expiryMonth={card.expiry_month}
        expiryYear={card.expiry_year}
        isFrozen={isFrozen}
        isPendingDeletion={isPendingDeletion}
        showDetails={showDetails}
        details={details}
        balances={balances}
      />

      {isPendingDeletion && card.deletion_requested_at && (
        <div className="mt-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
          <span className="text-red-700 text-xs">
            {formatCountdown(card.deletion_requested_at)}
          </span>
          <span className="text-red-500 text-[10px]">
            Deletes {getDeletionDate(card.deletion_requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {isPendingDeletion ? (
          <button
            onClick={onCancelDeletion}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Undo2 className="w-4 h-4" />
            )}
            Cancel Deletion
          </button>
        ) : (
          <>
            <button
              onClick={handleToggleDetails}
              disabled={detailsLoading || isFrozen}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                showDetails
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {detailsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : showDetails ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showDetails ? 'Hide' : 'View'}
            </button>
            <button
              onClick={onFreeze}
              disabled={actionLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                isFrozen
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Snowflake className="w-4 h-4" />
              )}
              {isFrozen ? 'Unfreeze' : 'Freeze'}
            </button>
            <button
              onClick={onDelete}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onCancelDeleteConfirm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Card</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                This card will be scheduled for permanent deletion in <strong>7 days</strong>.
                You can cancel the deletion at any time before then.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onCancelDeleteConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Card
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateCardModal({
  createType,
  setCreateType,
  hasVisa,
  hasMastercard,
  creating,
  isMainnet,
  cardholderName,
  setCardholderName,
  onClose,
  onCreate,
}: {
  createType: 'visa' | 'mastercard';
  setCreateType: (t: 'visa' | 'mastercard') => void;
  hasVisa: boolean;
  hasMastercard: boolean;
  creating: boolean;
  isMainnet: boolean;
  cardholderName: string;
  setCardholderName: (n: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Create New Card</h3>
          <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isMainnet && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-5">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 text-sm font-medium">Mainnet Required</p>
              <p className="text-amber-700 text-xs mt-1">
                Switch to Mainnet in Settings to create cards.
              </p>
            </div>
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4">
          Choose your card type. You can create up to 1 Visa and 1 Mastercard.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => !hasVisa && setCreateType('visa')}
            disabled={hasVisa || !isMainnet}
            className={`relative rounded-xl p-3 border-2 transition-all ${
              hasVisa || !isMainnet
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                : createType === 'visa'
                  ? 'border-[#1A1F71] bg-[#1A1F71]/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <CardPreviewSVG cardType="visa" selected={createType === 'visa' && !hasVisa} />
            <span className="text-sm font-medium text-gray-800 mt-2 block">Visa</span>
            {hasVisa && (
              <span className="block text-[10px] text-gray-400 mt-0.5">Already created</span>
            )}
          </button>

          <button
            onClick={() => !hasMastercard && setCreateType('mastercard')}
            disabled={hasMastercard || !isMainnet}
            className={`relative rounded-xl p-3 border-2 transition-all ${
              hasMastercard || !isMainnet
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                : createType === 'mastercard'
                  ? 'border-[#EB001B] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <CardPreviewSVG cardType="mastercard" selected={createType === 'mastercard' && !hasMastercard} />
            <span className="text-sm font-medium text-gray-800 mt-2 block">Mastercard</span>
            {hasMastercard && (
              <span className="block text-[10px] text-gray-400 mt-0.5">Already created</span>
            )}
          </button>
        </div>

        {isMainnet && (
          <div className="mb-5">
            <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Cardholder Name
            </label>
            <input
              id="cardholderName"
              type="text"
              value={cardholderName}
              onChange={e => setCardholderName(e.target.value.replace(/[^a-zA-Z\s]/g, '').substring(0, 50))}
              placeholder="Enter cardholder name"
              maxLength={50}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9945FF]/30 focus:border-[#9945FF] transition-colors uppercase"
            />
            <p className="text-xs text-gray-400 mt-1">Letters only. Will appear on your card.</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={creating || !isMainnet}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Card
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
