import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.user.deleteMany({
    where: { email: { in: ['test.artist@lume.in', 'priya@demo.com'] } },
  });
  console.log(`Deleted ${deleted.count} test user(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
