import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform';
  
  const variants = {
    primary: 'bg-[#2ECC71] text-white hover:bg-[#27AE60] active:bg-[#27AE60] hover:shadow-md',
    secondary: 'bg-white text-[#1A1A1A] border border-[#D9D9D9] hover:border-[#808080] hover:bg-[#F5F5F5] hover:shadow-sm',
    ghost: 'bg-transparent text-[#4D4D4D] hover:bg-[#F5F5F5]',
    destructive: 'bg-[#E74C3C] text-white hover:bg-[#C0392B] hover:shadow-md'
  };
  
  const sizes = {
    sm: 'h-10 px-4 rounded-md',
    md: 'h-12 px-6 rounded-lg',
    lg: 'h-14 px-8 rounded-lg'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
