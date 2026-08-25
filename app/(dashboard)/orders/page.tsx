'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useOrders } from '@/lib/api/orders';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import cn from 'clsx';
import type { OrderStatus } from '@/lib/types/domain';

const STATUS_OPTIONS: { value: OrderStatus | undefined; label: string }[] = [
  { value: undefined, label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready_for_production', label: 'Ready for Production' },
  { value: 'in_production', label: 'In Production' },
  { value: 'completed', label: 'Completed' },
];

export default function OrdersQueuePage() {
  useAuthGuard(['admin']);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: orders = [], isLoading, refetch } = useOrders(statusFilter);

  const getClientName = (order: any) => {
    return order.client?.full_name || order.client?.fullName || order.clientName || '—';
  };

  const getClientPhone = (order: any) => {
    return order.client?.phone || '—';
  };

  const getCreatedAt = (order: any) => {
    return order.created_at || order.createdAt || '';
  };

  const ordersList = Array.isArray(orders) ? orders : (orders as any)?.data || [];
  const filteredOrders = ordersList.filter((order: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName = getClientName(order).toLowerCase();
    const clientPhone = getClientPhone(order);
    const orderId = (order.id || '').toLowerCase();
    return clientName.includes(query) || clientPhone.includes(query) || orderId.includes(query);
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const priority: Record<string, number> = {
      draft: 0,
      in_progress: 1,
      ready_for_production: 2,
      in_production: 3,
      completed: 4,
    };
    const diff = (priority[a.status] ?? 99) - (priority[b.status] ?? 99);
    if (diff !== 0) return diff;
    const dateA = getCreatedAt(a);
    const dateB = getCreatedAt(b);
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Orders</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Manage and track all client orders</p>
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

        {/* Filters */}
        <div className="mb-6 p-4 bg-[#0E1016] border border-[#1F2330] rounded">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by client name, phone, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-[#2B3143] rounded bg-[#0B0C0E] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | undefined)}
                className="w-full px-3 py-2 border border-[#2B3143] rounded bg-[#0B0C0E] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
            <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No orders found</p>
          </div>
        ) : (
          <DataTable headers={['Order ID', 'Client', 'Items', 'Status', 'Designer', 'Created']}>
            {sortedOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
              const itemsSummary = items
                .map((item: any) => item.item_type || item.itemType || item.productName || 'Item')
                .join(', ') || 'No items';
              const createdDate = getCreatedAt(order);

              return (
                <tr key={order.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                  <td className="p-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-[#FF6B00] hover:text-[#E05E00] font-semibold font-mono text-xs"
                    >
                      {order.id ? order.id.slice(0, 8).toUpperCase() : '—'}...
                    </Link>
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="font-sans text-white text-xs">{getClientName(order)}</div>
                      <div className="text-[11px] text-gray-500">{getClientPhone(order)}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-xs text-white">{itemsSummary}</div>
                    <div className="text-[11px] text-gray-500">
                      {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                    </div>
                  </td>
                  <td className="p-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {order.handledByDesigner?.full_name || order.handledByDesigner?.fullName || order.assignedDesigner || (order.handled_by_designer_id ? 'Assigned' : '—')}
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {createdDate ? new Date(createdDate).toLocaleDateString() : '—'}
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