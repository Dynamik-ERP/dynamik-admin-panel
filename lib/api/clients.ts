import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { User } from '@/lib/types/domain';

interface PaginatedClientsResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const clientsApi = {
  list: async (page = 1, limit = 50): Promise<User[]> => {
    const response = await apiFetch<User[] | PaginatedClientsResponse>(`/clients?page=${page}&limit=${limit}`);
    if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as PaginatedClientsResponse).data)) {
      return (response as PaginatedClientsResponse).data;
    }
    return Array.isArray(response) ? response : [];
  },
  get: (clientId: string) => apiFetch<User>(`/clients/${clientId}`),
  assignDesigner: (clientId: string, designerId: string) =>
    apiFetch<void>(`/clients/${clientId}/assign-designer`, {
      method: 'POST',
      body: JSON.stringify({ designer_id: designerId, designerId }),
    }),
};

export function useClients(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['clients', { page, limit }],
    queryFn: () => clientsApi.list(page, limit),
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => clientsApi.get(clientId),
  });
}

export function useAssignDesigner(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (designerId: string) =>
      clientsApi.assignDesigner(clientId, designerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] });
      qc.invalidateQueries({ queryKey: ['clients', clientId] });
    },
    onError: (error) => {
      console.error('Failed to assign designer:', error);
    },
  });
}