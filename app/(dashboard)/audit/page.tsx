'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useAuditLogs } from '@/lib/api/audit';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';

const ENTITY_TYPE_COLORS: Record<string, string> = {
  order: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
  cutting_list: 'bg-green-900/30 text-green-400 border border-green-500/30',
  bom: 'bg-purple-900/30 text-purple-400 border border-purple-500/30',
  user: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
  client: 'bg-pink-900/30 text-pink-400 border border-pink-500/30',
  product: 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30',
};

export default function AuditLogPage() {
  useAuthGuard(['admin']);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<string>('');
  const { data, isLoading, isError, error, refetch } = useAuditLogs(page, 50, entityType || undefined);

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Audit Log</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Activity trail for all system actions</p>
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

        <div className="mb-6 p-4 bg-[#0E1016] border border-[#1F2330] rounded">
          <div className="flex gap-4 items-center">
            <label className="text-xs font-medium text-gray-400">Filter by Entity Type:</label>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-[#2B3143] rounded bg-[#0B0C0E] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">All</option>
              <option value="order">Order</option>
              <option value="cutting_list">Cutting List</option>
              <option value="bom">Bill of Materials</option>
              <option value="user">User</option>
              <option value="client">Client</option>
              <option value="product">Product</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
            <p className="mt-2 text-sm text-gray-500">Loading audit logs...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400">Error loading audit logs: {error?.message || 'Unknown error'}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <>
            <DataTable headers={['Timestamp', 'User', 'Action', 'Entity Type', 'Entity', 'IP Address']}>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                  <td className="p-3 text-gray-500 text-xs">{formatDate(log.timestamp)}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-sans text-white text-xs">{log.userName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{log.userId?.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{log.action}</td>
                  <td className="p-3">
                    <Badge 
                      variant="default" 
                      className={cn(ENTITY_TYPE_COLORS[log.entityType] || 'bg-gray-800 text-gray-400 border border-gray-700')}
                    >
                      {log.entityType.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-white text-xs">{log.entityName || log.entityId}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{log.entityId?.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{log.ipAddress || 'N/A'}</td>
                </tr>
              ))}
            </DataTable>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-gray-500 font-mono">
                  Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} entries
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-xs text-gray-500 font-mono">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}