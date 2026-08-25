'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/lib/auth/session-store';
import type { Message } from '@/lib/types/domain';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export function useOrderMessages(orderId: string) {
  const qc = useQueryClient();
  const token = useSessionStore((s) => s.session?.accessToken);

  useEffect(() => {
    if (!token || typeof window === 'undefined') return;
    const socket = new WebSocket(`${WS_BASE}/orders/${orderId}/messages/stream`);
    
    socket.onopen = () => {
      // Send auth token in first message (protocol-level handshake)
      socket.send(JSON.stringify({ type: 'auth', token }));
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle auth confirmation
        if (data.type === 'auth_success') {
          return;
        }
        
        // Handle auth failure
        if (data.type === 'auth_error') {
          console.error('WebSocket auth failed:', data.message);
          socket.close();
          return;
        }
        
        // Handle messages
        const message: Message = data;
        qc.setQueryData<Message[]>(['orders', orderId, 'messages'], (prev) =>
          prev ? [...prev, message] : [message],
        );
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };
    return () => socket.close();
  }, [orderId, token, qc]);
}