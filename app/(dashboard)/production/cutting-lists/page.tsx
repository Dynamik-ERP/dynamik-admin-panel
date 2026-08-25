'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useCuttingLists, useApproveCuttingList, useDeclineCuttingList } from '@/lib/api/production';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/shared/toast';
import { useConfirmDialog } from '@/components/shared/confirm-dialog';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  declined: { label: 'Declined', variant: 'error' },
};

export default function CuttingListsPage() {
  useAuthGuard(['admin']);
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data: cuttingListsData, isLoading, isError, error, refetch } = useCuttingLists(page, limit);
  const [declineReasons, setDeclineReasons] = useState<Record<string, string>>({});
  const approveMutation = useApproveCuttingList();
  const declineMutation = useDeclineCuttingList();
  const { showToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const cuttingLists = Array.isArray(cuttingListsData) ? cuttingListsData : [];

  const handleApprove = (cuttingListId: string) => {
    confirm(
      {
        title: 'Approve Cutting List',
        message: 'Are you sure you want to approve this cutting list? This action cannot be undone.',
        confirmText: 'Approve',
        cancelText: 'Cancel',
      },
      () => {
        approveMutation.mutate(cuttingListId, {
          onSuccess: () => showToast('success', 'Cutting list approved successfully'),
          onError: () => showToast('error', 'Failed to approve cutting list. Please try again.'),
        });
      }
    );
  };

  const handleDecline = (cuttingListId: string) => {
    const reason = declineReasons[cuttingListId];
    if (!reason) return;
    
    confirm(
      {
        title: 'Decline Cutting List',
        message: 'Are you sure you want to decline this cutting list? This action cannot be undone.',
        confirmText: 'Decline',
        cancelText: 'Cancel',
      },
      () => {
        declineMutation.mutate({ id: cuttingListId, reason }, {
          onSuccess: () => showToast('success', 'Cutting list declined successfully'),
          onError: () => showToast('error', 'Failed to decline cutting list. Please try again.'),
        });
        setDeclineReasons((prev) => {
          const updated = { ...prev };
          delete updated[cuttingListId];
          return updated;
        });
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Cutting Lists</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Review and approve cutting lists for production</p>
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
            <p className="mt-2 text-sm text-gray-500">Loading cutting lists...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400 font-medium">Failed to load cutting lists</p>
            <p className="text-xs text-red-500 mt-1">{(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : cuttingLists.length === 0 && page === 1 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No cutting lists found</p>
          </div>
        ) : (
          <>
            <DataTable headers={['Order', 'Created By', 'Created', 'Status', 'Actions']}>
              {cuttingLists.map((cl: any) => {
                const orderId = cl.order_id || cl.orderId || cl.id;
                const createdBy = cl.createdByUser?.full_name || cl.created_by || cl.createdBy || 'System';
                const createdDate = cl.created_at || cl.createdAt;
                const status = cl.status || 'pending';

                return (
                  <tr key={cl.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                    <td className="p-3 text-[#FF6B00] font-semibold font-mono text-xs">
                      {orderId ? orderId.slice(0, 8).toUpperCase() : '—'}...
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{createdBy}</td>
                    <td className="p-3 text-gray-500 text-xs">
                      {createdDate ? new Date(createdDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3">
                      <Badge variant={STATUS_CONFIG[status]?.variant || 'default'}>
                        {STATUS_CONFIG[status]?.label || status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {status === 'pending' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(cl.id)}
                          >
                            Approve
                          </Button>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Decline reason"
                            value={declineReasons[cl.id] || ''}
                            onChange={(e) => setDeclineReasons((prev) => ({ ...prev, [cl.id]: e.target.value }))}
                            className="px-2 py-1 text-xs border border-[#2B3143] rounded bg-[#0E1016] text-white focus:outline-none focus:border-[#FF6B00]"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDecline(cl.id)}
                            disabled={!declineReasons[cl.id]}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </DataTable>

            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500 font-mono">Page {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={cuttingLists.length < limit || isLoading}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
      <ConfirmDialogComponent />
    </div>
  );
}