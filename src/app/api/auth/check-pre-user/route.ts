import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email ou telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Chamar a function check_pre_user_exists
    const { data, error } = await supabase.rpc('check_pre_user_exists', {
      p_identifier: identifier
    });

    if (error) {
      console.error('Error calling check_pre_user_exists:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar usuário' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Usuário não encontrado. Solicite um convite ao administrador.' },
        { status: 404 }
      );
    }

    // Verificar se já foi ativado
    if (data.is_active) {
      return NextResponse.json(
        { error: 'Esta conta já foi ativada. Faça login normalmente.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: data.email,
        phone: data.phone,
        name: data.name
      }
    });
  } catch (error) {
    console.error('Error in check-pre-user:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
