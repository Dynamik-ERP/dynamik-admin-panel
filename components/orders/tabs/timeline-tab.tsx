import { Card } from '@/components/shared/card';

export function TimelineTab({ orderId: _orderId }: { orderId: string }) {
  // This would normally fetch timeline events from the API
  // For now, we'll show a placeholder
  const events: Array<{ id: string; actorName: string; description: string; timestamp: string }> = [];

  return (
    <Card variant="bordered" className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
      
      {events.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No timeline events yet</p>
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="flex gap-3">
              <span className="text-sm text-gray-400 w-32 shrink-0">
                {new Date(event.timestamp).toLocaleString()}
              </span>
              <span className="text-sm text-gray-900">
                <strong>{event.actorName}</strong> {event.description}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}