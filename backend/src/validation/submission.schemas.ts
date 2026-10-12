import { z } from 'zod';
import { pickedId, requiredText, wholeNumber } from './common';

export const MAX_VIEWS = 1_000_000_000_000;

export const createSubmissionSchema = z.object({
  campaignId: pickedId('Campaign'),
  postUrl: requiredText('Post link', { max: 500 }),
});

export const updateViewsSchema = z.object({
  views: wholeNumber('View count', { min: 0, max: MAX_VIEWS, allowZero: true }),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateViewsInput = z.infer<typeof updateViewsSchema>;
