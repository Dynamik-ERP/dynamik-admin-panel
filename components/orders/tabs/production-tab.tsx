import type { Order } from '@/lib/types/domain';
import { useCuttingListsForOrder, useApproveCuttingList, useDeclineCuttingList } from '@/lib/api/production';
import { useBomForOrder, useApproveBom } from '@/lib/api/production';
import { useState } from 'react';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';

export function ProductionTab({ order }: { order: Order }) {
  const { data: cuttingList } = useCuttingListsForOrder(order.id);
  const { data: bom } = useBomForOrder(order.id);
  const approveCuttingList = useApproveCuttingList();
  const declineCuttingList = useDeclineCuttingList();
  const approveBom = useApproveBom();
  const [declineReason, setDeclineReason] = useState('');

  return (
    <div className="space-y-6">
      {cuttingList && (
        <Card variant="bordered" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Cutting list</h3>
            <Badge variant={cuttingList.status === 'pending' ? 'warning' : cuttingList.status === 'approved' ? 'success' : 'error'}>
              {cuttingList.status}
            </Badge>
          </div>
          {cuttingList.status === 'pending' && (
            <div className="mt-2 space-y-3">
              <button
                onClick={() => approveCuttingList.mutate(cuttingList.id)}
                disabled={approveCuttingList.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {approveCuttingList.isPending ? 'Approving...' : 'Approve'}
              </button>
              <div>
                <textarea
                  placeholder="Reason for decline (sent to Operations)"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  onClick={() => declineCuttingList.mutate({ id: cuttingList.id, reason: declineReason })}
                  disabled={declineCuttingList.isPending || !declineReason}
                  className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {declineCuttingList.isPending ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {bom && (
        <Card variant="bordered" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Bill of materials</h3>
            <div className="flex items-center gap-2">
              <Badge variant={bom.status === 'pending' ? 'warning' : bom.status === 'approved' ? 'success' : 'error'}>
                {bom.status}
              </Badge>
              <span className="text-sm text-gray-500">
                Warehouse: {bom.warehouseApproved ? '✅' : '⏳'}
              </span>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Boards</p>
              <p className="text-sm text-gray-600">{JSON.stringify(bom.boards)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Colors</p>
              <p className="text-sm text-gray-600">{JSON.stringify(bom.colors)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Accessories</p>
              <p className="text-sm text-gray-600">{JSON.stringify(bom.accessories)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Edging</p>
              <p className="text-sm text-gray-600">{JSON.stringify(bom.edging)}</p>
            </div>
          </div>
          {bom.status === 'pending' && (
            <button
              onClick={() => approveBom.mutate(bom.id)}
              disabled={approveBom.isPending}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {approveBom.isPending ? 'Approving...' : 'Approve'}
            </button>
          )}
        </Card>
      )}

      {/* Schedule + milestones + QC would render read-only below — omitted for length */}
    </div>
  );
}