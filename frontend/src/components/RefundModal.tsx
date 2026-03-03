import React from 'react';
import { X, Info } from 'lucide-react';
import { Button } from './Button';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function RefundModal({ isOpen, onClose, message }: RefundModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] w-full max-w-md shadow-[0px_4px_24px_rgba(0,0,0,0.2)] p-6 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Info size={24} className="text-blue-600" />
            </div>
            <h2 className="text-[#1A1A1A]">Ақпарат</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="body-r text-[#4D4D4D]">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
          >
            Түсіндім
          </Button>
        </div>
      </div>
    </div>
  );
}

