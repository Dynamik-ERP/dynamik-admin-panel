'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useProcurementRequests, useApproveProcurementRequest } from '@/lib/api/warehouse';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/shared/toast';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  declined: { label: 'Declined', variant: 'error' },
  rejected: { label: 'Rejected', variant: 'error' },
};

export default function ProcurementRequestsPage() {
  useAuthGuard(['admin']);
  const { data: requests = [], isLoading, refetch } = useProcurementRequests();
  const approveMutation = useApproveProcurementRequest();
  const { showToast } = useToast();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => showToast('success', 'Procurement request approved'),
      onError: () => showToast('error', 'Failed to approve procurement request'),
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Procurement Requests</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Review and approve material procurement requests</p>
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
            <p className="mt-2 text-sm text-gray-500">Loading procurement requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No procurement requests found</p>
          </div>
        ) : (
          <DataTable headers={['ID / Request', 'Requested By', 'Created', 'Status', 'Actions']}>
            {requests.map((request: any) => (
              <tr key={request.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                <td className="p-3">
                  <span className="font-mono text-xs text-[#FF6B00]">{request.id?.slice(0, 8) || '—'}...</span>
                  {request.materialName && (
                    <div className="text-xs text-gray-500">{request.materialName} ({request.quantity} {request.unit})</div>
                  )}
                  {request.items && Array.isArray(request.items) && (
                    <div className="text-xs text-gray-500">
                      {request.items.map((it: any) => `${it.itemName || it.item_name || it.itemId || 'Item'} × ${it.quantity}`).join(', ')}
                    </div>
                  )}
                </td>
                <td className="p-3 text-gray-400 text-xs">{request.requestedByUser?.full_name || request.requestedBy || '—'}</td>
                <td className="p-3 text-gray-500 text-xs">{request.createdAt || request.created_at ? new Date(request.createdAt || request.created_at).toLocaleDateString() : '—'}</td>
                <td className="p-3">
                  <Badge variant={STATUS_CONFIG[request.status]?.variant || 'default'}>
                    {STATUS_CONFIG[request.status]?.label || request.status}
                  </Badge>
                </td>
                <td className="p-3">
                  {request.status === 'pending' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}