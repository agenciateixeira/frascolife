'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Schema de validação
const step1Schema = z.object({
  identifier: z.string().min(1, 'Email ou telefone é obrigatório')
});

const step2Schema = z.object({
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export function FirstAccessForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: identifier, 2: password, 3: success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [preUserData, setPreUserData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Step 1
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { identifier: '' }
  });

  // Form Step 2
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange' // Validar em tempo real
  });

  // Step 1: Verificar se pre_user existe
  const onCheckUser = async (data: Step1Data) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Chamar Supabase function check_pre_user_exists
      // Simulação por enquanto
      const response = await fetch('/api/auth/check-pre-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.identifier })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Usuário não encontrado no sistema');
      }

      setPreUserData(result.data);
      setIdentifier(data.identifier);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Erro ao verificar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Ativar conta
  const onActivateAccount = async (data: Step2Data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Chamar API Route activate
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao ativar conta');
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Erro ao ativar conta');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Verificar usuário
  if (step === 1) {
    return (
      <div className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Primeiro Acesso
          </h2>
          <p className="text-sm text-gray-600">
            Digite seu email ou telefone para verificar se você possui um convite
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={step1Form.handleSubmit(onCheckUser)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-sm font-medium text-gray-700">
              Email ou Telefone
            </label>
            <Input
              id="identifier"
              type="text"
              placeholder="seu@email.com ou +55 11 99999-9999"
              className={cn(
                "h-11 border-gray-300 focus:border-[#25d366] focus:ring-[#25d366]",
                step1Form.formState.errors.identifier && "border-red-500"
              )}
              {...step1Form.register('identifier')}
              disabled={isLoading}
            />
            {step1Form.formState.errors.identifier && (
              <p className="text-xs text-red-600">
                {step1Form.formState.errors.identifier.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#25d366] hover:bg-[#20bd5a] text-white font-medium mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar'
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <Link
            href="/login"
            className="text-xs text-gray-500 hover:text-[#25d366] transition-colors"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Criar senha
  if (step === 2) {
    return (
      <div className="space-y-5">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <CheckCircle2 className="w-6 h-6 text-[#25d366]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Convite Encontrado!
          </h2>
          <p className="text-sm text-gray-600">
            Agora crie uma senha forte para sua conta
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={step2Form.handleSubmit(onActivateAccount)} className="space-y-4">
          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crie uma senha forte"
                className={cn(
                  "h-11 pr-10 border-gray-300 focus:border-[#25d366] focus:ring-[#25d366]",
                  step2Form.formState.errors.password && "border-red-500"
                )}
                {...step2Form.register('password')}
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
            {step2Form.formState.errors.password && (
              <p className="text-xs text-red-600">
                {step2Form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirmar Senha
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                className={cn(
                  "h-11 pr-10 border-gray-300 focus:border-[#25d366] focus:ring-[#25d366]",
                  step2Form.formState.errors.confirmPassword && "border-red-500"
                )}
                {...step2Form.register('confirmPassword')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
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
            {step2Form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-600">
                {step2Form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600">
            <p className="font-medium mb-1">A senha deve conter:</p>
            <ul className="space-y-0.5 ml-4 list-disc">
              <li>Mínimo de 8 caracteres</li>
              <li>Pelo menos uma letra maiúscula</li>
              <li>Pelo menos uma letra minúscula</li>
              <li>Pelo menos um número</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#25d366] hover:bg-[#20bd5a] text-white font-medium mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ativando conta...
              </>
            ) : (
              'Ativar Conta'
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Step 3: Sucesso
  return (
    <div className="space-y-6 text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <CheckCircle2 className="w-8 h-8 text-[#25d366]" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Conta Ativada!
        </h2>
        <p className="text-gray-600">
          Sua conta foi ativada com sucesso. Agora você pode fazer login.
        </p>
      </div>

      <Button
        onClick={() => window.location.href = '/login'}
        className="w-full h-11 bg-[#25d366] hover:bg-[#20bd5a] text-white font-medium"
      >
        Ir para Login
      </Button>
    </div>
  );
}
