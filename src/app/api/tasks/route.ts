import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// POST - Criar nova tarefa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      userId,
      title,
      description,
      dueDate,
      priority,
      status
    } = body;

    if (!leadId || !userId || !title || !dueDate) {
      return NextResponse.json(
        { error: 'Lead ID, User ID, título e data de vencimento são obrigatórios' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        leadId,
        assignedToId: userId,
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        status: status || 'TODO'
      },
      include: {
        assignedTo: {
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
      data: task
    });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tarefa', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Listar tarefas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};

    if (leadId) where.leadId = leadId;
    if (userId) where.assignedToId = userId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        assignedTo: {
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
      data: tasks
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tarefas', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar tarefa
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID é obrigatório' },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined
      },
      include: {
        assignedTo: {
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
      data: task
    });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa', details: error.message },
      { status: 500 }
    );
  }
}
