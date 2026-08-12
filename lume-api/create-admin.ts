import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lume.in' },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: 'admin@lume.in',
      passwordHash,
      role: 'ADMIN',
      name: 'Lume Administrator',
    },
  });

  console.log('✅ Admin user created/updated successfully:');
  console.log('Email:', admin.email);
  console.log('Role:', admin.role);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
