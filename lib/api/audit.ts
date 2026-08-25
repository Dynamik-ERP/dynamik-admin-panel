import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { AuditLog } from '@/lib/types/domain';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const auditApi = {
  getLogs: async (page = 1, limit = 50, entityType?: string, userId?: string) => {
    try {
      const res = await apiFetch<{ logs?: AuditLog[]; data?: AuditLog[]; total: number } | PaginatedResponse<AuditLog>>(
        `/audit-logs?page=${page}&limit=${limit}${entityType ? `&entityType=${entityType}` : ''}${userId ? `&userId=${userId}` : ''}`
      );
      if (res && typeof res === 'object') {
        const logs: AuditLog[] = 'logs' in res ? (res.logs ?? []) : (res.data ?? []);
        const total = res.total ?? logs.length;
        return { logs, total };
      }
      return { logs: [], total: 0 };
    } catch {
      return { logs: [], total: 0 };
    }
  },
};

export function useAuditLogs(page = 1, limit = 50, entityType?: string, userId?: string) {
  return useQuery({
    queryKey: ['auditLogs', { page, limit, entityType, userId }],
    queryFn: () => auditApi.getLogs(page, limit, entityType, userId),
  });
}
