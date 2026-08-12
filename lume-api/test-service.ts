import { registerUser } from './src/modules/auth/auth.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const data = {
      email: 'realartisttest@example.com',
      password: 'password123',
      name: 'Real Artist',
      role: 'ARTIST' as const
    };
    const res = await registerUser(data);
    console.log('Resulting user:', res.user);
    const dbUser = await prisma.user.findUnique({ where: { email: 'realartisttest@example.com' } });
    console.log('DB user role:', dbUser?.role);
  } catch(e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}
main();
