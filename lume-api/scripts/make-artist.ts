import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'manasjadhavtemp@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user && user.role !== 'ARTIST') {
    await prisma.user.update({
      where: { email },
      data: { role: 'ARTIST' },
    });
    
    await prisma.artistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        location: 'Mumbai',
        bio: 'Artist bio',
        experience: 5,
        specialties: ['Bridal Makeup']
      }
    });
    console.log('Converted user to ARTIST');
  } else {
    console.log('User not found or already ARTIST');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
