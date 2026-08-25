'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useOrders } from '@/lib/api/orders';
import { RefreshCcw, ExternalLink, FileText } from 'lucide-react';
import cn from 'clsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { apiFetch } from '@/lib/api/client';
import { useToast } from '@/components/shared/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const EXT_COLORS: Record<string, string> = {
  pdf: '#EF4444',
  png: '#10B981',
  jpg: '#10B981',
  jpeg: '#10B981',
  dwg: '#38BDF8',
  dxf: '#8B5CF6',
};

function getFileExt(url: string): string {
  return url?.split('.')?.pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || '';
}

function getFileViewUrl(fileUrl: string): string {
  if (!fileUrl || fileUrl === 'No file attached') return '';
  if (fileUrl.startsWith('/uploads')) {
    return `${API_BASE}${fileUrl}`.replace(/\/api\/v1\/api\/v1/g, '/api/v1');
  }
  return fileUrl;
}

function DesignsPanel() {
  const { showToast } = useToast();
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>('/designs');
      setDesigns(Array.isArray(data) ? data : []);
    } catch {
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  const handleApprove = async (designId: string) => {
    try {
      await apiFetch(`/designs/${designId}/approve`, { method: 'POST' });
      showToast('success', 'Design approved');
      fetchDesigns();
    } catch {
      showToast('error', 'Failed to approve design');
    }
  };

  const handleRequestRevision = async (designId: string) => {
    try {
      await apiFetch(`/designs/${designId}/request-revision`, { method: 'POST' });
      showToast('success', 'Revision requested');
      fetchDesigns();
    } catch {
      showToast('error', 'Failed to request revision');
    }
  };

  return (
    <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white">Submitted Designs</h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">View and manage design files (DWG, DXF, PDF, PNG)</p>
        </div>
        <Button variant="outline" onClick={fetchDesigns} disabled={loading}>
          <RefreshCcw className={cn("w-3 h-3 mr-2", loading && "animate-spin")} />
          {loading ? 'Syncing...' : 'Refresh'}
        </Button>
      </div>

      <DataTable headers={['Design ID', 'Order', 'Designer', 'Status', 'File', 'Created', 'Actions']}>
        {loading ? (
          <tr><td colSpan={7} className="p-4 text-center text-xs text-gray-500 font-mono">Loading designs...</td></tr>
        ) : designs.length === 0 ? (
          <tr><td colSpan={7} className="p-4 text-center text-xs text-gray-500 font-mono">No designs submitted yet</td></tr>
        ) : (
          designs.map((design: any) => {
            const ext = getFileExt(design.file_url || '');
            const color = EXT_COLORS[ext] || '#6B7280';
            const viewUrl = getFileViewUrl(design.file_url || '');
            const hasFile = viewUrl && design.file_url !== 'No file attached';

            return (
              <tr key={design.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                <td className="p-3 text-white font-mono text-xs">{design.id?.substring(0, 8).toUpperCase()}...</td>
                <td className="p-3 text-gray-400 font-mono text-xs">
                  {design.order?.client?.full_name || design.order?.client?.fullName || design.order_id?.substring(0, 8) || '—'}
                </td>
                <td className="p-3 text-gray-400 text-xs">
                  {design.designer?.full_name || design.designer?.fullName || design.designer_id?.substring(0, 8) || '—'}
                </td>
                <td className="p-3">
                  <Badge variant={design.status === 'approved' ? 'success' : design.status === 'submitted' ? 'warning' : 'default'}>
                    {design.status?.toUpperCase()}
                  </Badge>
                </td>
                <td className="p-3">
                  {hasFile ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase"
                        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                      >
                        {ext}
                      </span>
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF6B00] hover:text-[#E05E00] text-xs font-mono underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs flex items-center gap-1"><FileText className="w-3 h-3" /> No file</span>
                  )}
                </td>
                <td className="p-3 text-gray-500 text-xs">{design.created_at ? new Date(design.created_at).toLocaleDateString() : '—'}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {design.status === 'submitted' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleApprove(design.id)}>
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRequestRevision(design.id)}>
                          Revision
                        </Button>
                      </>
                    )}
                    {design.status === 'approved' && <span className="text-green-500 text-xs font-mono">✓ Approved</span>}
                    {design.status === 'revision_requested' && <span className="text-yellow-500 text-xs font-mono">↻ Revision Pending</span>}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </DataTable>
    </div>
  );
}

export default function DashboardPage() {
  useAuthGuard(['admin']);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('Orders Queue');
  const [activeSubTab, setActiveSubTab] = useState('Orders');
  const [error, setError] = useState<string | null>(null);
  const [designers] = useState<{ id: string; full_name: string }[]>([]);
  const [orderActions, setOrderActions] = useState<Record<string, { designer_id?: string }>>({});
  const [actionStatus, setActionStatus] = useState<Record<string, string | null>>({});

  const { data: ordersData = [], isLoading: ordersLoading, isFetching: ordersFetching, refetch: refetchOrders } = useOrders();
  const isRefreshingOrders = ordersLoading || ordersFetching;
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
                    onClick={async () => {
                      const res = await refetchOrders();
                      if (res.isSuccess) showToast('success', 'Orders refreshed');
                      else showToast('error', 'Failed to refresh orders');
                    }}
                    disabled={isRefreshingOrders}
                  >
                    <RefreshCcw className={cn("w-3 h-3 mr-2", isRefreshingOrders && "animate-spin")} />
                    {isRefreshingOrders ? "Syncing..." : "Refresh"}
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
        <DesignsPanel />
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