import { cn } from '@/lib/utils/cn';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]',
        {
          'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700': variant === 'primary',
          'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300': variant === 'secondary',
          'text-gray-600 hover:bg-gray-100 active:bg-gray-200': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700': variant === 'danger',
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-2.5 text-sm': size === 'md',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
