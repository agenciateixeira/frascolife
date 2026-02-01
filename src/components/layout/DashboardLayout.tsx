'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  Home,
  Users,
  Phone,
  BarChart3,
  Settings,
  Tag,
  Calendar,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Campanhas', href: '/dashboard/campanhas', icon: Tag },
    { name: 'Ligações', href: '/dashboard/ligacoes', icon: Phone },
    { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
    { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  ];

  // Iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-[#25d366] transition-colors group"
                >
                  <Icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-[#25d366]" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left: Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Center: Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/logo.png"
                  alt="FrascoLife"
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Right: User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                {/* User Avatar */}
                <div className="w-9 h-9 bg-gradient-to-br from-[#25d366] to-[#20bd5a] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                  {getInitials(user.name)}
                </div>

                {/* User Info (hidden on mobile) */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  ></div>

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/dashboard/perfil"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Meu Perfil
                    </Link>

                    <Link
                      href="/dashboard/configuracoes"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Configurações
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
