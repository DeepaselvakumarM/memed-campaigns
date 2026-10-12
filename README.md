# Meme'd: Creator Campaign Marketplace

Brands run campaigns, and creators (meme pages, clip accounts, hype pages) post content for them on Instagram or YouTube. Creators are paid on a **milestone ladder**: the payout of the **highest milestone** their post has crossed. A campaign can **never pay out more than its budget**.

| | |
|---|---|
| **Live app** | _Added after deployment_ |
| **API** | _Added after deployment_ |
| **Stack** | Node.js · Express 5 · TypeScript · MongoDB (Mongoose 9) · Next.js 16 · TanStack Query · Jest |

> The API runs on Render's free tier, which sleeps after ~15 minutes idle. The first request after that can take ~30–50 seconds while it wakes up.

---

## Contents

- [Features](#features)
- [How payouts work](#how-payouts-work)
- [Assumptions](#assumptions)
- [Project structure](#project-structure)
- [Running locally](#running-locally)
- [Testing](#testing)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Design decisions and trade-offs](#design-decisions-and-trade-offs)

---

## Features

**Auth**
- JWT signup and login with two roles: `brand` and `creator`. Each role can only reach its own pages and endpoints.

**Brand**
- Create a campaign: name, platform (Instagram/YouTube), total budget and a milestone ladder (view threshold → payout).
- See each campaign's budget **spent vs. remaining**, live status and the posts submitted to it.

**Creator**
- Browse live campaigns (those with budget remaining) and submit a post link.
- See total earnings, plus each post's views, payout and next milestone.

**Views (simulated platform data)**
- `PATCH /api/submissions/:id/views` updates a post's view count and pays any newly reached milestone. As the brief specifies, it has no role check.
- Both dashboards have a small **"Simulate views (demo)"** control that calls this endpoint, so the payout flow can be tried from the UI.

---

## How payouts work

The core logic is a pure function, [`calculatePayout`](backend/src/services/payout.ts), with no database or framework code, so it is unit-tested directly.

With the ladder `10K → ₹500, 50K → ₹2,000, 100K → ₹5,000`:

| Views | Highest milestone crossed | Creator is entitled to |
|---|---|---|
| 9,999 | none | ₹0 |
| 10,000 | 10K | ₹500 |
| 75,000 | 50K | ₹2,000 (**not** ₹500 + ₹2,000) |
| 250,000 | 100K | ₹5,000 |

On every view update:

1. **Entitlement** = payout of the highest milestone where `views >= threshold`.
2. **Outstanding** = entitlement − amount already paid to this post. Only the difference is paid, so repeated updates never pay a milestone twice.
3. **Pay now** = `min(outstanding, campaign's remaining budget)`. This is the budget cap.

**Budget safety under concurrency.** Two view updates for the same campaign could arrive at the same moment, each reading the same "remaining budget". To prevent overspending:
- The update runs in a **MongoDB transaction**: the post's payout and the campaign's `spentBudget` change together or not at all. If two updates conflict, MongoDB rejects one and it is retried against fresh data.
- The budget write itself is a conditional `$inc` that only matches while `spentBudget + payment <= totalBudget`, as a last line of defence.

An integration test fires 10 simultaneous top-milestone updates at one campaign and checks that the amount spent exactly equals the budget, and that it matches the sum paid to posts.

---

## Assumptions

Where the brief left room for interpretation, these are the decisions made:

1. **"Crossed" includes reaching it exactly.** 10,000 views crosses the 10K milestone.
2. **Milestone payouts are cumulative totals, not increments.** Reaching 50K pays ₹2,000 in total (₹1,500 more if ₹500 was already paid), not ₹2,000 on top of ₹500.
3. **Partial payment when the budget runs short.** If the remaining budget can't cover a milestone, the creator receives whatever budget is left, and the campaign closes. The shortfall is recorded and shown as "earned but unpaid (budget ran out)", but it is never paid. The alternative, paying nothing unless the full amount fits, would leave budget stranded.
4. **First come, first served.** When several posts compete for the last of a budget, payouts go in the order view updates are processed.
5. **View counts only go up.** A lower view count than the current one is rejected (`400`), so a payout never has to be clawed back.
6. **A campaign is "live" while it has budget remaining.** Once fully spent it stops appearing to creators and stops accepting posts. There is no start/end date or pause in this scope.
7. **Milestone ladders must be strictly increasing.** Each milestone needs a different view threshold, each must pay more than the one below it, and no single payout may exceed the total budget. The ladder is stored sorted.
8. **Money is whole rupees** (integers), so floating-point rounding never applies.
9. **One post can be submitted only once, across all campaigns.** Links are normalized before the duplicate check (tracking parameters, `www.`/`m.` and `youtu.be` vs `youtube.com/watch?v=` are ignored), so the same post can't earn twice under a slightly different URL. Links must match the campaign's platform.
10. **Campaigns can't be edited or topped up after creation.** This keeps the budget rules simple and auditable.

---

## Project structure

One repository with two independent apps, each with its own `package.json`, tests and deployment.

```
.
├── backend/                    Express + TypeScript API
│   ├── src/
│   │   ├── config/             env validation (zod), database connection
│   │   ├── models/             Mongoose models: User, Campaign, Submission
│   │   ├── validation/         request schemas (zod) with field-labelled messages
│   │   ├── services/           business logic: payout (pure), campaigns, submissions, auth
│   │   ├── controllers/        thin HTTP handlers: parse input → call service → respond
│   │   ├── middleware/         auth (JWT + role checks), central error handler
│   │   ├── routes/             route table
│   │   └── utils/              AppError, post URL normalization
│   └── tests/
│       ├── unit/               payout + budget cap, campaign validation, URL rules
│       └── integration/        HTTP API against a real in-memory MongoDB replica set
├── frontend/                   Next.js (App Router) + TypeScript
│   └── src/
│       ├── app/                routes: /login, /signup, /brand, /creator
│       ├── features/           auth, brand, creator, campaigns (shared pieces)
│       ├── lib/                API client, session store, types, formatting
│       └── ui/                 small shared UI kit (button, fields, alerts, budget bar, table)
└── .github/workflows/ci.yml    lint, type-check, tests and build on every push
```

**Backend layering:** `routes → controllers → services → models`. Controllers only parse input and shape the response. All rules live in services, and the money logic is a pure function. Errors are thrown as `AppError` (expected, user-facing) or left as unexpected errors, and one error handler turns them into JSON responses. Express 5 forwards rejected promises from `async` handlers to that handler automatically, so no `try/catch` wrappers are needed in controllers.

---

## Running locally

**Prerequisites:** Node.js 20+, and a MongoDB **replica set**: a free MongoDB Atlas cluster works out of the box. Payout updates use transactions, which a standalone local `mongod` does not support.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm run dev               # http://localhost:4000
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string including a database name, e.g. `…mongodb.net/memed?retryWrites=true&w=majority` |
| `JWT_SECRET` | Random string, at least 32 characters |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `PORT` | Default `4000` |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins (default `http://localhost:3000`) |

The server validates these at startup and refuses to start with a clear message if one is missing.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                  # http://localhost:3000
```

### 3. Try it

1. Sign up as a **Brand** and create a campaign. The form is pre-filled with the example ladder.
2. In another browser or a private window, sign up as a **Creator**, open the campaign and submit an Instagram/YouTube post link, e.g. `https://www.instagram.com/reel/ABC123/`.
3. Use **Simulate views** to set, say, `60000`, then `120000`, and watch earnings and the brand's budget bar update.

---

## Testing

```bash
cd backend  && npm test     # 61 tests: unit + integration
cd frontend && npm test     # 21 tests: logic + components
```

**Backend unit tests.** The core money logic, tested without a database:
- [`payout.test.ts`](backend/tests/unit/payout.test.ts): highest milestone (not the sum), exact thresholds, incremental and idempotent payouts, and the **budget cap**. Covers paying in full when it fits, a partial payment when it doesn't, nothing once the budget is exhausted, and never exceeding the budget across many posts.
- [`campaignSchema.test.ts`](backend/tests/unit/campaignSchema.test.ts): ladder validation rules and messages.
- [`postUrl.test.ts`](backend/tests/unit/postUrl.test.ts): platform matching and duplicate-safe URL normalization.

**Backend integration tests.** [`api.test.ts`](backend/tests/integration/api.test.ts) runs over HTTP against a **real** MongoDB (an in-memory replica set via `mongodb-memory-server`, not a mocked database). It covers auth, role checks, payouts persisted end to end, the budget cap, and **10 concurrent view updates that must not overspend**. The first run downloads a MongoDB binary (~70 MB) to a user cache.

**Frontend tests.** Jest and React Testing Library cover form-to-request conversion, formatting, the session store (including corrupt or blocked storage), and the create-campaign form: the request it sends and the server error it shows.

**CI.** GitHub Actions runs lint, type-check, tests and a production build for both apps on every push.

---

## API reference

All endpoints are under `/api`. Authenticated endpoints need `Authorization: Bearer <token>`. Errors always look like `{ "error": "Human-readable message", "details"?: [{ "field", "message" }] }`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | – | `{ name, email, password, role }` → `{ token, user }` |
| `POST` | `/auth/login` | – | `{ email, password }` → `{ token, user }` |
| `GET` | `/auth/me` | any | Current user |
| `POST` | `/campaigns` | brand | `{ name, platform, totalBudget, milestones: [{ viewThreshold, payout }] }` |
| `GET` | `/campaigns/mine` | brand | Your campaigns with `spentBudget`, `remainingBudget`, `submissionCount` |
| `GET` | `/campaigns/:id/submissions` | brand (owner) | Posts submitted to your campaign |
| `GET` | `/campaigns?platform=` | any | Live campaigns (budget remaining) |
| `POST` | `/submissions` | creator | `{ campaignId, postUrl }` |
| `PATCH` | `/submissions/:id/views` | **none** (simulates platform data) | `{ views }` → `{ submission, paidNow, cappedByBudget, campaign }` |
| `GET` | `/creators/me/earnings` | creator | `{ totalEarnings, totalEntitled, unpaidDueToBudget, submissionCount, submissions }` |
| `GET` | `/health` | – | Liveness and database status |

**Status codes:** `400` invalid input · `401` missing or expired token · `403` wrong role · `404` not found · `409` duplicate (email or post) or campaign budget used up · `500` unexpected error (logged server-side, generic message to the client).

---

## Deployment

| Part | Host | Settings |
|---|---|---|
| Database | MongoDB Atlas (M0 free) | Network access `0.0.0.0/0` (Render has no fixed IP); a database user with read/write |
| API | Render (Web Service, free) | Root directory `backend` · Build `npm ci --include=dev && npm run build` · Start `npm start` · Health check `/api/health` · Env: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` = the Vercel URL |
| Frontend | Vercel (free) | Root directory `frontend` · Env: `NEXT_PUBLIC_API_URL` = the Render URL |

---

## Design decisions and trade-offs

- **Transactions over a single-document design.** A post's payout and the campaign's spend live in different documents. A transaction keeps them consistent; the alternative, embedding submissions in the campaign document, would hit document-size limits and contention.
- **The server is the single source of validation.** The frontend sends what the user typed (blanks as missing) and shows the API's field-labelled message, e.g. "Total budget is required.". Rules can't drift between client and server.
- **JWT in `localStorage`, sent as a bearer token.** Frontend (Vercel) and API (Render) are on different domains, where cross-site cookies need extra setup and are increasingly blocked by browsers. The trade-off is exposure to XSS. React escapes rendered content, and no user HTML is rendered, but an `httpOnly` cookie on a shared domain would be the stronger choice in production.
- **Password hashing** uses bcrypt. Login returns the same message for an unknown email and a wrong password, so the API doesn't reveal which emails are registered.
- **Security hygiene:** `helmet` headers, CORS restricted to the frontend origin, a JSON body size limit, and environment variables validated at startup.

### What I'd add with more time

- Pagination on campaign and submission lists.
- An append-only payout ledger (one record per payment) for auditing, alongside the running totals.
- Rate limiting on auth endpoints, and refresh tokens.
- Campaign lifecycle: start/end dates, pausing, budget top-ups.
- Real platform integration (Instagram Graph API / YouTube Data API) in place of the simulated views endpoint, with an authenticated, signed webhook replacing the open `PATCH`.
- End-to-end browser tests (Playwright) in CI.
