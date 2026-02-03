import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// POST - Criar nova nota
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      userId,
      content
    } = body;

    if (!leadId || !userId || !content) {
      return NextResponse.json(
        { error: 'Lead ID, User ID e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        leadId,
        createdById: userId,
        content
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true
          }
        },
        lead: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: note
    });
  } catch (error: any) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Erro ao criar nota', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Listar notas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const userId = searchParams.get('userId');

    const where: any = {};

    if (leadId) where.leadId = leadId;
    if (userId) where.createdById = userId;

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true
          }
        },
        lead: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true
          }
        }
      },
      take: 100
    });

    return NextResponse.json({
      success: true,
      data: notes
    });
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notas', details: error.message },
      { status: 500 }
    );
  }
}
