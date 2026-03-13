import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-md active:scale-95',
      secondary: 'bg-secondary text-white hover:opacity-90 shadow-md active:scale-95',
      outline: 'border-2 border-primary text-primary hover:bg-primary/5 active:scale-95',
      ghost: 'text-slate-600 hover:bg-slate-100 active:scale-95',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-6 py-2.5 rounded-xl font-medium',
      lg: 'px-8 py-3.5 text-lg rounded-2xl font-bold',
      icon: 'p-2 rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200',
              icon && 'pl-11',
              error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);

export const Avatar = ({ src, name, size = 'md', online, isDarkMode }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; online?: boolean; isDarkMode?: boolean }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
    xl: 'h-24 w-24 text-xl',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      <div className={cn(
        'rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white font-bold border-2 shadow-sm',
        isDarkMode ? 'border-slate-700' : 'border-white',
        sizes[size]
      )}>
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {online !== undefined && (
        <div className={cn(
          'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2',
          isDarkMode ? 'border-slate-800' : 'border-white',
          online ? 'bg-green-500' : 'bg-slate-300'
        )} />
      )}
    </div>
  );
};
