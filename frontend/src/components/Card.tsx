import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export function Card({ children, className = '', padding = 'md', shadow = true }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`
      bg-white rounded-xl
      ${shadow ? 'shadow-[0px_2px_6px_rgba(0,0,0,0.08)] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.12)] transition-shadow' : ''}
      ${paddings[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
}
