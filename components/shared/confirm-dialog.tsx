'use client';

import { useState } from 'react';
import { Modal } from './modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string | undefined;
  cancelText?: string | undefined;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isOpen,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [callback, setCallback] = useState<(() => void) | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }>({ title: '', message: '' });

  const confirm = (
    config: { title: string; message: string; confirmText?: string; cancelText?: string },
    onConfirm: () => void
  ) => {
    setDialogConfig(config);
    setCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (callback) {
      callback();
    }
    setIsOpen(false);
    setCallback(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setCallback(null);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      title={dialogConfig.title}
      message={dialogConfig.message}
      confirmText={dialogConfig.confirmText}
      cancelText={dialogConfig.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialogComponent };
}
