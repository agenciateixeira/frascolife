'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showStrength?: boolean;
}

export function PasswordInput({
  label,
  error,
  showStrength = true,
  className,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const password = props.value as string || '';

  useEffect(() => {
    if (!password) {
      setStrength(null);
      return;
    }

    // Calculate password strength
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) setStrength('weak');
    else if (score <= 3) setStrength('medium');
    else setStrength('strong');
  }, [password]);

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getStrengthBg = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'weak': return 'Senha fraca';
      case 'medium': return 'Senha média';
      case 'strong': return 'Senha forte';
      default: return '';
    }
  };

  const getStrengthIcon = () => {
    switch (strength) {
      case 'weak': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'strong': return <Check className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-10",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrength && password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={cn("flex items-center space-x-1", getStrengthColor())}>
                {getStrengthIcon()}
                <span className="text-xs font-medium">{getStrengthText()}</span>
              </div>
            </div>
          </div>
          
          {/* Strength Bars */}
          <div className="flex space-x-1">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  strength && bar <= (strength === 'weak' ? 1 : strength === 'medium' ? 2 : 3)
                    ? getStrengthBg()
                    : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          
          {/* Requirements */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className={cn("flex items-center space-x-1", password.length >= 8 && "text-green-600")}>
              <Check className="h-3 w-3" />
              <span>Mínimo 8 caracteres</span>
            </div>
            <div className={cn("flex items-center space-x-1", /[A-Z]/.test(password) && /[a-z]/.test(password) && "text-green-600")}>
              <Check className="h-3 w-3" />
              <span>Letras maiúsculas e minúsculas</span>
            </div>
            <div className={cn("flex items-center space-x-1", /\d/.test(password) && "text-green-600")}>
              <Check className="h-3 w-3" />
              <span>Pelo menos um número</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}