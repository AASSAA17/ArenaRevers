import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  sportType: string;
  minPrice: number | null;
  maxPrice: number | null;
}

const SPORT_TYPES = [
  { value: '', label: 'Барлығы' },
  { value: 'football', label: 'Футбол' },
  { value: 'basketball', label: 'Баскетбол' },
  { value: 'tennis', label: 'Теннис' },
  { value: 'volleyball', label: 'Волейбол' },
  { value: 'badminton', label: 'Бадминтон' },
  { value: 'table-tennis', label: 'Үстел теннисі' },
];

export function FilterModal({ isOpen, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  // currentFilters өзгерген кезде жергілікті күйді жаңарту
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      sportType: '',
      minPrice: null,
      maxPrice: null,
    };
    setFilters(resetFilters);
    onApply(resetFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-[20px] lg:rounded-[20px] w-full max-w-md shadow-[0px_4px_24px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#D9D9D9] p-6 flex items-center justify-between rounded-t-[20px]">
          <h2>Сүзгілер</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sport Type */}
          <div>
            <label className="body-s text-[#4D4D4D] mb-3 block">
              Спорт түрі
            </label>
            <select
              value={filters.sportType}
              onChange={(e) => setFilters({ ...filters, sportType: e.target.value })}
              className="w-full h-12 px-4 rounded-lg border border-[#D9D9D9] focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#EAFBF3]"
            >
              {SPORT_TYPES.map((sport) => (
                <option key={sport.value} value={sport.value}>
                  {sport.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="body-s text-[#4D4D4D] mb-3 block">
              Баға диапазоны (₸/сағат)
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Мин"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    minPrice: e.target.value ? Number(e.target.value) : null 
                  })}
                  className="w-full h-12 px-4 rounded-lg border border-[#D9D9D9] focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#EAFBF3]"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Макс"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    maxPrice: e.target.value ? Number(e.target.value) : null 
                  })}
                  className="w-full h-12 px-4 rounded-lg border border-[#D9D9D9] focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#EAFBF3]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={handleReset}
            >
              Тазалау
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleApply}
            >
              Қолдану
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

