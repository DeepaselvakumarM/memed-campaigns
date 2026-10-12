import request from 'supertest';
import { createApp } from '../../src/app';
import { Campaign } from '../../src/models/Campaign';
import { Submission } from '../../src/models/Submission';
import { clearTestDb, startTestDb, stopTestDb } from './testDb';

const app = createApp();

const LADDER = [
  { viewThreshold: 10_000, payout: 500 },
  { viewThreshold: 50_000, payout: 2_000 },
  { viewThreshold: 100_000, payout: 5_000 },
];

let userCounter = 0;

async function signup(role: 'brand' | 'creator'): Promise<string> {
  userCounter += 1;
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ name: `${role} ${userCounter}`, email: `${role}${userCounter}@test.com`, password: 'password123', role })
    .expect(201);
  return res.body.token as string;
}

async function createCampaign(brandToken: string, totalBudget: number): Promise<string> {
  const res = await request(app)
    .post('/api/campaigns')
    .set('Authorization', `Bearer ${brandToken}`)
    .send({ name: 'Diwali Launch', platform: 'instagram', totalBudget, milestones: LADDER })
    .expect(201);
  return res.body.campaign.id as string;
}

let postCounter = 0;

async function submitPost(creatorToken: string, campaignId: string): Promise<string> {
  postCounter += 1;
  const res = await request(app)
    .post('/api/submissions')
    .set('Authorization', `Bearer ${creatorToken}`)
    .send({ campaignId, postUrl: `https://www.instagram.com/reel/post${postCounter}/` })
    .expect(201);
  return res.body.submission.id as string;
}

function setViews(submissionId: string, views: number) {
  return request(app).patch(`/api/submissions/${submissionId}/views`).send({ views });
}

beforeAll(startTestDb);
afterEach(clearTestDb);
afterAll(stopTestDb);

describe('auth', () => {
  it('signs up, logs in and returns the current user', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Acme', email: 'Acme@Test.com', password: 'password123', role: 'brand' })
      .expect(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'acme@test.com', password: 'password123' })
      .expect(200);

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`).expect(200);
    expect(me.body.user).toMatchObject({ name: 'Acme', email: 'acme@test.com', role: 'brand' });
    expect(me.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email and a wrong password', async () => {
    const body = { name: 'Acme', email: 'acme@test.com', password: 'password123', role: 'brand' };
    await request(app).post('/api/auth/signup').send(body).expect(201);
    await request(app).post('/api/auth/signup').send(body).expect(409);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'acme@test.com', password: 'wrong-password' })
      .expect(401);
    expect(res.body.error).toBe('Email or password is incorrect.');
  });

  it('rejects requests without a valid token', async () => {
    await request(app).get('/api/campaigns/mine').expect(401);
    await request(app).get('/api/campaigns/mine').set('Authorization', 'Bearer not-a-token').expect(401);
  });
});

describe('roles', () => {
  it('only brands can create campaigns and only creators can submit posts', async () => {
    const brand = await signup('brand');
    const creator = await signup('creator');
    const campaignId = await createCampaign(brand, 10_000);

    await request(app).post('/api/campaigns').set('Authorization', `Bearer ${creator}`).send({}).expect(403);
    await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${brand}`)
      .send({ campaignId, postUrl: 'https://instagram.com/p/abc' })
      .expect(403);
  });

  it("a brand cannot see another brand's campaign submissions", async () => {
    const campaignId = await createCampaign(await signup('brand'), 10_000);
    const otherBrand = await signup('brand');
    await request(app)
      .get(`/api/campaigns/${campaignId}/submissions`)
      .set('Authorization', `Bearer ${otherBrand}`)
      .expect(404);
  });
});

describe('submissions', () => {
  it('rejects a link from the wrong platform and a duplicate post', async () => {
    const campaignId = await createCampaign(await signup('brand'), 10_000);
    const creator = await signup('creator');
    const submit = (postUrl: string) =>
      request(app).post('/api/submissions').set('Authorization', `Bearer ${creator}`).send({ campaignId, postUrl });

    await submit('https://youtube.com/watch?v=abc').expect(400);
    await submit('https://www.instagram.com/reel/same/?igsh=1').expect(201);
    await submit('https://instagram.com/reel/same').expect(409);
  });

  it('rejects submissions to a campaign whose budget is used up', async () => {
    const brand = await signup('brand');
    const creator = await signup('creator');
    const campaignId = await createCampaign(brand, 5_000);
    await setViews(await submitPost(creator, campaignId), 100_000).expect(200);

    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creator}`)
      .send({ campaignId, postUrl: 'https://instagram.com/p/late' })
      .expect(409);
    expect(res.body.error).toMatch(/full budget/);

    const live = await request(app).get('/api/campaigns').set('Authorization', `Bearer ${creator}`).expect(200);
    expect(live.body.campaigns.map((c: { id: string }) => c.id)).not.toContain(campaignId);
  });
});

describe('PATCH /api/submissions/:id/views', () => {
  it('pays the highest milestone crossed and persists campaign spend and creator earnings', async () => {
    const brand = await signup('brand');
    const creator = await signup('creator');
    const campaignId = await createCampaign(brand, 20_000);
    const submissionId = await submitPost(creator, campaignId);

    const first = await setViews(submissionId, 60_000).expect(200);
    expect(first.body).toMatchObject({ paidNow: 2_000, cappedByBudget: false });

    const second = await setViews(submissionId, 150_000).expect(200);
    expect(second.body.paidNow).toBe(3_000);
    expect(second.body.submission).toMatchObject({ views: 150_000, reachedMilestone: 100_000, paidAmount: 5_000 });

    const repeat = await setViews(submissionId, 150_000).expect(200);
    expect(repeat.body.paidNow).toBe(0);

    const campaigns = await request(app).get('/api/campaigns/mine').set('Authorization', `Bearer ${brand}`).expect(200);
    expect(campaigns.body.campaigns[0]).toMatchObject({ spentBudget: 5_000, remainingBudget: 15_000, submissionCount: 1 });

    const earnings = await request(app)
      .get('/api/creators/me/earnings')
      .set('Authorization', `Bearer ${creator}`)
      .expect(200);
    expect(earnings.body).toMatchObject({ totalEarnings: 5_000, totalEntitled: 5_000, unpaidDueToBudget: 0 });
  });

  it('caps the payout at the remaining budget', async () => {
    const brand = await signup('brand');
    const creator = await signup('creator');
    const campaignId = await createCampaign(brand, 6_000);
    const a = await submitPost(creator, campaignId);
    const b = await submitPost(creator, campaignId);

    await setViews(a, 100_000).expect(200); // ₹5,000 paid, ₹1,000 left
    const capped = await setViews(b, 100_000).expect(200);
    expect(capped.body).toMatchObject({
      paidNow: 1_000,
      cappedByBudget: true,
      campaign: { spentBudget: 6_000, remainingBudget: 0 },
    });
    expect(capped.body.submission).toMatchObject({ entitledAmount: 5_000, paidAmount: 1_000, unpaidDueToBudget: 4_000 });
  });

  it('never overspends the budget when many view updates arrive at the same time', async () => {
    const brand = await signup('brand');
    const creator = await signup('creator');
    const totalBudget = 12_000; // room for two full ₹5,000 payouts plus a partial one
    const campaignId = await createCampaign(brand, totalBudget);
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) {
      ids.push(await submitPost(creator, campaignId));
    }

    const responses = await Promise.all(ids.map((id) => setViews(id, 100_000)));
    expect(responses.every((res) => res.status === 200)).toBe(true);

    const campaign = await Campaign.findById(campaignId).lean();
    const submissions = await Submission.find({ campaign: campaignId }).lean();
    const totalPaid = submissions.reduce((sum, s) => sum + s.paidAmount, 0);

    expect(campaign?.spentBudget).toBe(totalBudget);
    expect(totalPaid).toBe(totalBudget); // the ledger and the budget agree
  });

  it('rejects a view count lower than the current one', async () => {
    const campaignId = await createCampaign(await signup('brand'), 10_000);
    const submissionId = await submitPost(await signup('creator'), campaignId);
    await setViews(submissionId, 20_000).expect(200);

    const res = await setViews(submissionId, 5_000).expect(400);
    expect(res.body.error).toMatch(/^View count must be between 20,000 and/);
  });

  it('validates the body and returns 404 for an unknown submission', async () => {
    await setViews('000000000000000000000000', 10).expect(404);
    await setViews('not-an-id', 10).expect(404);
    const res = await request(app).patch('/api/submissions/000000000000000000000000/views').send({}).expect(400);
    expect(res.body.error).toBe('View count is required.');
  });
});
