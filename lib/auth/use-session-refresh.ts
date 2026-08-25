'use client';

import { useEffect } from 'react';
import { useSessionStore } from './session-store';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const API_URL = (() => {
  const url = RAW_URL.trim().replace(/\/+$/, '');
  if (url.endsWith('/api/v1')) return url;
  if (url.endsWith('/api')) return `${url}/v1`;
  return `${url}/api/v1`;
})();

/**
 * Attempts to silently refresh the access token on app mount.
 * The httpOnly refresh cookie persists across refreshes, so we can
 * use it to get a new access token and re-hydrate the session store.
 */
export function useSessionRefresh() {
  const setSession = useSessionStore((s) => s.setSession);
  const setLoading = useSessionStore((s) => s.setLoading);
  const session = useSessionStore((s) => s.session);

  useEffect(() => {
    // If session is already populated in memory (e.g. freshly set via login router.push),
    // immediately mark loading as finished and don't overwrite.
    if (session) {
      setLoading(false);
      return;
    }

    const refreshSession = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          const meResponse = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.access_token}`,
            },
          });
          
          if (meResponse.ok) {
            const userData = await meResponse.json();
            setSession({
              userId: userData.id,
              fullName: userData.full_name,
              role: userData.role,
              accessToken: data.access_token,
            });
          } else {
            setSession(null);
          }
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    refreshSession();
  }, [setSession, setLoading, session]);
}
