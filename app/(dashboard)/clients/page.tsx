'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useClients } from '@/lib/api/clients';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import cn from 'clsx';

export default function ClientsListPage() {
  useAuthGuard(['admin']);
  const { data: clientsData, isLoading, isError, error, refetch } = useClients();

  const clients = Array.isArray(clientsData) ? clientsData : [];

  const getClientName = (client: any) => client.full_name || client.fullName || client.name || 'Unknown';
  const getClientPhone = (client: any) => client.phone || '—';
  const getClientEmail = (client: any) => client.email || '—';
  const isTelegramLinked = (client: any) => Boolean(client.telegram_chat_id || client.telegramChatId);
  const getCreatedAt = (client: any) => client.created_at || client.createdAt;

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Client Management</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Manage client information and designer assignments</p>
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
            <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400">Error loading clients: {(error as any)?.message || 'Failed to fetch'}</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No clients found</p>
          </div>
        ) : (
          <DataTable headers={['Name', 'Phone', 'Email', 'Telegram Linked', 'Client Since']}>
            {clients.map((client: any) => {
              const createdDate = getCreatedAt(client);
              return (
                <tr key={client.id} className="hover:bg-[#161922]/50 text-gray-300 border-b border-[#1F2330]">
                  <td className="p-3 font-sans text-white">{getClientName(client)}</td>
                  <td className="p-3 text-gray-400 text-xs">{getClientPhone(client)}</td>
                  <td className="p-3 text-gray-400 text-xs">{getClientEmail(client)}</td>
                  <td className="p-3">
                    {isTelegramLinked(client) ? (
                      <Badge variant="success">Linked</Badge>
                    ) : (
                      <Badge variant="default">Not Linked</Badge>
                    )}
                  </td>
                  <td className="p-3 text-gray-500 text-xs">
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