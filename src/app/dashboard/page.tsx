'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', session.user.id)
      .single();

    setUser({
      id: session.user.id,
      email: session.user.email,
      name: (profile as any)?.full_name || session.user.email,
      role: (profile as any)?.role || 'user'
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25d366] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Bem-vindo de volta, {user.name}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-[#25d366] to-[#20bd5a] rounded-lg p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Total de Leads</div>
            <div className="text-3xl font-bold mt-2">1,000,000</div>
            <div className="text-xs opacity-75 mt-1">CNPJs cadastrados</div>
          </div>

          {/* Card 2 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Campanhas Ativas</div>
            <div className="text-3xl font-bold mt-2">0</div>
            <div className="text-xs opacity-75 mt-1">Em andamento</div>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90">Ligações Hoje</div>
            <div className="text-3xl font-bold mt-2">0</div>
            <div className="text-xs opacity-75 mt-1">Nenhuma ligação registrada</div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações da Conta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium text-gray-900 mt-1">{user.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Nome:</span>
              <p className="font-medium text-gray-900 mt-1">{user.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Perfil:</span>
              <p className="font-medium text-gray-900 mt-1 capitalize">{user.role}</p>
            </div>
            <div>
              <span className="text-gray-600">ID:</span>
              <p className="font-mono text-xs text-gray-900 mt-1">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow border border-gray-200 text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Funcionalidades em Desenvolvimento
          </h3>
          <p className="text-sm text-gray-600">
            Gestão de leads, campanhas e cold calling em breve!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
