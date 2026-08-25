import { Link } from '@/components/ui/link';
import { Card } from '@/components/shared/card';
import cn from 'clsx';

interface QueueCardProps {
  label: string;
  count: number;
  href: string;
  className?: string;
}

export function QueueCard({ label, count, href, className }: QueueCardProps) {
  return (
    <Link href={href} className="block">
      <Card variant="bordered" className={cn('hover:border-blue-400 transition-colors p-4', className)}>
        <div className="text-3xl font-semibold">{count === 0 ? 'All clear' : count}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </Card>
    </Link>
  );
}