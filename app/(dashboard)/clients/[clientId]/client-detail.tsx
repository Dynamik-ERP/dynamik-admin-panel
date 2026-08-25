'use client';

import { ReassignDesignerModal } from '@/components/clients/reassign-designer-modal';
import { Card } from '@/components/shared/card';
import { useClient } from '@/lib/api/clients';
import { useStaff } from '@/lib/api/staff';
import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useState } from 'react';

export function ClientDetail({ clientId }: { clientId: string }) {
  useAuthGuard(['admin']);
  const { data: client, isLoading } = useClient(clientId);
  const { data: designers = [] } = useStaff('design');
  const [showReassignModal, setShowReassignModal] = useState(false);

  if (isLoading || !client) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="mt-2 text-sm text-gray-500">Loading client...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{client.fullName}</h1>
        <p className="mt-1 text-sm text-gray-500">Client ID: {client.id.slice(0, 8)}</p>
      </div>

      <Card variant="bordered" className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
          <button
            onClick={() => setShowReassignModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            type="button"
          >
            Reassign Designer
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-sm text-gray-900">{client.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-sm text-gray-900">{client.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-sm text-gray-900">{client.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-sm text-gray-900 capitalize">{client.role}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Telegram Linked</label>
            <p className="text-sm text-gray-900">
              {client.telegramChatId ? (
                <span className="text-green-600">Linked ({client.telegramChatId})</span>
              ) : (
                <span className="text-gray-400">Not linked</span>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Client Since</label>
            <p className="text-sm text-gray-900">{new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {showReassignModal && (
        <ReassignDesignerModal
          clientId={clientId}
          designers={designers}
          onClose={() => setShowReassignModal(false)}
        />
      )}
    </div>
  );
}
