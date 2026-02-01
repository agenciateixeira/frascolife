import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      pre_users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          full_name: string
          role: string
          status: 'invited' | 'active' | 'disabled'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pre_users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pre_users']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      companies: {
        Row: {
          id: string
          cnpj: string
          cnpjBase: string
          cnpjOrder: string
          cnpjDv: string
          matrizFilial: string
          razaoSocial: string | null
          nomeFantasia: string | null
          situacaoCadastral: string
          dataSituacao: string | null
          dataAbertura: string | null
          cnaePrincipal: string | null
          cnaeSecundario: string | null
          tipoLogradouro: string | null
          logradouro: string | null
          numero: string | null
          complemento: string | null
          bairro: string | null
          cep: string | null
          uf: string | null
          municipio: string | null
          ddd1: string | null
          telefone1: string | null
          ddd2: string | null
          telefone2: string | null
          dddFax: string | null
          fax: string | null
          email: string | null
          createdAt: string
          updatedAt: string
        }
      }
    }
  }
}

// Client-side Supabase
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side Supabase (para API routes)
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
