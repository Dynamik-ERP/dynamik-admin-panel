import type { Order } from '@/lib/types/domain';
import { Card } from '@/components/shared/card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/shared/table';

export function OverviewTab({ order }: { order: Order }) {
  const clientName = (order as any).client?.full_name || order.client?.fullName || order.clientName || '—';
  const clientPhone = (order as any).client?.phone || order.client?.phone || '—';
  const createdDate = (order as any).created_at || order.createdAt;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-6">
      {/* Order Information */}
      <Card variant="bordered" className="p-6 bg-[#12141C] border-[#1F2330]">
        <h2 className="text-lg font-semibold text-white mb-4">Order Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 font-mono">ORDER ID</label>
            <p className="text-sm text-white font-mono">{order.id}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 font-mono">CREATED</label>
            <p className="text-sm text-white">{createdDate ? new Date(createdDate).toLocaleString() : '—'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 font-mono">CLIENT</label>
            <p className="text-sm text-white">{clientName}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 font-mono">PHONE</label>
            <p className="text-sm text-white">{clientPhone}</p>
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card variant="bordered" className="p-6 bg-[#12141C] border-[#1F2330]">
        <h2 className="text-lg font-semibold text-white mb-4">Order Items</h2>
        {items.length === 0 ? (
          <p className="text-xs text-gray-500 font-mono">No items in this order.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Item Type</TableHeader>
                <TableHeader>Quantity</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="text-white">{item.item_type || item.itemType || item.productName || 'Item'}</TableCell>
                  <TableCell className="text-gray-300">{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}