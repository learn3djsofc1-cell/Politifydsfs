import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Plus, Snowflake, Trash2, Undo2,
  AlertCircle, Loader2, X, CheckCircle2
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

export const CardsPage = () => {
  const { token } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [createType, setCreateType] = useState<'visa' | 'mastercard'>('visa');
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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
        body: JSON.stringify({ cardType: createType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create card');
        return;
      }
      setSuccess(`${createType === 'visa' ? 'Visa' : 'Mastercard'} card created successfully`);
      setShowCreateModal(false);
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 max-w-[1200px] w-full mx-auto overflow-x-hidden"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Cards</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your virtual debit cards</p>
        </div>
        {canCreateMore && (
          <button
            onClick={() => {
              clearMessages();
              if (!hasVisa) setCreateType('visa');
              else setCreateType('mastercard');
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Card
          </button>
        )}
      </motion.div>

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
            <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </motion.div>
      ) : cards.length === 0 ? (
        <motion.div variants={item} className="rounded-2xl bg-white border border-gray-200 overflow-hidden mb-8">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="relative mb-6">
              <div className="w-48 h-28 rounded-xl bg-gradient-to-br from-[#1A1F71] to-[#2D3494] border border-blue-900/20 p-4 flex flex-col justify-between transform -rotate-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-6 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-80" />
                  <span className="text-[10px] text-white/60 font-bold tracking-wider">VISA</span>
                </div>
                <div className="text-[10px] text-white/50 font-mono tracking-widest">
                  •••• •••• •••• ••••
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-[#9945FF]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#9945FF]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No cards yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              Create your first virtual debit card. You can have up to 1 Visa and 1 Mastercard.
            </p>
            <button
              onClick={() => {
                clearMessages();
                setCreateType('visa');
                setShowCreateModal(true);
              }}
              className="px-6 py-3 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Card
            </button>
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
            onClose={() => setShowCreateModal(false)}
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
  onFreeze,
  onDelete,
  onConfirmDelete,
  onCancelDeleteConfirm,
  onCancelDeletion,
}: {
  card: Card;
  actionLoading: boolean;
  showDeleteConfirm: boolean;
  onFreeze: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDeleteConfirm: () => void;
  onCancelDeletion: () => void;
}) {
  const isVisa = card.card_type === 'visa';
  const isFrozen = card.status === 'frozen';
  const isPendingDeletion = card.status === 'pending_deletion';

  const gradientClass = isVisa
    ? 'from-[#1A1F71] to-[#2D3494]'
    : 'from-[#EB001B] to-[#F79E1B]';

  const brandLabel = isVisa ? 'VISA' : 'MASTERCARD';

  return (
    <div className="relative">
      <div className={`relative rounded-2xl overflow-hidden shadow-lg ${
        isPendingDeletion ? 'opacity-60' : isFrozen ? 'opacity-75' : ''
      }`}>
        <div className={`bg-gradient-to-br ${gradientClass} p-6 h-52 flex flex-col justify-between relative`}>
          {isFrozen && (
            <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <Snowflake className="w-5 h-5 text-blue-200" />
                <span className="text-white font-medium text-sm">Card Frozen</span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between relative z-0">
            <div className="flex items-center gap-2">
              {isVisa ? (
                <div className="w-8 h-6 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-80" />
              ) : (
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 opacity-80" />
                  <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-60" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 font-bold text-xs tracking-wider">{brandLabel}</span>
              {isPendingDeletion && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/30 text-red-200 uppercase">
                  Deleting
                </span>
              )}
            </div>
          </div>

          <div className="relative z-0">
            <div className="text-white/70 font-mono text-lg tracking-[0.2em] mb-3">
              •••• •••• •••• {card.card_number_last4}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Card Holder</div>
                <div className="text-white/80 text-sm font-medium tracking-wide">{card.cardholder_name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Expires</div>
                <div className="text-white/80 text-sm font-mono">
                  {formatExpiry(card.expiry_month, card.expiry_year)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              Delete
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
  onClose,
  onCreate,
}: {
  createType: 'visa' | 'mastercard';
  setCreateType: (t: 'visa' | 'mastercard') => void;
  hasVisa: boolean;
  hasMastercard: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Card</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-5">
          Choose your card type. You can create up to 1 Visa and 1 Mastercard.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => !hasVisa && setCreateType('visa')}
            disabled={hasVisa}
            className={`relative rounded-xl p-4 border-2 transition-all ${
              hasVisa
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                : createType === 'visa'
                  ? 'border-[#1A1F71] bg-[#1A1F71]/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="w-full h-16 rounded-lg bg-gradient-to-br from-[#1A1F71] to-[#2D3494] mb-3 flex items-center justify-between px-3">
              <div className="w-6 h-4 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-80" />
              <span className="text-white/70 font-bold text-[10px] tracking-wider">VISA</span>
            </div>
            <span className="text-sm font-medium text-gray-800">Visa</span>
            {hasVisa && (
              <span className="block text-[10px] text-gray-400 mt-0.5">Already created</span>
            )}
          </button>

          <button
            onClick={() => !hasMastercard && setCreateType('mastercard')}
            disabled={hasMastercard}
            className={`relative rounded-xl p-4 border-2 transition-all ${
              hasMastercard
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                : createType === 'mastercard'
                  ? 'border-[#EB001B] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="w-full h-16 rounded-lg bg-gradient-to-br from-[#EB001B] to-[#F79E1B] mb-3 flex items-center justify-between px-3">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-red-500 opacity-80" />
                <div className="w-5 h-5 rounded-full bg-yellow-500 opacity-60" />
              </div>
              <span className="text-white/70 font-bold text-[10px] tracking-wider">MC</span>
            </div>
            <span className="text-sm font-medium text-gray-800">Mastercard</span>
            {hasMastercard && (
              <span className="block text-[10px] text-gray-400 mt-0.5">Already created</span>
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={creating || (createType === 'visa' && hasVisa) || (createType === 'mastercard' && hasMastercard)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#9945FF] text-white text-sm font-medium hover:bg-[#8030E0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
