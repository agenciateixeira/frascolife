import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'normal' | 'white';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function BrandLogo({ variant = 'normal', size = 'medium', className }: BrandLogoProps) {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl'
  };

  const textColors = {
    normal: 'text-gray-900',
    white: 'text-white'
  };

  const bgColors = {
    normal: 'bg-black',
    white: 'bg-white'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "inline-flex items-center justify-center rounded-xl",
        size === 'small' ? 'w-8 h-8' : size === 'medium' ? 'w-12 h-12' : 'w-16 h-16',
        bgColors[variant]
      )}>
        <span className={cn(
          "font-bold",
          sizeClasses[size],
          textColors[variant === 'white' ? 'normal' : 'white']
        )}>
          FL
        </span>
      </div>
      <span className={cn(
        "font-bold",
        sizeClasses[size],
        textColors[variant]
      )}>
        FrascoLife
      </span>
    </div>
  );
}