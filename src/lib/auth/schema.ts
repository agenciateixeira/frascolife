import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email ou telefone é obrigatório')
    .transform((val) => val.trim())
    .refine((val) => {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Phone validation (E.164 format)
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      
      return emailRegex.test(val) || phoneRegex.test(val);
    }, 'Formato de email ou telefone inválido'),
    
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter letra maiúscula, minúscula e número'),
    
  rememberMe: z.boolean()
});

export const registerSchema = z.object({
  fullName: z.string()
    .min(3, 'Nome completo obrigatório')
    .max(100, 'Máximo 100 caracteres'),
    
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
    
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .optional(),
    
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter letra maiúscula, minúscula e número'),
    
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

export const forgotPasswordSchema = z.object({
  identifier: z.string()
    .min(1, 'Email ou telefone é obrigatório')
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    }, 'Formato de email ou telefone inválido')
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;