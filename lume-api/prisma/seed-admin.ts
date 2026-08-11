/**
 * LUME Admin Seed Script
 * Creates an admin user and promotes first artist to admin.
 * Run with: npx ts-node prisma/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lume.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'LumeAdmin@2024';
  const adminName = process.env.ADMIN_NAME || 'LUME Admin';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    // Promote existing user to admin
    await prisma.user.update({ where: { email: adminEmail }, data: { role: 'ADMIN' } });
    console.log(`✅ Promoted ${adminEmail} to ADMIN`);
  } else {
    // Create new admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`✅ Created admin user: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ⚠️  Change this password in production!`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
