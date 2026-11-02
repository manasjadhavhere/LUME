import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const adminEmail = process.env.ADMIN_EMAIL || 'Hellolumeadmin@gmail.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
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
