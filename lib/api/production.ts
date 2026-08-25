import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { CuttingList, BillOfMaterials, ProductionSchedule } from '@/lib/types/domain';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const productionApi = {
  cuttingLists: async (page = 1, limit = 50): Promise<CuttingList[]> => {
    const res = await apiFetch<CuttingList[] | PaginatedResponse<CuttingList>>(`/cutting-lists?page=${page}&limit=${limit}`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<CuttingList>).data)) {
      return (res as PaginatedResponse<CuttingList>).data;
    }
    return Array.isArray(res) ? res : [];
  },
  bom: async (page = 1, limit = 50): Promise<BillOfMaterials[]> => {
    const res = await apiFetch<BillOfMaterials[] | PaginatedResponse<BillOfMaterials>>(`/bom?page=${page}&limit=${limit}`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<BillOfMaterials>).data)) {
      return (res as PaginatedResponse<BillOfMaterials>).data;
    }
    return Array.isArray(res) ? res : [];
  },
  schedules: async (page = 1, limit = 50): Promise<ProductionSchedule[]> => {
    const res = await apiFetch<ProductionSchedule[] | PaginatedResponse<ProductionSchedule>>(`/schedules?page=${page}&limit=${limit}`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<ProductionSchedule>).data)) {
      return (res as PaginatedResponse<ProductionSchedule>).data;
    }
    return Array.isArray(res) ? res : [];
  },
  approveCuttingList: (id: string) =>
    apiFetch<void>(`/cutting-lists/${id}/approve`, { method: 'POST' }),
  declineCuttingList: (id: string, reason?: string) =>
    apiFetch<void>(`/cutting-lists/${id}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  approveBom: (id: string) =>
    apiFetch<void>(`/bom/${id}/approve`, { method: 'POST' }),
};

export function useCuttingLists(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['cuttingLists', { page, limit }],
    queryFn: () => productionApi.cuttingLists(page, limit),
  });
}

export function useCuttingListsForOrder(orderId: string) {
  return useQuery({
    queryKey: ['cuttingLists', orderId],
    queryFn: () => productionApi.cuttingLists(),
    select: (data) => (Array.isArray(data) ? data.find((cl) => (cl.orderId || (cl as any).order_id) === orderId) || null : null),
  });
}

export function useBom(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['bom', { page, limit }],
    queryFn: () => productionApi.bom(page, limit),
  });
}

export function useBomForOrder(orderId: string) {
  return useQuery({
    queryKey: ['bom', orderId],
    queryFn: () => productionApi.bom(),
    select: (data) => (Array.isArray(data) ? data.find((b) => (b.orderId || (b as any).order_id) === orderId) || null : null),
  });
}

export function useSchedules(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['schedules', { page, limit }],
    queryFn: () => productionApi.schedules(page, limit),
  });
}

export function useApproveCuttingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productionApi.approveCuttingList(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cuttingLists'] });
    },
    onError: (error) => {
      console.error('Failed to approve cutting list:', error);
    },
  });
}

export function useDeclineCuttingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      productionApi.declineCuttingList(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cuttingLists'] });
    },
    onError: (error) => {
      console.error('Failed to decline cutting list:', error);
    },
  });
}

export function useApproveBom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productionApi.approveBom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bom'] });
    },
    onError: (error) => {
      console.error('Failed to approve BOM:', error);
    },
  });
}