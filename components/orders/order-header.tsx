import type { Order } from '@/lib/types/domain';
import { useRouteToDesign } from '@/lib/api/orders';
import { useDesigns } from '@/lib/api/designs';
import { OrderStatusBadge } from './order-status-badge';
import { Card } from '@/components/shared/card';

export function OrderHeader({ order }: { order: Order }) {
  const { data: designsData } = useDesigns(order.id);
  const routeToDesign = useRouteToDesign(order.id);

  const designs = Array.isArray(designsData) ? designsData : [];

  const clientName = (order as any).client?.full_name || order.client?.fullName || order.clientName || 'Unknown Client';
  const clientPhone = (order as any).client?.phone || order.client?.phone || 'No phone';

  const alreadyRouted = designs.length > 0;

  return (
    <Card variant="bordered" className="p-4 bg-[#12141C] border-[#1F2330]">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">{clientName}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <span className="text-sm text-gray-400">{clientPhone}</span>
          <span className="mx-2 text-gray-600">•</span>
          <span className="text-sm text-gray-400 font-mono">Order ID: {order.id ? order.id.slice(0, 8).toUpperCase() : '—'}</span>
        </div>
        <div className="flex gap-2">
          {!alreadyRouted && (
            <button
              onClick={() => routeToDesign.mutate()}
              disabled={routeToDesign.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Route to Design
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
