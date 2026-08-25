'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from './session-store';
import type { UserRole } from '@/lib/types/domain';

/**
 * Mirrors the API's @Roles(...) guard (System Design v2.0 §5) on the
 * client, purely for UX — every mutating call below still gets rejected
 * server-side if this is ever bypassed. This hook exists so an admin who
 * loses their session mid-page gets redirected to /login instead of
 * staring at a screen full of failed fetches.
 */
export function useAuthGuard(allowedRoles: UserRole[]) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const isLoading = useSessionStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;
    
    if (!session) {
      router.replace('/login');
      return;
    }
    if (!allowedRoles.includes(session.role)) {
      router.replace('/'); // or a 403 page
    }
  }, [session, isLoading, allowedRoles, router]);

  return session;
}