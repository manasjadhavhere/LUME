import prisma from '../../lib/prisma';

export async function broadcastWebsiteUpdate(input: { title: string; message: string }) {
  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
  return prisma.notification.createMany({ data: users.map(({ id }) => ({
    ...input, userId: id, type: 'WEBSITE_UPDATE',
  })) });
}
