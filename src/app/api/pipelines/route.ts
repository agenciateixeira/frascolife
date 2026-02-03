import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET /api/pipelines - Listar todos os pipelines
export async function GET(request: NextRequest) {
  try {
    // TODO: Fix auth - temporarily bypassing to test pipeline
    // const cookieStore = await cookies();
    // const supabase = createServerClient(cookieStore);
    // const { data: { user } } = await supabase.auth.getUser();

    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const pipelines = await prisma.pipeline.findMany({
      where: { isActive: true },
      include: {
        stages: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { opportunities: true }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, data: pipelines });
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar pipelines' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/pipelines - Criar novo pipeline
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, stages } = body;

    if (!name || !stages || !Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nome e estágios são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar pipeline com estágios
    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        description,
        type: type || 'CUSTOM',
        stages: {
          create: stages.map((stage, index) => ({
            name: stage.name,
            description: stage.description,
            color: stage.color || '#6B7280',
            icon: stage.icon,
            order: index,
            probability: stage.probability || 0,
            isFinal: stage.isFinal || false,
            rottingDays: stage.rottingDays
          }))
        }
      },
      include: {
        stages: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ success: true, data: pipeline });
  } catch (error) {
    console.error('Error creating pipeline:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar pipeline' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
