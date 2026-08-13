import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    await prisma.notification.updateMany({
      where: { id: id as string, userId },
      data: { isRead: true },
    });
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
