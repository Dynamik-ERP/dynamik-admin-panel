'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useBom, useApproveBom } from '@/lib/api/production';
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

export default function BomPage() {
  useAuthGuard(['admin']);
  const { data: bomData, isLoading, isError, error, refetch } = useBom();
  const approveMutation = useApproveBom();
  const { showToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const bomItems = Array.isArray(bomData) ? bomData : [];

  const handleApprove = (bomId: string) => {
    confirm(
      {
        title: 'Approve Bill of Materials',
        message: 'Are you sure you want to approve this BOM? This action cannot be undone.',
        confirmText: 'Approve',
        cancelText: 'Cancel',
      },
      () => {
        approveMutation.mutate(bomId, {
          onSuccess: () => showToast('success', 'BOM approved successfully'),
          onError: () => showToast('error', 'Failed to approve BOM. Please try again.'),
        });
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Bill of Materials</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Review and approve bills of materials for production</p>
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
            <p className="mt-2 text-sm text-gray-500">Loading BOMs...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400 font-medium">Failed to load bills of materials</p>
            <p className="text-xs text-red-500 mt-1">{(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : bomItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No bills of materials found</p>
          </div>
        ) : (
          <DataTable headers={['Order', 'Status', 'Warehouse Approval', 'Actions']}>
            {bomItems.map((bom: any) => {
              const orderId = bom.order_id || bom.orderId || bom.id;
              const status = bom.status || 'pending';
              const isWarehouseApproved = Boolean(bom.warehouse_approved || bom.warehouseApproved);

              return (
                <tr key={bom.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                  <td className="p-3 text-[#FF6B00] font-semibold font-mono text-xs">
                    {orderId ? orderId.slice(0, 8).toUpperCase() : '—'}...
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_CONFIG[status]?.variant || 'default'}>
                      {STATUS_CONFIG[status]?.label || status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {isWarehouseApproved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    {status === 'pending' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(bom.id)}
                      >
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </div>
      <ConfirmDialogComponent />
    </div>
  );
}