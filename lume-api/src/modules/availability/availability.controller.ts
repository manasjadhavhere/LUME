import { Request, Response, NextFunction } from 'express';
import * as AvailabilityService from './availability.service';

export async function getAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { fromDate, toDate } = req.query;
    const result = await AvailabilityService.getAvailability(
      req.params.artistId as string,
      fromDate as string,
      toDate as string
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function setAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, timeSlots } = req.body;
    const result = await AvailabilityService.upsertAvailability(
      req.user!.userId,
      req.params.artistId as string,
      date,
      timeSlots
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function setDefaultSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { days } = req.body;
    const result = await AvailabilityService.setDefaultSchedule(req.user!.userId, days);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getDefaultSchedule(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AvailabilityService.getMyDefaultSchedule(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function blockDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, reason } = req.body;
    const result = await AvailabilityService.blockDate(req.user!.userId, req.params.artistId as string, date, reason);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function unblockDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = req.body;
    await AvailabilityService.unblockDate(req.user!.userId, req.params.artistId as string, date);
    res.json({ success: true, message: 'Date unblocked' });
  } catch (err) { next(err); }
}
