import { create } from 'zustand';
import type { UserRole } from '@/lib/types/domain';

interface Session {
  userId: string;
  fullName: string;
  role: UserRole;
  accessToken: string;
}

interface SessionStore {
  session: Session | null;
  isLoading: boolean;
  setSession: (s: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

// Access token lives in memory only — never localStorage, so an XSS payload
// can't read it directly. Refresh token is an httpOnly cookie the API sets
// on /auth/login and rotates on /auth/refresh; this store never touches it.
export const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  clear: () => set({ session: null, isLoading: false }),
}));