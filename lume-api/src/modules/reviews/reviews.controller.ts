import { Request, Response, NextFunction } from 'express';
import * as ReviewsService from './reviews.service';

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await ReviewsService.createReview(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function getArtistReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ReviewsService.getArtistReviews(req.params.artistId as string);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function replyToReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { reply } = req.body;
    const review = await ReviewsService.replyToReview(req.user!.userId, req.params.id as string, reply);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}
