# jusDo

Walk-and-remind doodle companion starring **Thalapathy Vijay** or **Thala Ajith**, plus a **Vijay Fans Club vs Ajith Fans Club** movie quiz.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Vercel-ready (`/api/questions`, `/api/admin/login`)
- Settings & rivalry stats in `localStorage`
- Question bank in `data/questions.json` (editable via Admin)

## Features

- Walking doodle companion with moods
- Water / stretch / alarm reminders + quiet hours
- Daily challenge card + rivalry meter
- Fan quiz with streaks, fun facts, shareable score card
- Admin: form entry **or** JSON import (merge / replace)

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [/admin](http://localhost:3000/admin) — password `jusdo-admin` (or `ADMIN_PASSWORD`).

## Deploy (Vercel)

1. Import this repo in Vercel
2. Set env `ADMIN_PASSWORD`
3. Deploy

Note: Admin writes update `data/questions.json` on the server filesystem. On Vercel serverless that file is ephemeral — keep your bank in git (commit `data/questions.json`) or move to a DB later. Seed questions always ship with the app.

## JSON question shape

```json
[
  {
    "id": "custom-1",
    "star": "vijay",
    "prompt": "Your question?",
    "options": [
      { "id": "a", "text": "A" },
      { "id": "b", "text": "B" },
      { "id": "c", "text": "C" },
      { "id": "d", "text": "D" }
    ],
    "correctOptionId": "a",
    "funFact": "Optional"
  }
]
```

`star` can be `vijay`, `ajith`, or `both`.
