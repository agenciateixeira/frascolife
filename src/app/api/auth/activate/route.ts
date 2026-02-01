import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identificador e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    // Cliente Supabase com service_role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Buscar pre_user
    const { data: preUser, error: preUserError } = await supabase
      .from('pre_users')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .eq('status', 'invited')
      .single();

    if (preUserError || !preUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou já ativado' },
        { status: 404 }
      );
    }

    // Validar que tem email
    if (!preUser.email) {
      return NextResponse.json(
        { error: 'Email não cadastrado para este usuário' },
        { status: 400 }
      );
    }

    // 2. Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: preUser.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: preUser.full_name,
        role: preUser.role
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError);

      if (authError.message?.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Erro ao criar usuário', details: authError.message },
        { status: 500 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500 }
      );
    }

    // 3. Criar profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authUser.user.id,
      email: preUser.email,
      phone: preUser.phone,
      full_name: preUser.full_name,
      role: preUser.role
    });

    if (profileError) {
      console.error('Erro ao criar profile:', profileError);

      // Rollback: deletar usuário do Auth
      await supabase.auth.admin.deleteUser(authUser.user.id);

      return NextResponse.json(
        { error: 'Erro ao criar perfil do usuário', details: profileError.message },
        { status: 500 }
      );
    }

    // 4. Atualizar pre_user para status = 'active'
    const { error: updateError } = await supabase
      .from('pre_users')
      .update({ status: 'active' })
      .eq('id', preUser.id);

    if (updateError) {
      console.error('Erro ao atualizar pre_user:', updateError);
    }

    // 5. Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Conta ativada com sucesso',
      user: {
        id: authUser.user.id,
        email: preUser.email,
        full_name: preUser.full_name
      }
    });
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
