'use client';

import cn from 'clsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthGuard } from '@/lib/auth/use-auth-guard';
import { useSessionRefresh } from '@/lib/auth/use-session-refresh';
import { useSessionStore } from '@/lib/auth/session-store';
import { useState, useRef } from 'react';
import { ToastProvider } from '@/components/shared/toast';
import { Shield, ShoppingBag, Users, UserCheck, Scissors, Box, Bell, FileText, LogOut } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  desc: string;
  icon: any;
  color: string;
}

const DEPARTMENTS: NavItem[] = [
  { name: 'Admin Dashboard', path: '/', desc: 'System-wide oversight', icon: Shield, color: '#FF6B00' },
  { name: 'Orders', path: '/orders', desc: 'Manage client orders', icon: ShoppingBag, color: '#38BDF8' },
  { name: 'Clients', path: '/clients', desc: 'Customer accounts', icon: Users, color: '#8B5CF6' },
  { name: 'Staff', path: '/staff', desc: 'Team & roles', icon: UserCheck, color: '#10B981' },
  { name: 'Production', path: '/production/cutting-lists', desc: 'Cutting lists & BOM', icon: Scissors, color: '#EF4444' },
  { name: 'Warehouse', path: '/warehouse/procurement', desc: 'Inventory & materials', icon: Box, color: '#F59E0B' },
  { name: 'Notifications', path: '/notifications', desc: 'System alerts', icon: Bell, color: '#EC4899' },
  { name: 'Audit Log', path: '/audit', desc: 'Activity audit trail', icon: FileText, color: '#64748B' },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramStatus, setTelegramStatus] = useState('');
  const router = useRouter();
  
  useSessionRefresh();
  useAuthGuard(['admin']);
  
  const pathname = usePathname();
  const session = useSessionStore((s) => s.session);
  const clearSession = useSessionStore((s) => s.clear);
  const userName = session?.fullName || "System Admin";
  const userRole = session?.role || "admin";
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "AD";

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearSession();
      router.push('/login');
    }
  };

  const handleTelegramLink = async () => {
    setTelegramStatus('');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/telegram/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_chat_id: telegramChatId }),
        credentials: 'include',
      });
      setTelegramStatus('Telegram linked');
      setTelegramChatId('');
    } catch {
      setTelegramStatus('Telegram link failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-gray-300 font-sans flex select-none">
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] bg-[#12141C] border-r border-[#1F2330] flex flex-col justify-between p-4 flex-shrink-0">
        <div className="flex flex-col min-h-0">
          <Link href="/" className="flex items-center gap-2.5 mb-6 px-2 group cursor-pointer">
            <div className="w-8 h-8 bg-[#FF6B00] rounded flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-[#0B0C0E] font-black text-sm tracking-tighter">DM</span>
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-white group-hover:text-[#FF6B00] transition-colors">DYNAMIK</h1>
              <p className="text-[10px] font-mono text-gray-500 leading-none">ERP v2.0</p>
            </div>
          </Link>

          <span className="text-[11px] font-mono uppercase tracking-widest text-gray-600 block px-2 mb-2">
            PORTAL NAVIGATION
          </span>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const isActive = dept.path === '/' 
                ? pathname === '/' 
                : pathname.startsWith(dept.path);

              return (
                <Link
                  key={dept.name}
                  href={dept.path}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-all",
                    isActive
                      ? "bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20"
                      : "text-gray-400 hover:text-white hover:bg-[#161922] border border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#FF6B00' : dept.color }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-white truncate">{dept.name}</span>
                    <span className="text-[9px] text-gray-500 leading-none truncate">{dept.desc}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#1F2330]">
          <div className="p-2 bg-[#191D27] rounded border border-[#232938] space-y-2">
            <span className="text-[10px] font-mono text-gray-500 leading-none">TELEGRAM LINK</span>
            <div className="flex gap-1">
              <input
                value={telegramChatId}
                onChange={(event) => setTelegramChatId(event.target.value)}
                placeholder="Chat ID"
                className="min-w-0 flex-1 bg-[#0B0C0E] border border-[#2B3143] rounded px-2 py-1 text-[10px] text-white font-mono focus:outline-none focus:border-[#FF6B00]"
              />
              <button
                onClick={handleTelegramLink}
                disabled={!telegramChatId}
                className="px-2 py-1 rounded bg-[#252833] text-[10px] text-gray-300 disabled:opacity-50"
              >
                Link
              </button>
            </div>
            {telegramStatus && <p className="text-[10px] text-gray-500 font-mono">{telegramStatus}</p>}
          </div>
          <div className="flex items-center gap-3 p-2 bg-[#191D27] rounded border border-[#232938]">
            <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] font-mono text-xs font-bold font-sans flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-semibold text-white leading-tight truncate">{userName}</span>
              <span className="text-[10px] font-mono text-gray-500 leading-none">{userRole.toUpperCase()}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-mono text-gray-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition text-center"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#1F2330] bg-[#12141C]/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#FF6B00] font-semibold">● Admin Portal</span>
            <span className="text-gray-600">/ System-wide oversight</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-gray-500">
            <span>LIVE CONNECTED</span>
          </div>
        </header>

        <div className="p-6 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const queryClientRef = useRef<QueryClient | null>(null);
  
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ToastProvider>
        <DashboardContent>{children}</DashboardContent>
      </ToastProvider>
    </QueryClientProvider>
  );
}