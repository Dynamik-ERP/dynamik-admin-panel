import { renderHook } from '@testing-library/react';
import { useAuthGuard } from '../use-auth-guard';
import { useSessionStore } from '../session-store';
import { vi, describe, it, expect } from 'vitest';
import { useRouter } from 'next/navigation';

vi.mock('../session-store', () => ({
  useSessionStore: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('useAuthGuard', () => {
  it('should redirect to login if no session and not loading', () => {
    const mockReplace = vi.fn();
    (useRouter as any).mockReturnValue({ replace: mockReplace });
    (useSessionStore as any).mockImplementation((selector: any) => selector({ session: null, isLoading: false }));

    renderHook(() => useAuthGuard(['admin']));

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('should not redirect if session exists and role is allowed', () => {
    const mockReplace = vi.fn();
    (useRouter as any).mockReturnValue({ replace: mockReplace });
    (useSessionStore as any).mockImplementation((selector: any) => selector({ 
      session: { role: 'admin' }, 
      isLoading: false 
    }));

    renderHook(() => useAuthGuard(['admin']));

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
