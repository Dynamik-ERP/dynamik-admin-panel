'use client';

import cn from 'clsx';
import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/lib/api/notifications';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export default function NotificationsPage() {
  useAuthGuard(['admin']);
  const { data: notificationsData, isLoading, isError, error, refetch } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const isRead = (n: any) => Boolean(n.read_status ?? n.readStatus);
  const getCreatedAt = (n: any) => n.created_at || n.createdAt || '';

  const sorted = [...notifications].sort((a: any, b: any) => {
    const readDiff = Number(isRead(a)) - Number(isRead(b));
    if (readDiff !== 0) return readDiff;
    const dateA = getCreatedAt(a);
    const dateB = getCreatedAt(b);
    return dateB.localeCompare(dateA);
  });

  const handleMarkAsRead = (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);
    if (target && !isRead(target)) {
      markRead.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllRead.mutate();
  };

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  return (
    <div className="space-y-4">
      <div className="bg-[#12141C] border border-[#1F2330] rounded p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Notifications</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCcw className={cn("w-3 h-3 mr-2", isLoading && "animate-spin")} />
              {isLoading ? "Syncing..." : "Refresh"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="primary"
                onClick={handleMarkAllAsRead}
                disabled={markAllRead.isPending}
              >
                {markAllRead.isPending ? 'Marking all read...' : 'Mark all read'}
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
            <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400 font-medium">Failed to load notifications</p>
            <p className="text-xs text-red-500 mt-1">{(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((notification: any) => {
              const read = isRead(notification);
              const orderId = notification.order_id || notification.orderId;
              const dateStr = getCreatedAt(notification);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 cursor-pointer transition-colors border border-[#1F2330] rounded',
                    !read ? 'bg-[#FF6B00]/10 border-[#FF6B00]/20' : 'bg-[#12141C] hover:bg-[#161922]'
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {!read && (
                        <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!read && (
                          <Badge variant="info" className="text-xs">New</Badge>
                        )}
                        <p className={cn(
                          'text-sm',
                          !read ? 'font-medium text-white' : 'text-gray-400'
                        )}>
                          {orderId ? (
                            <Link
                              href={`/orders/${orderId}?tab=timeline`}
                              className="text-[#FF6B00] hover:text-[#E05E00]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {notification.message}
                            </Link>
                          ) : (
                            notification.message
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {dateStr ? new Date(dateStr).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}