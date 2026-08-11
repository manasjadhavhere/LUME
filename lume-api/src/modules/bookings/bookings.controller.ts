import { Request, Response, NextFunction } from 'express';
import * as BookingsService from './bookings.service';

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await BookingsService.createBooking(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    let bookings;

    if (req.user!.role === 'ARTIST') {
      bookings = await BookingsService.getArtistBookings(req.user!.userId, status as string);
    } else {
      bookings = await BookingsService.getClientBookings(req.user!.userId, status as string);
    }

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, cancelReason } = req.body;
    const booking = await BookingsService.updateBookingStatus(
      req.user!.userId,
      req.params.id as string,
      status,
      cancelReason
    );
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = req.body;
    const booking = await BookingsService.cancelBookingAsClient(req.user!.userId, req.params.id as string, reason);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}
