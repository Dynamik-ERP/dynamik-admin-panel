'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cn from 'clsx';

const PRODUCTION_TABS = [
  { name: 'Cutting Lists', href: '/production/cutting-lists' },
  { name: 'Bill of Materials (BOM)', href: '/production/bom' },
  { name: 'Schedule', href: '/production/schedule' },
];

export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* SUB-TABS */}
      <div className="px-6 border-b border-[#1F2330] bg-[#0E1016] -mx-6 -mt-6 mb-4">
        <div className="flex gap-4 font-mono text-xs">
          {PRODUCTION_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  'py-3 font-medium border-b-2 transition-all px-1 -mb-[2px]',
                  isActive
                    ? 'border-[#FF6B00] text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
