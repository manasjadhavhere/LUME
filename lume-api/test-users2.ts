import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { name: true, email: true, role: true, createdAt: true } });
  console.log(users);
}
main();
