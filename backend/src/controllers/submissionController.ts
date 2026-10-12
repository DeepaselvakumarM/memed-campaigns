import type { Request, Response } from 'express';
import { getAuth } from '../middleware/auth';
import * as submissionService from '../services/submissionService';
import { createSubmissionSchema, updateViewsSchema } from '../validation/submission.schemas';

export async function createSubmission(req: Request, res: Response): Promise<void> {
  const input = createSubmissionSchema.parse(req.body);
  res.status(201).json({ submission: await submissionService.createSubmission(getAuth(req).userId, input) });
}

export async function updateViews(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { views } = updateViewsSchema.parse(req.body);
  res.json(await submissionService.updateSubmissionViews(req.params.id, views));
}

export async function getMyEarnings(req: Request, res: Response): Promise<void> {
  res.json(await submissionService.getCreatorEarnings(getAuth(req).userId));
}
