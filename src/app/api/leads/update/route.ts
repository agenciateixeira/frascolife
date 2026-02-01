import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[UPDATE] Request body:', body);

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    // Remove campos undefined/null do updateData
    const cleanData: any = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== '') {
        cleanData[key] = updateData[key];
      }
    });

    console.log('[UPDATE] Clean data:', cleanData);

    // Atualiza no banco
    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...cleanData,
        updatedAt: new Date()
      }
    });

    console.log('[UPDATE] Company updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Lead atualizado com sucesso',
      data: updated
    });

  } catch (error: any) {
    console.error('[UPDATE] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar lead', details: error.message },
      { status: 500 }
    );
  }
}
