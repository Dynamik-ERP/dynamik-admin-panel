import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { User, RegistrationCode, UserRole } from '@/lib/types/domain';

interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export const staffApi = {
  list: async (role?: UserRole, page = 1, limit = 50): Promise<User[]> => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    params.set('page', String(page));
    params.set('limit', String(limit));
    const response = await apiFetch<User[] | PaginatedUsersResponse>(`/users?${params.toString()}`);
    if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as PaginatedUsersResponse).data)) {
      return (response as PaginatedUsersResponse).data;
    }
    return Array.isArray(response) ? response : [];
  },
  generateCode: (role: UserRole) =>
    apiFetch<RegistrationCode>('/auth/registration-codes', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
  listCodes: (page = 1, limit = 50) => 
    apiFetch<RegistrationCode[]>(`/auth/registration-codes?page=${page}&limit=${limit}`),
  updateUser: (id: string, data: Partial<User>) =>
    apiFetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deactivateUser: (id: string) =>
    apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
  activateUser: (id: string) =>
    apiFetch<void>(`/users/${id}/unlock`, { method: 'POST' }),
};

export function useStaff(role?: UserRole, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['staff', { role, page, limit }],
    queryFn: () => staffApi.list(role, page, limit),
  });
}

export function useRegistrationCodes(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['registrationCodes', { page, limit }],
    queryFn: () => staffApi.listCodes(page, limit),
  });
}

export function useGenerateCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: UserRole) => staffApi.generateCode(role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registrationCodes'] });
    },
    onError: (error) => {
      console.error('Failed to generate registration code:', error);
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      staffApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error) => {
      console.error('Failed to deactivate user:', error);
    },
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffApi.activateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error) => {
      console.error('Failed to activate user:', error);
    },
  });
}