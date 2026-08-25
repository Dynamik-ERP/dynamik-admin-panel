import type { PriceOffer } from '@/lib/types/domain';
import { useSendPriceOffer } from '@/lib/api/orders';
import { useState } from 'react';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';

const STATUS_LABEL: Record<PriceOffer['status'], string> = {
  pending: 'Awaiting client response',
  approved: 'Approved',
  revision_requested: 'Client requested revision',
};

const STATUS_VARIANT: Record<PriceOffer['status'], 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  revision_requested: 'error',
};

const getStatusLabel = (status: PriceOffer['status']) => STATUS_LABEL[status] ?? status;
const getStatusVariant = (status: PriceOffer['status']) => STATUS_VARIANT[status] ?? 'default';

export function PriceOfferCard({ history, orderId }: { history: PriceOffer[]; orderId: string }) {
  const latest = history.at(-1);
  const send = useSendPriceOffer();
  const [amount, setAmount] = useState('');

  return (
    <Card variant="bordered" className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Price</h3>
      {latest ? (
        <>
          <div className="text-2xl font-bold text-gray-900">${latest.amount.toLocaleString()}</div>
          <Badge variant={getStatusVariant(latest.status)} className="mt-2">
            {getStatusLabel(latest.status)}
          </Badge>
        </>
      ) : (
        <div className="text-gray-400">No offer sent yet</div>
      )}

      {(!latest || latest.status === 'revision_requested') && (
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => send.mutate({ orderId, amount: Number(amount) })}
            disabled={send.isPending || !amount}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {send.isPending ? 'Sending...' : 'Send offer'}
          </button>
        </div>
      )}

      {history.length > 1 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 mb-2">History</p>
          <div className="space-y-2">
            {history.slice(0, -1).map((offer) => (
              <div key={offer.id} className="text-sm text-gray-600">
                ${offer.amount.toLocaleString()} - {getStatusLabel(offer.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
