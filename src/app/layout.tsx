import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FrascoLife CRM',
  description: 'Sistema de CRM com Cold Calling IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
