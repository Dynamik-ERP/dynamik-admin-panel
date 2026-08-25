'use client';

import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useOrder } from '@/lib/api/orders';
import { useState, use } from 'react';
import { OrderHeader } from '@/components/orders/order-header';
import { OverviewTab } from '@/components/orders/tabs/overview-tab';
import { PriceDesignTab } from '@/components/orders/tabs/price-design-tab';
import { ProductionTab } from '@/components/orders/tabs/production-tab';
import { MessagesTab } from '@/components/orders/tabs/messages-tab';
import { TimelineTab } from '@/components/orders/tabs/timeline-tab';
import cn from 'clsx';

const TABS = ['Overview', 'Price & Design', 'Production', 'Messages', 'Timeline'] as const;
type Tab = typeof TABS[number];

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  useAuthGuard(['admin']);
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.orderId;

  const { data: order, isLoading } = useOrder(orderId);
  const [tab, setTab] = useState<Tab>('Overview');

  if (isLoading || !order) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
        <p className="mt-2 text-sm text-gray-500">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderHeader order={order} />
      
      <nav className="flex gap-4 border-b border-[#1F2330]">
        {TABS.map((t) => (
          <button
            key={t}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-[#FF6B00] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            )}
            onClick={() => setTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </nav>
      
      <div>
        {tab === 'Overview' && <OverviewTab order={order} />}
        {tab === 'Price & Design' && <PriceDesignTab order={order} />}
        {tab === 'Production' && <ProductionTab order={order} />}
        {tab === 'Messages' && <MessagesTab orderId={order.id} />}
        {tab === 'Timeline' && <TimelineTab orderId={order.id} />}
      </div>
    </div>
  );
}
