# 📡 TMP-RADAR

**A real-time monitoring dashboard for TruckersMP servers (Euro Truck Simulator 2 & American Truck Simulator).**

TMP-RADAR polls the public [TruckersMP API](https://truckersmp.com/), stores periodic snapshots of every server in PostgreSQL, and turns that history into a clean dashboard where you can see how busy each server is and compare servers against each other over time.

🔗 **Live demo:** TODO_ADD_URL

---

## ✨ Features

- **Live server dashboard**: current status and player counts for the TruckersMP servers (ETS2 / ATS).
- **Automated snapshots**: a scheduled job records the state of all servers every 5 minutes, building a historical dataset instead of just showing "right now".
- **Server comparison** (`/compare`): pick 2 to 4 servers and compare them over the last **24 hours** or **7 days**.
- **Shareable URLs**: the selection and time range live in the query string (e.g. `/compare?range=24h&servers=4&servers=9`), so any comparison can be bookmarked or shared.
- **Light / dark theme** via `next-themes`.
- **Secured cron endpoint**: the snapshot route is protected by a secret so only the scheduler can trigger it.

## 🧱 Tech stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org/) (App Router) + React 19                  |
| Language   | TypeScript                                                                 |
| Database   | PostgreSQL                                                                 |
| ORM        | [Prisma](https://www.prisma.io/) 6                                         |
| UI         | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com/), Base UI, Lucide icons |
| Scheduling | Vercel Cron Jobs                                                           |
| Tooling    | ESLint, Prettier (with Tailwind plugin)                                    |

## 🏗️ How it works

```
┌────────────────┐   every 5 min   ┌──────────────────────────┐
│  Vercel Cron   │ ──────────────▶ │ /api/cron/snapshots      │
└────────────────┘  (CRON_SECRET)  │  1. fetch TruckersMP API │
                                   │  2. save snapshot rows   │
                                   └────────────┬─────────────┘
                                                ▼
                                        ┌──────────────┐
                                        │  PostgreSQL  │
                                        └──────┬───────┘
                                               ▼
                        Dashboard & /compare (Server Components + Prisma)
```

## 🚀 Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local, Docker, Neon, Supabase, …)

### Installation

```bash
git clone https://github.com/FAMES-CODE/tmp-radar.git
cd tmp-radar
npm install
```

### Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

| Variable                 | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `DATABASE_URL`           | PostgreSQL connection string                    |
| `TRUCKERSMP_SERVERS_URL` | TruckersMP servers endpoint                     |
| `CRON_SECRET`            | Long random string protecting the cron endpoint |

### Database

```bash
npx prisma migrate dev   # or: npx prisma db push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To fill the database locally without waiting for the cron, call the snapshot endpoint manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/snapshots
```

## 📜 Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Production build             |
| `npm run start`     | Run the production build     |
| `npm run lint`      | Lint with ESLint             |
| `npm run typecheck` | TypeScript type checking     |
| `npm run format`    | Format with Prettier         |

## ☁️ Deployment

The project is built for **Vercel**. `vercel.json` already registers the cron job:

```json
{ "crons": [{ "path": "/api/cron/snapshots", "schedule": "*/5 * * * *" }] }
```

1. Import the repo into Vercel.
2. Add `DATABASE_URL`, `TRUCKERSMP_SERVERS_URL` and `CRON_SECRET` as environment variables.
3. Deploy. Snapshots start being collected automatically.

> Note: Vercel Cron on the Hobby plan is limited to daily runs. A 5-minute schedule requires a Pro plan, or you can trigger the endpoint from any external scheduler.


## 🤝 Contributing

Issues and pull requests are welcome.

## 👤 Author

**Amine Ferkani**
[GitHub](https://github.com/FAMES-CODE) · [LinkedIn](https://linkedin.com/in/amineferkani)

---

_TMP-RADAR is an independent fan project and is not affiliated with TruckersMP._
