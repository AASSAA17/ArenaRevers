import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="body-s text-[#4D4D4D]">
          {label}
        </label>
      )}
      <input
        className={`
          h-12 px-4 rounded-lg border
          ${error ? 'border-[#E74C3C]' : 'border-[#D9D9D9]'}
          focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#EAFBF3]
          placeholder:text-[#808080]
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="caption-r text-[#E74C3C]">
          {error}
        </span>
      )}
    </div>
  );
}
