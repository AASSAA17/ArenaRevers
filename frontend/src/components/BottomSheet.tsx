import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  isProcessing?: boolean;
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  showCloseButton = true,
  isProcessing = false
}: BottomSheetProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const currentYPos = e.touches[0].clientY;
    const diff = currentYPos - dragStartY;
    if (diff > 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentY > 100) {
      onClose();
    }
    setCurrentY(0);
  };

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-[0px_4px_24px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${
            isDragging ? '' : 'animate-in slide-in-from-bottom-4'
          }`}
          style={isDragging ? { transform: `translateY(${currentY}px)` } : {}}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle */}
          <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center z-10">
            <div className="w-12 h-1 bg-[#D9D9D9] rounded-full"></div>
          </div>

          {/* Header */}
          {(title || showCloseButton) && (
            <div className="sticky top-0 bg-white border-b border-[#D9D9D9] px-6 py-4 flex items-center justify-between z-10">
              {title && <h2 className="text-[#1A1A1A]">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: қарапайым modal
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0px_4px_24px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-white border-b border-[#D9D9D9] p-6 flex items-center justify-between rounded-t-[20px] z-10">
            {title && <h2 className="text-[#1A1A1A]">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors ml-auto"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

