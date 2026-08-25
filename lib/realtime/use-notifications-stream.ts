'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/lib/auth/session-store';
import type { Notification } from '@/lib/types/domain';

function getWsUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return envUrl.replace(/^http/, 'ws');
}

/**
 * Realtime notifications stream hook with safe fallback and reconnection.
 */
export function useNotificationsStream() {
  // Temporarily disabled to fix UI first
  return;
}