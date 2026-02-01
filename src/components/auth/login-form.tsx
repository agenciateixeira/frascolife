'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/auth/schema';
import { useAuth } from '@/hooks/use-auth';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const result = await login(data.identifier, data.password);

    if (result.success) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email/Phone Input */}
        <div className="space-y-1.5">
          <label htmlFor="identifier" className="text-sm font-medium text-gray-700">
            Email ou Telefone
          </label>
          <Input
            id="identifier"
            type="text"
            placeholder="seu@email.com"
            className={cn(
              "h-11 border-gray-300 focus:border-[#25d366] focus:ring-[#25d366]",
              errors.identifier && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            {...register('identifier')}
            disabled={isLoading}
          />
          {errors.identifier && (
            <p className="text-xs text-red-600">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(
                "h-11 pr-10 border-gray-300 focus:border-[#25d366] focus:ring-[#25d366]",
                errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-[#25d366] hover:bg-[#20bd5a] text-white font-medium mt-6 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      {/* Links */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
        <Link
          href="/recuperar-senha"
          className="text-sm text-gray-600 hover:text-[#25d366] transition-colors"
        >
          Esqueceu a senha?
        </Link>
        <Link
          href="/primeiro-acesso"
          className="text-sm text-gray-600 hover:text-[#25d366] transition-colors"
        >
          Primeiro acesso
        </Link>
      </div>
    </div>
  );
}