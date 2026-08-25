import { Badge } from '@/components/shared/badge';
import type { OrderStatus } from '@/lib/types/domain';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  draft: { label: 'Draft', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'info' },
  ready_for_production: { label: 'Ready for Production', variant: 'warning' },
  in_production: { label: 'In Production', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  pending: { label: 'Pending', variant: 'default' },
  design: { label: 'Design', variant: 'info' },
  production: { label: 'Production', variant: 'info' },
  warehouse: { label: 'Warehouse', variant: 'warning' },
  delivery: { label: 'Delivery', variant: 'warning' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', variant: 'default' };
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}