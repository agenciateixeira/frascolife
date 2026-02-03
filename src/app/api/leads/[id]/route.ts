import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET - Buscar lead por ID com todos os relacionamentos
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        },
        calls: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        },
        emails: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        },
        whatsappMessages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
          take: 50,
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            createdBy: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        },
        opportunities: {
          orderBy: { createdAt: 'desc' }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lead', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar lead', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Deletar lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.lead.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Lead deletado com sucesso'
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar lead', details: error.message },
      { status: 500 }
    );
  }
}
