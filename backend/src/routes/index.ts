import { Router } from 'express';
import * as auth from '../controllers/authController';
import * as campaigns from '../controllers/campaignController';
import * as submissions from '../controllers/submissionController';
import { requireAuth, requireRole } from '../middleware/auth';

export const apiRouter = Router();

// Auth
apiRouter.post('/auth/signup', auth.signup);
apiRouter.post('/auth/login', auth.login);
apiRouter.get('/auth/me', requireAuth, auth.me);

// Campaigns
apiRouter.post('/campaigns', requireAuth, requireRole('brand'), campaigns.createCampaign);
apiRouter.get('/campaigns/mine', requireAuth, requireRole('brand'), campaigns.listMyCampaigns);
apiRouter.get('/campaigns/:id/submissions', requireAuth, requireRole('brand'), campaigns.listCampaignSubmissions);
apiRouter.get('/campaigns', requireAuth, campaigns.listLiveCampaigns);

// Submissions & earnings
apiRouter.post('/submissions', requireAuth, requireRole('creator'), submissions.createSubmission);
// Simulates platform view data, so intentionally has no role check (per the brief).
apiRouter.patch('/submissions/:id/views', submissions.updateViews);
apiRouter.get('/creators/me/earnings', requireAuth, requireRole('creator'), submissions.getMyEarnings);
