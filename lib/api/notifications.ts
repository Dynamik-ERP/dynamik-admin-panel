import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Notification } from '@/lib/types/domain';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const notificationsApi = {
  list: async (page = 1, limit = 50): Promise<Notification[]> => {
    const res = await apiFetch<Notification[] | PaginatedResponse<Notification>>(`/notifications?page=${page}&limit=${limit}`);
    if (res && typeof res === 'object' && 'data' in res && Array.isArray((res as PaginatedResponse<Notification>).data)) {
      return (res as PaginatedResponse<Notification>).data;
    }
    return Array.isArray(res) ? res : [];
  },
  markRead: (id: string) =>
    apiFetch<void>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: async () => {
    // If backend does not have /read-all, fetch unread and mark individually
    const notifications = await notificationsApi.list(1, 100);
    const unread = notifications.filter((n: any) => !n.readStatus && !n.read_status);
    await Promise.allSettled(unread.map((n) => notificationsApi.markRead(n.id)));
  },
};

export function useNotifications(options?: { enabled?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['notifications', { page: options?.page ?? 1, limit: options?.limit ?? 50 }],
    queryFn: () => notificationsApi.list(options?.page ?? 1, options?.limit ?? 50),
    enabled: options?.enabled ?? true,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}