import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Design } from '@/lib/types/domain';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const designsApi = {
  list: async (orderId: string): Promise<Design[]> => {
    const res = await apiFetch<Design[] | PaginatedResponse<Design>>(`/orders/${orderId}/designs`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<Design>).data)) {
      return (res as PaginatedResponse<Design>).data;
    }
    return Array.isArray(res) ? res : [];
  },
};

export function useDesigns(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId, 'designs'],
    queryFn: () => designsApi.list(orderId),
  });
}