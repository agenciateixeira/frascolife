'use client';

import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  async function checkIfLoggedIn() {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Já está logado, redireciona para dashboard
      router.push('/dashboard');
      return;
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25d366]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: 'linear-gradient(-45deg, #ffffff, #f0f9ff, #ecfdf5, #f0fdf4, #ffffff, #e0f2fe, #d1fae5)',
        }}
      />

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #25d366 1px, transparent 1px),
            linear-gradient(to bottom, #25d366 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/login" className="inline-block cursor-pointer hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="FrascoLife"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <p className="text-sm text-[#313131] mt-4">
            Entre com sua conta
          </p>
        </div>

        {/* Card com sombra */}
        <div className="bg-white rounded-[15px] shadow-xl border border-gray-200/50 p-8 backdrop-blur-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}