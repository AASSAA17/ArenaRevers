import React from 'react';

type TagVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}

export function Tag({ children, variant = 'default', className = '' }: TagProps) {
  const variants = {
    default: 'bg-[#F5F5F5] text-[#4D4D4D]',
    success: 'bg-[#EAFBF3] text-[#2ECC71]',
    warning: 'bg-[#FEF9E7] text-[#F1C40F]',
    error: 'bg-[#FDEDEC] text-[#E74C3C]',
    info: 'bg-[#EBF5FB] text-[#3498DB]'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full caption-r ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
