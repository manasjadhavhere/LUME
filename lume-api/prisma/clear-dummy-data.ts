import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing dummy data from LUME database...');

  const dummyEmails = [
    'aria@lume.in',
    'sia@lume.in',
    'riya@lume.in',
    'ananya@lume.in',
    'kavya@lume.in',
    'diya@lume.in',
    'priya@demo.com'
  ];

  const result = await prisma.user.deleteMany({
    where: {
      email: {
        in: dummyEmails
      }
    }
  });

  console.log(`Successfully deleted ${result.count} dummy users.`);
}

main()
  .catch((e) => {
    console.error('Error clearing data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
