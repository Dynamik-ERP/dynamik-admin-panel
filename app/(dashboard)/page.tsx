'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useOrders } from '@/lib/api/orders';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch } from '@/lib/api/client';

export default function DashboardPage() {
  useAuthGuard(['admin']);

  const [activeTab, setActiveTab] = useState('Orders Queue');
  const [activeSubTab, setActiveSubTab] = useState('Orders');
  const [error, setError] = useState<string | null>(null);
  const [designers] = useState<{ id: string; full_name: string }[]>([]);
  const [orderActions, setOrderActions] = useState<Record<string, { designer_id?: string }>>({});
  const [actionStatus, setActionStatus] = useState<Record<string, string | null>>({});

  const { data: ordersData = [], isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const orders = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.data || [];

  const setOrderActionValue = (orderId: string, key: 'designer_id', value: string) => {
    setOrderActions((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [key]: value,
      },
    }));
  };

  const runOrderAction = async (orderId: string, label: string, action: () => Promise<void>) => {
    setError(null);
    setActionStatus((prev) => ({ ...prev, [orderId]: label }));
    try {
      await action();
      await refetchOrders();
    } catch (err: any) {
      setError(err?.message || `${label} failed`);
    } finally {
      setActionStatus((prev) => ({ ...prev, [orderId]: null }));
    }
  };

  const handleAssignDesigner = (order: any) => {
    const designerId = orderActions[order.id]?.designer_id;
    if (!designerId) {
      setError('Select a designer before assigning the client');
      return;
    }
    const clientId = order.client?.id || order.clientId || order.id;
    runOrderAction(order.id, 'Assigning designer', async () => {
      await apiFetch(`/clients/${clientId}/assign-designer`, {
        method: 'POST',
        body: JSON.stringify({ designer_id: designerId }),
      });
    });
  };

  const handleRouteDesign = (order: any) => {
    runOrderAction(order.id, 'Routing design', async () => {
      await apiFetch(`/orders/${order.id}/route-design`, {
        method: 'POST',
      });
      await refetchOrders();
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/40 text-red-300 text-xs font-mono rounded">
          Error: {error}
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="px-6 border-b border-[#1F2330] bg-[#0E1016] -mx-6">
        <div className="flex gap-4 font-mono text-xs">
          {['Orders Queue', 'Designs', 'Access Codes', 'Department Overview', 'Procurement Requests'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="py-3 font-medium border-b-2 transition-all px-1 -mb-[2px]"
              style={{
                borderBottomColor: activeTab === tab ? '#FF6B00' : 'transparent',
                color: activeTab === tab ? 'white' : '#6B7280',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Orders Queue' && (
        <div className="space-y-4">
          {/* SUB-TABS */}
          <div className="border-b border-[#1F2330] bg-[#0E1016] -mx-6 px-6">
            <div className="flex gap-4 font-mono text-xs">
              {['Orders', 'Chat'].map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => setActiveSubTab(subTab)}
                  className="py-3 font-medium border-b-2 transition-all px-1 -mb-[2px]"
                  style={{
                    borderBottomColor: activeSubTab === subTab ? '#FF6B00' : 'transparent',
                    color: activeSubTab === subTab ? 'white' : '#6B7280',
                  }}
                >
                  {subTab}
                </button>
              ))}
            </div>
          </div>

          {activeSubTab === 'Orders' && (
            <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Incoming Client Orders</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Manage and assign orders to designers</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => refetchOrders()}
                    disabled={ordersLoading}
                  >
                    <RefreshCcw className={cn("w-3 h-3 mr-2", ordersLoading && "animate-spin")} />
                    {ordersLoading ? "Syncing..." : "Refresh"}
                  </Button>
                </div>
              </div>

              <DataTable headers={['Order ID', 'Client', 'Status', 'Handled By', 'Created At', 'Actions']}>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-xs text-gray-500 font-mono">
                      {ordersLoading ? "Loading orders from backend..." : "No orders found in database."}
                    </td>
                  </tr>
                ) : (
                  orders.map((row: any) => (
                    <tr key={row.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                      <td className="p-3 text-[#FF6B00] font-semibold font-mono text-xs">{row.id?.substring(0, 8).toUpperCase()}...</td>
                      <td className="p-3 font-sans text-white">{row.client?.fullName || row.clientName || "Unknown"}</td>
                      <td className="p-3">
                        <Badge variant={row.status === 'ready_for_production' ? 'success' : row.status === 'in_progress' ? 'warning' : 'default'}>
                          {row.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-400 font-sans text-xs">{row.assignedDesigner || row.handledByDesignerId || "Not Assigned"}</td>
                      <td className="p-3 text-gray-500 text-xs">{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'N/A'}</td>
                      <td className="p-3">
                        <div className="min-w-[360px] space-y-2">
                          <div className="flex gap-2">
                            <select
                              value={orderActions[row.id]?.designer_id || row.handledByDesignerId || ''}
                              onChange={(event) => setOrderActionValue(row.id, 'designer_id', event.target.value)}
                              className="flex-1 bg-[#0E1016] border border-[#2B3143] rounded px-2 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                            >
                              <option value="">Select designer...</option>
                              {designers.map((designer) => (
                                <option key={designer.id} value={designer.id}>{designer.full_name}</option>
                              ))}
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionStatus[row.id] != null}
                              onClick={() => handleAssignDesigner(row)}
                            >
                              Assign
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={!(row.handledByDesignerId || orderActions[row.id]?.designer_id) || actionStatus[row.id] != null}
                              onClick={() => handleRouteDesign(row)}
                            >
                              Route
                            </Button>
                          </div>
                          {actionStatus[row.id] && (
                            <p className="text-[10px] text-[#FF6B00] font-mono">{actionStatus[row.id]}...</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </div>
          )}

          {activeSubTab === 'Chat' && (
            <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Client-Designer Chat</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Monitor and participate in design consultations</p>
                </div>
              </div>
              <div className="text-center py-12 text-gray-500 text-sm">
                Chat functionality coming soon
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Designs' && (
        <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
          <div className="text-center py-12 text-gray-500 text-sm">
            Designs tab coming soon
          </div>
        </div>
      )}

      {activeTab === 'Access Codes' && (
        <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
          <div className="text-center py-12 text-gray-500 text-sm">
            Access Codes tab coming soon
          </div>
        </div>
      )}

      {activeTab === 'Department Overview' && (
        <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
          <div className="text-center py-12 text-gray-500 text-sm">
            Department Overview coming soon
          </div>
        </div>
      )}

      {activeTab === 'Procurement Requests' && (
        <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
          <div className="text-center py-12 text-gray-500 text-sm">
            Procurement Requests coming soon
          </div>
        </div>
      )}
    </div>
  );
}