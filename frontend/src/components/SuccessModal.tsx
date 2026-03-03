import React from 'react';
import { CheckCircle, Calendar } from 'lucide-react';
import { Button } from './Button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewBookings: () => void;
  onViewReceipt?: () => void;
  bookingDetails: {
    arenaName: string;
    date: string;
    time: string;
    duration: number;
  };
  bookingId?: string;
}

export function SuccessModal({ isOpen, onClose, onViewBookings, onViewReceipt, bookingDetails, bookingId }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] w-full max-w-md shadow-[0px_4px_24px_rgba(0,0,0,0.2)] p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-[#EAFBF3] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={48} className="text-[#2ECC71]" />
        </div>

        <h2 className="mb-2">Брондау сәтті өтті!</h2>
        <p className="body-r text-[#808080] mb-6">
          Сіздің брондауыңыз сәтті расталды
        </p>

        <div className="bg-[#F5F5F5] p-4 rounded-xl mb-6 text-left">
          <h4 className="text-[#1A1A1A] mb-3">{bookingDetails.arenaName}</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#2ECC71]" />
              <span className="body-s text-[#4D4D4D]">
                {bookingDetails.date}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="body-s text-[#4D4D4D]">
                🕐 {bookingDetails.time} ({bookingDetails.duration} сағат)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {onViewReceipt && bookingId && (
            <Button variant="primary" size="lg" className="w-full" onClick={() => {
              onViewReceipt();
              onClose();
            }}>
              Чекті көру
            </Button>
          )}
          <Button variant="primary" size="lg" className="w-full" onClick={() => {
            onViewBookings();
            onClose();
          }}>
            Менің брондауларым
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => {
            onClose();
          }}>
            Басты бетке қайту
          </Button>
        </div>
      </div>
    </div>
  );
}
