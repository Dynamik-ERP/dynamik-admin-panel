import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { PriceOffer } from '@/lib/types/domain';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const priceOffersApi = {
  list: async (orderId: string): Promise<PriceOffer[]> => {
    const res = await apiFetch<PriceOffer[] | PaginatedResponse<PriceOffer>>(`/orders/${orderId}/price-offers`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<PriceOffer>).data)) {
      return (res as PaginatedResponse<PriceOffer>).data;
    }
    return Array.isArray(res) ? res : [];
  },
};

export function usePriceOffers(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId, 'priceOffers'],
    queryFn: () => priceOffersApi.list(orderId),
  });
}