import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export function Rating({ value, max = 5, size = 20, onChange, readonly = true }: RatingProps) {
  const handleClick = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const isFilled = i < Math.floor(value);
        const isHalf = !isFilled && i < value && value % 1 !== 0;
        
        return (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
          >
            <Star
              size={size}
              className={
                isFilled 
                  ? 'fill-[#2ECC71] text-[#2ECC71]' 
                  : 'text-[#D9D9D9]'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
