import React from 'react';
import { PasswordStrength } from '../utils/validation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

export function PasswordStrengthIndicator({ strength, password }: PasswordStrengthIndicatorProps) {
  if (!password || password.length === 0) return null;

  const getStrengthText = () => {
    switch (strength) {
      case 'weak':
        return 'Әлсіз';
      case 'medium':
        return 'Орташа';
      case 'strong':
        return 'Күшті';
      default:
        return '';
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthWidth = () => {
    switch (strength) {
      case 'weak':
        return '33%';
      case 'medium':
        return '66%';
      case 'strong':
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="body-s text-[#4D4D4D]">Құпия сөз күші:</span>
        <span className={`body-s font-medium ${
          strength === 'weak' ? 'text-red-500' :
          strength === 'medium' ? 'text-yellow-500' :
          strength === 'strong' ? 'text-green-500' : 'text-gray-500'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
          style={{ width: getStrengthWidth() }}
        />
      </div>
    </div>
  );
}

