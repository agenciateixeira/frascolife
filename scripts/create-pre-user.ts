import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function createPreUser() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const preUser = {
    email: 'guisdomkt@gmail.com',
    phone: '+5511999999999',
    full_name: 'Guilherme Teixeira'
  };

  console.log('📝 Criando pré-usuário...');
  console.log('Email:', preUser.email);
  console.log('Nome:', preUser.full_name);
  console.log('Phone:', preUser.phone);

  const { data, error } = await supabase
    .from('pre_users')
    .insert([preUser])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      console.error('❌ Erro: Este email já está cadastrado no sistema.');
    } else {
      console.error('❌ Erro ao criar pré-usuário:', error);
    }
    process.exit(1);
  }

  console.log('✅ Pré-usuário criado com sucesso!');
  console.log('📧 Email:', data.email);
  console.log('🆔 ID:', data.id);
  console.log('\n🔗 Próximos passos:');
  console.log('1. Acesse: http://localhost:3000/primeiro-acesso');
  console.log('2. Digite o email:', preUser.email);
  console.log('3. Crie uma senha forte');
  console.log('4. Faça login!\n');
}

createPreUser().catch(console.error);
