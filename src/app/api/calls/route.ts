import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// POST - Registrar nova ligação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      userId,
      duration,
      outcome,
      direction,
      recordingUrl,
      notes,
      fromNumber,
      toNumber,
      status
    } = body;

    if (!leadId || !userId) {
      return NextResponse.json(
        { error: 'Lead ID e User ID são obrigatórios' },
        { status: 400 }
      );
    }

    const call = await prisma.call.create({
      data: {
        leadId,
        userId,
        duration: duration || 0,
        outcome: outcome || 'NO_ANSWER',
        direction: direction || 'OUTBOUND',
        status: status || 'COMPLETED',
        fromNumber: fromNumber || 'N/A',
        toNumber: toNumber || 'N/A',
        recordingUrl,
        notes
      },
      include: {
        user: {
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

    // Atualizar o score do lead se a ligação foi bem-sucedida
    if (outcome === 'INTERESTED' || outcome === 'CALLBACK' || outcome === 'MEETING_SCHEDULED') {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          score: {
            increment: 5
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: call
    });
  } catch (error: any) {
    console.error('Error creating call:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar ligação', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Listar ligações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const userId = searchParams.get('userId');

    const where: any = {};

    if (leadId) where.leadId = leadId;
    if (userId) where.userId = userId;

    const calls = await prisma.call.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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
      data: calls
    });
  } catch (error: any) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ligações', details: error.message },
      { status: 500 }
    );
  }
}
