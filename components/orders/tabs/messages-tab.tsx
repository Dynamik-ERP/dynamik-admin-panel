import { useOrderMessages } from '@/lib/realtime/use-order-messages';
import { Card } from '@/components/shared/card';
import { useState } from 'react';

export function MessagesTab({ orderId }: { orderId: string }) {
  useOrderMessages(orderId);
  const [message, setMessage] = useState('');
  
  // This would normally fetch messages from the API
  // For now, we'll show a placeholder
  const messages: Array<{ id: string; sender: string; body: string; timestamp: string }> = [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // This would call the API to send a message
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <Card variant="bordered" className="p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Messages</h3>
      
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No messages yet</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {msg.sender.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-900">{msg.sender}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{msg.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </Card>
  );
}