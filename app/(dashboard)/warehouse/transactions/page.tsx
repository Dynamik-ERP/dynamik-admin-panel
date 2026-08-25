'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useMaterialTransactions } from '@/lib/api/warehouse';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';

const TYPE_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  inquisition: { label: 'Inquisition', variant: 'success' },
  receipt: { label: 'Receipt', variant: 'success' },
  adjustment: { label: 'Adjustment', variant: 'info' },
  withdrawal: { label: 'Withdrawal', variant: 'warning' },
};

export default function MaterialTransactionsPage() {
  useAuthGuard(['admin']);
  const [page] = useState(1);
  const { data: transactionsData, isLoading, isError, error, refetch } = useMaterialTransactions(page);

  const transactions = Array.isArray(transactionsData) ? transactionsData : [];

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Material Transactions</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Audit ledger for all material movements</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCcw className={cn("w-3 h-3 mr-2", isLoading && "animate-spin")} />
              {isLoading ? "Syncing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
            <p className="mt-2 text-sm text-gray-500">Loading transactions...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400 font-medium">Failed to load transactions</p>
            <p className="text-xs text-red-500 mt-1">{(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No transactions found</p>
          </div>
        ) : (
          <DataTable headers={['Item', 'Type', 'Quantity', 'Design ID', 'Actor', 'Date']}>
            {transactions.map((transaction: any) => {
              const itemName = transaction.item?.name || transaction.itemName || transaction.item_id || transaction.itemId || 'Item';
              const type = transaction.type || 'adjustment';
              const designId = transaction.design_id || transaction.designId;
              const actorName = transaction.actor?.full_name || transaction.actorId || transaction.actor_id || 'System';
              const occurredDate = transaction.occurred_at || transaction.occurredAt || transaction.created_at;

              return (
                <tr key={transaction.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                  <td className="p-3">
                    <div className="font-sans text-white text-xs">{itemName}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant={TYPE_CONFIG[type]?.variant || 'default'}>
                      {TYPE_CONFIG[type]?.label || type}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-xs text-white">{transaction.quantity}</td>
                  <td className="p-3">
                    {type === 'withdrawal' ? (
                      designId ? (
                        <span className="text-[#FF6B00] font-mono text-xs">{designId.slice(0, 8)}...</span>
                      ) : (
                        <span className="text-red-400 text-xs">Missing</span>
                      )
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{actorName}</td>
                  <td className="p-3 text-gray-500 text-xs">
                    {occurredDate ? new Date(occurredDate).toLocaleString() : '—'}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </div>
    </div>
  );
}
