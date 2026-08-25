import { useSessionStore } from '@/lib/auth/session-store';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const API_BASE = (() => {
  const url = RAW_URL.trim().replace(/\/+$/, '');
  if (url.endsWith('/api/v1')) return url;
  if (url.endsWith('/api')) return `${url}/v1`;
  return `${url}/api/v1`;
})();

class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API error ${status}`);
  }
}

let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Deduplicate concurrent 401s into a single refresh call.
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // sends the httpOnly refresh cookie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError(res.status, null);
        return res.json();
      })
      .then((data: { access_token?: string; accessToken?: string }) => {
        const newAccessToken = data.access_token || data.accessToken || '';
        const currentSession = useSessionStore.getState().session;
        if (currentSession && newAccessToken) {
          useSessionStore.getState().setSession({
            ...currentSession,
            accessToken: newAccessToken,
          });
        }
        return newAccessToken;
      })
      .catch((error) => {
        useSessionStore.getState().clear();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw error;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = useSessionStore.getState().session?.accessToken;

  const doFetch = (bearer: string | undefined) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...init.headers,
      },
    });

  let res = await doFetch(token);

  if (res.status === 401 && token) {
    try {
      const newToken = await refreshAccessToken();
      res = await doFetch(newToken);
    } catch {
      // Refresh failed
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { ApiError };