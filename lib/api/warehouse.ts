import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { ProcurementRequest, MaterialTransaction } from '@/lib/types/domain';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const warehouseApi = {
  procurementRequests: async (page = 1, limit = 50): Promise<ProcurementRequest[]> => {
    const res = await apiFetch<ProcurementRequest[] | PaginatedResponse<ProcurementRequest>>(`/procurement-requests?page=${page}&limit=${limit}`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<ProcurementRequest>).data)) {
      return (res as PaginatedResponse<ProcurementRequest>).data;
    }
    return Array.isArray(res) ? res : [];
  },
  transactions: async (page = 1, limit = 50): Promise<MaterialTransaction[]> => {
    const res = await apiFetch<MaterialTransaction[] | PaginatedResponse<MaterialTransaction>>(`/material-transactions?page=${page}&limit=${limit}`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<MaterialTransaction>).data)) {
      return (res as PaginatedResponse<MaterialTransaction>).data;
    }
    return Array.isArray(res) ? res : [];
  },
  approveProcurementRequest: (id: string) =>
    apiFetch<void>(`/procurement-requests/${id}/approve`, { method: 'POST' }),
};

export function useProcurementRequests(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['procurementRequests', { page, limit }],
    queryFn: () => warehouseApi.procurementRequests(page, limit),
  });
}

export function useMaterialTransactions(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['materialTransactions', { page, limit }],
    queryFn: () => warehouseApi.transactions(page, limit),
  });
}

export function useApproveProcurementRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => warehouseApi.approveProcurementRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procurementRequests'] });
    },
  });
}