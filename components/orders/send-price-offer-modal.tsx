import { useState } from 'react';
import { useSendPriceOffer } from '@/lib/api/orders';
import { Modal } from '@/components/shared/modal';

interface SendPriceOfferModalProps {
  orderId: string;
  onClose: () => void;
}

export function SendPriceOfferModal({ orderId, onClose }: SendPriceOfferModalProps) {
  const send = useSendPriceOffer();
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    send.mutate({ orderId, amount: Number(amount) }, {
      onSuccess: () => {
        onClose();
        setAmount('');
      },
    });
  };

  return (
    <Modal isOpen title="Send Price Offer" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (ETB)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={send.isPending || !amount}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {send.isPending ? 'Sending...' : 'Send offer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}