import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import prisma from '../../lib/prisma';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.getMe(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.updateMe(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatarUrl: req.file.path },
    });

    res.json({
      success: true,
      data: { avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    next(err);
  }
}

