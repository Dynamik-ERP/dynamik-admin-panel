import { useState } from 'react';
import { useAssignDesigner } from '@/lib/api/clients';
import { Modal } from '@/components/shared/modal';
import type { User } from '@/lib/types/domain';

interface ReassignDesignerModalProps {
  clientId: string;
  designers: User[];
  onClose: () => void;
}

export function ReassignDesignerModal({ clientId, designers, onClose }: ReassignDesignerModalProps) {
  const [selected, setSelected] = useState<string>('');
  const assign = useAssignDesigner(clientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    
    assign.mutate(selected, {
      onSuccess: () => {
        onClose();
        setSelected('');
      },
    });
  };

  return (
    <Modal isOpen title="Reassign Designer" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="designer" className="block text-sm font-medium text-gray-700">
            Select Designer
          </label>
          <select
            id="designer"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a designer</option>
            {designers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>
        </div>
        
        <p className="text-sm text-gray-500 bg-amber-50 p-3 rounded">
          This updates the client's designer going forward. Past orders keep
          the designer who actually worked them, even after this change.
        </p>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selected || assign.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assign.isPending ? 'Assigning...' : 'Confirm reassignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}