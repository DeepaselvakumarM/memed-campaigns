import type { Request, Response } from 'express';
import { z } from 'zod';
import { getAuth } from '../middleware/auth';
import { PLATFORMS } from '../models/Campaign';
import * as campaignService from '../services/campaignService';
import { createCampaignSchema } from '../validation/campaign.schemas';
import { pickedOption } from '../validation/common';

const listQuerySchema = z.object({ platform: pickedOption('Platform', PLATFORMS).optional() });

export async function createCampaign(req: Request, res: Response): Promise<void> {
  const input = createCampaignSchema.parse(req.body);
  res.status(201).json({ campaign: await campaignService.createCampaign(getAuth(req).userId, input) });
}

export async function listMyCampaigns(req: Request, res: Response): Promise<void> {
  res.json({ campaigns: await campaignService.listBrandCampaigns(getAuth(req).userId) });
}

export async function listLiveCampaigns(req: Request, res: Response): Promise<void> {
  const { platform } = listQuerySchema.parse(req.query);
  res.json({ campaigns: await campaignService.listLiveCampaigns(platform) });
}

export async function listCampaignSubmissions(req: Request<{ id: string }>, res: Response): Promise<void> {
  const submissions = await campaignService.listCampaignSubmissions(getAuth(req).userId, req.params.id);
  res.json({ submissions });
}
