'use client';

import { useState } from 'react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Menu, X, Shield, Phone, Mail, Users, BarChart3 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Mobile */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <BrandLogo size="medium" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Brand Side - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
          <div className="text-white">
            <BrandLogo variant="white" size="large" className="mb-8" />
            
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  {title || "Bem-vindo ao FrascoLife CRM"}
                </h1>
                <p className="text-blue-100 text-lg leading-relaxed">
                  {subtitle || "Sistema completo de cold calling com IA para gerenciar milhões de leads de CNPJ"}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="text-blue-100">Segurança enterprise-grade</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-blue-100">Gestão de 1M+ leads CNPJ</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-blue-100">Integração telefônica avançada</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <span className="text-blue-100">Analytics em tempo real</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-blue-200 text-sm mt-auto">
            © 2026 FrascoLife. Todos os direitos reservados.
          </div>
        </div>

        {/* Right: Form Side */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-8">
              <BrandLogo size="large" className="mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {title || "Bem-vindo de volta"}
              </h1>
              <p className="text-gray-600">
                {subtitle || "Entre na sua conta FrascoLife CRM"}
              </p>
            </div>

            {/* Form Content */}
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 p-4">
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Recursos
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Preços
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Suporte
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}