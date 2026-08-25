'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useSchedules } from '@/lib/api/production';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';

export default function SchedulePage() {
  useAuthGuard(['admin']);
  const { data: schedulesData, isLoading, isError, error, refetch } = useSchedules();

  const schedules = Array.isArray(schedulesData) ? schedulesData : [];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Production Schedule</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Master timeline for all production schedules</p>
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
            <p className="mt-2 text-sm text-gray-500">Loading schedules...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400 font-medium">Failed to load schedules</p>
            <p className="text-xs text-red-500 mt-1">{(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No production schedules found</p>
          </div>
        ) : (
          <DataTable headers={['Order', 'Delivery Date', 'Production Start', 'Production End', 'Coordinator / Status']}>
            {schedules.map((schedule: any) => {
              const orderId = schedule.order_id || schedule.orderId || schedule.id;
              const deliveryDate = schedule.delivery_date || schedule.deliveryDate;
              const productionStart = schedule.production_start || schedule.productionStart;
              const productionEnd = schedule.production_end || schedule.productionEnd;
              const coordinator = schedule.coordinator?.full_name || schedule.coordinatorId || schedule.coordinator_id || schedule.status || '—';

              return (
                <tr key={schedule.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                  <td className="p-3 text-[#FF6B00] font-semibold font-mono text-xs">
                    {orderId ? orderId.slice(0, 8).toUpperCase() : '—'}...
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{formatDate(deliveryDate)}</td>
                  <td className="p-3 text-gray-400 text-xs">{formatDate(productionStart)}</td>
                  <td className="p-3 text-gray-400 text-xs">{formatDate(productionEnd)}</td>
                  <td className="p-3 text-gray-400 text-xs">{coordinator}</td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </div>
    </div>
  );
}