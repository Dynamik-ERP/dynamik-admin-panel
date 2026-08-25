import type { Order } from '@/lib/types/domain';
import { usePriceOffers } from '@/lib/api/priceOffers';
import { useDesigns } from '@/lib/api/designs';
import { PriceOfferCard } from '../price-offer-card';
import { DesignCard } from '../design-card';
import { Card } from '@/components/shared/card';

export function PriceDesignTab({ order }: { order: Order }) {
  const { data: priceOffers = [] } = usePriceOffers(order.id);
  const { data: designs = [] } = useDesigns(order.id);

  const priceApproved = priceOffers.some((p) => p.status === 'approved');
  const designApproved = designs.some((d) => d.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceOfferCard history={priceOffers} orderId={order.id} />
        <DesignCard history={designs} />
      </div>
      <GateBanner priceApproved={priceApproved} designApproved={designApproved} />
    </div>
  );
}

function GateBanner({ priceApproved, designApproved }: { priceApproved: boolean; designApproved: boolean }) {
  if (priceApproved && designApproved) {
    return (
      <Card variant="bordered" className="p-4 bg-green-50 border-green-200">
        <p className="text-sm text-green-800">
          Ready for production — waiting on Operations to schedule
        </p>
      </Card>
    );
  }
  return (
    <Card variant="bordered" className="p-4 bg-amber-50 border-amber-200">
      <p className="text-sm text-amber-800">
        Waiting on:{' '}
        <span className={priceApproved ? 'line-through' : 'font-semibold'}>Price</span>{' '}
        <span className={designApproved ? 'line-through' : 'font-semibold'}>Design</span>
      </p>
    </Card>
  );
}