'use client';

import { useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (identifier: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const supabase = createBrowserClient();
      let email = identifier;

      // Se for telefone, buscar o email
      const isPhone = identifier.startsWith('+') || /^\d+$/.test(identifier.replace(/[\s()-]/g, ''));

      if (isPhone) {
        const normalized = identifier.replace(/[\s()-]/g, '');
        const { data: emailData, error: emailError } = await supabase.rpc('get_email_by_phone' as any, {
          p_phone: normalized
        } as any);

        if (emailError || !emailData) {
          throw new Error('Telefone não encontrado');
        }

        email = emailData;
      }

      // Autenticar com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao fazer login');
      }

      // Buscar dados do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', authData.user.id)
        .single();

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: (profile as any)?.full_name || authData.user.email!,
        role: (profile as any)?.role || 'user'
      };

      setAuthState({
        user,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMsg = 'Email ou senha inválidos';

      if (error.message === 'Invalid login credentials') {
        errorMsg = 'Email ou senha inválidos';
      } else if (error.message === 'Telefone não encontrado') {
        errorMsg = 'Telefone não encontrado no sistema';
      } else if (error.message) {
        errorMsg = error.message;
      }

      setAuthState({
        user: null,
        isLoading: false,
        error: errorMsg,
      });

      return { success: false, error: errorMsg };
    }
  }, []);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const user: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: 'user'
      };
      
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      
      return { success: true, user };
    } catch (error) {
      const errorMsg = 'Erro ao criar conta. Tente novamente.';
      setAuthState({
        user: null,
        isLoading: false,
        error: errorMsg,
      });
      
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    clearError,
  };
}