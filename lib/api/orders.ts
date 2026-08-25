import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import { useToast } from '@/components/shared/toast';
import type { Order, OrderStatus, PriceOffer } from '@/lib/types/domain';

// --- raw calls ---

export const ordersApi = {
  list: async (status?: OrderStatus, page = 1, limit = 50): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    const response = await apiFetch<any>(`/orders?${params.toString()}`);
    if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    return Array.isArray(response) ? response : [];
  },

  get: (orderId: string) => apiFetch<Order>(`/orders/${orderId}`),

  sendPriceOffer: (orderId: string, amount: number) =>
    apiFetch<PriceOffer>(`/orders/${orderId}/price-offers`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  routeToDesign: (orderId: string) =>
    apiFetch<void>(`/orders/${orderId}/route-design`, { method: 'POST' }),
};

// --- hooks ---

export function useOrders(status?: OrderStatus, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['orders', { status, page, limit }],
    queryFn: () => ordersApi.list(status, page, limit),
    staleTime: 30_000,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersApi.get(orderId),
  });
}

export function useSendPriceOffer() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ orderId, amount }: { orderId: string; amount: number }) => 
      ordersApi.sendPriceOffer(orderId, amount),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders', orderId] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      showToast('success', 'Price offer sent successfully');
    },
    onError: (error) => {
      console.error('Failed to send price offer:', error);
      showToast('error', 'Failed to send price offer. Please try again.');
    },
  });
}

export function useRouteToDesign(orderId: string) {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: () => ordersApi.routeToDesign(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', orderId] });
      showToast('success', 'Order routed to design successfully');
    },
    onError: (error) => {
      console.error('Failed to route to design:', error);
      showToast('error', 'Failed to route order to design. Please try again.');
    },
  });
}