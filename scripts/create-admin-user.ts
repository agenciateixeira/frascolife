import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Criando usuário ADMIN no CRM...\n');

  try {
    // Busca o primeiro usuário do Supabase profiles
    const supabaseUser = await prisma.$queryRaw<any[]>`
      SELECT id, email, full_name
      FROM profiles
      LIMIT 1
    `;

    if (!supabaseUser || supabaseUser.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no Supabase profiles');
      console.log('💡 Faça login no sistema primeiro para criar seu perfil');
      return;
    }

    const profile = supabaseUser[0];
    console.log(`📧 Usuário encontrado: ${profile.email}`);

    // Verifica se já existe no CRM
    const existing = await prisma.user.findUnique({
      where: { supabaseId: profile.id }
    });

    if (existing) {
      console.log('ℹ️  Usuário já existe no CRM');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Role: ${existing.role}`);
      console.log(`   Ativo: ${existing.isActive}`);
      return;
    }

    // Criar usuário ADMIN
    const user = await prisma.user.create({
      data: {
        supabaseId: profile.id,
        email: profile.email,
        fullName: profile.full_name || profile.email,
        role: 'ADMIN',
        isActive: true,
        lastLoginAt: new Date()
      }
    });

    console.log('\n✅ Usuário ADMIN criado com sucesso!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.fullName}`);
    console.log(`   Role: ${user.role}`);

    console.log('\n🎉 Pronto! Você pode fazer login no CRM agora.');

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
