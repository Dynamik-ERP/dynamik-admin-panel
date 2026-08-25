import type { Design } from '@/lib/types/domain';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';

const STATUS_LABEL: Record<Design['status'], string> = {
  drafting: 'Drafting',
  submitted: 'Submitted for review',
  approved: 'Approved',
  revision_requested: 'Revision requested',
};

const STATUS_VARIANT: Record<Design['status'], 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  drafting: 'default',
  submitted: 'info',
  approved: 'success',
  revision_requested: 'error',
};

const getStatusLabel = (status: Design['status']) => STATUS_LABEL[status] ?? status;
const getStatusVariant = (status: Design['status']) => STATUS_VARIANT[status] ?? 'default';

export function DesignCard({ history }: { history: Design[] }) {
  const latest = history.at(-1);

  return (
    <Card variant="bordered" className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Design</h3>
      {latest ? (
        <>
          <Badge variant={getStatusVariant(latest.status)} className="mb-3">
            {getStatusLabel(latest.status)}
          </Badge>
          {latest.fileUrl && (
            <a
              href={latest.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:text-blue-800"
            >
              View design file
            </a>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(latest.createdAt).toLocaleString()}
          </p>
        </>
      ) : (
        <div className="text-gray-400">No design submitted yet</div>
      )}

      {history.length > 1 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium text-gray-700 mb-2">History</p>
          <div className="space-y-2">
            {history.slice(0, -1).map((design) => (
              <div key={design.id} className="text-sm text-gray-600">
                {getStatusLabel(design.status)} - {new Date(design.createdAt).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
