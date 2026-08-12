import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';

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
