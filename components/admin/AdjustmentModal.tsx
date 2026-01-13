'use client';

import { useState } from 'react';

interface AdjustmentModalProps {
  sku: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustmentModal({ sku, onClose, onSuccess }: AdjustmentModalProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Reason is required for adjustments');
      return;
    }

    if (quantity === 0) {
      setError('Adjustment quantity cannot be zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          quantity,
          reason,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust inventory');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#EAEAEA] border border-[#E1E1E1] rounded-[16px] shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-[#E1E1E1]">
          <div className="flex justify-between items-center">
            <h2 className="font-['DM_Sans'] text-[24px] font-light tracking-[-0.96px] text-[#161616]">Adjust Inventory</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mt-2">SKU: {sku}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#E1E1E1] border border-red-200 text-red-800 rounded-[12px] text-sm font-['Outfit']">
              {error}
            </div>
          )}

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              Adjustment Quantity *
            </label>
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              placeholder="Positive to add, negative to subtract"
              required
            />
            <p className="font-['Outfit'] text-[12px] text-[#535353] mt-2">
              Enter a positive number to add stock or negative to reduce stock
            </p>
          </div>

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616] yw-select"
              required
            >
              <option value="">Select a reason</option>
              <option value="damaged">Damaged goods</option>
              <option value="lost">Lost items</option>
              <option value="found">Found items</option>
              <option value="correction">Inventory count correction</option>
              <option value="theft">Theft/shrinkage</option>
              <option value="return">Customer return</option>
              <option value="sample">Used as sample</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              placeholder="Additional details about this adjustment..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[48px] px-4 border border-[#E1E1E1] text-[#161616] bg-[#EAEAEA] rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#E1E1E1] transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-[48px] px-4 bg-[#161616] text-white rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adjusting...' : 'Adjust Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
