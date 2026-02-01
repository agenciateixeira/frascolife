// Edge Function: Ativar conta de usuário
// Cria usuário no Supabase Auth + Profile + Atualiza pre_user

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ActivateAccountRequest {
  identifier: string // email ou telefone
  password: string
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { identifier, password }: ActivateAccountRequest = await req.json()

    // Validações básicas
    if (!identifier || !password) {
      return new Response(
        JSON.stringify({ error: 'Identificador e senha são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter no mínimo 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cliente Supabase com service_role (admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 1. Buscar pre_user
    const { data: preUser, error: preUserError } = await supabaseAdmin
      .from('pre_users')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .eq('status', 'invited')
      .single()

    if (preUserError || !preUser) {
      return new Response(
        JSON.stringify({
          error: 'Usuário não encontrado ou já ativado',
          code: 'PRE_USER_NOT_FOUND',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar que tem email (obrigatório para Supabase Auth)
    if (!preUser.email) {
      return new Response(
        JSON.stringify({
          error: 'Email não cadastrado para este usuário',
          code: 'EMAIL_REQUIRED',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: preUser.email,
      password: password,
      email_confirm: true, // Auto-confirma email
      user_metadata: {
        full_name: preUser.full_name,
        role: preUser.role,
      },
    })

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError)

      // Verificar se usuário já existe
      if (authError.message?.includes('already registered')) {
        return new Response(
          JSON.stringify({
            error: 'Este email já está em uso',
            code: 'EMAIL_ALREADY_EXISTS',
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          error: 'Erro ao criar usuário',
          details: authError.message,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Criar profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authUser.user.id,
      email: preUser.email,
      phone: preUser.phone,
      full_name: preUser.full_name,
      role: preUser.role,
    })

    if (profileError) {
      console.error('Erro ao criar profile:', profileError)

      // Rollback: deletar usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)

      return new Response(
        JSON.stringify({
          error: 'Erro ao criar perfil do usuário',
          details: profileError.message,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Atualizar pre_user para status = 'active'
    const { error: updateError } = await supabaseAdmin
      .from('pre_users')
      .update({ status: 'active' })
      .eq('id', preUser.id)

    if (updateError) {
      console.error('Erro ao atualizar pre_user:', updateError)
      // Não fazer rollback aqui, pois o usuário foi criado com sucesso
    }

    // 5. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conta ativada com sucesso',
        user: {
          id: authUser.user.id,
          email: preUser.email,
          full_name: preUser.full_name,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Erro inesperado:', error)
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
