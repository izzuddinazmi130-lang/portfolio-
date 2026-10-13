<<<<<<< HEAD
# Izzuddin Portfolio — React + Node/Express

Same "blueprint" design as the single-file version, split into a proper
React frontend and a small Express backend with:

- **Working contact form** — submits to the backend, which emails you via
  SMTP (Nodemailer) and also saves a local backup so nothing is lost.
- **Projects API** — your "Systems I've built" section is served from
  `server/data/projects.json` via a REST API, so you can add/edit/remove a
  project without touching any frontend code.

```
portfolio-app/
├── client/          React app (Vite)
│   └── src/
│       ├── components/   Hero, Systems, HowIWork, Experience, Skills, Contact
│       ├── api.js        fetch helpers + fallback data
│       └── App.jsx
└── server/          Express API
    ├── routes/          projects.js, contact.js
    ├── middleware/       adminAuth.js (protects write endpoints)
    └── data/             projects.json (your project data lives here)
```

## 1. Run it locally

You'll need [Node.js](https://nodejs.org) 18+ installed. Open two terminals.

**Terminal 1 — backend**
```bash
cd server
cp .env.example .env      # then edit .env, see step 2 below
npm install
npm run dev
```
This starts the API at `http://localhost:4000`.

**Terminal 2 — frontend**
```bash
cd client
npm install
npm run dev
```
This starts the site at `http://localhost:5173`. Open that in your browser.

If the backend isn't running yet, the site still works — it just falls
back to the built-in project list and the contact form will show an error
until the API is up.

## 2. Set up the contact form email

The form works out of the box without email configured (submissions are
still saved to `server/data/contact-submissions.json`), but to actually
get emailed:

1. In `server/.env`, fill in `SMTP_USER` and `SMTP_PASS`.
2. Easiest option: use a Gmail address with an **App Password** (not your
   normal password) — turn on 2-Step Verification on the Google account,
   then generate one at myaccount.google.com/apppasswords.
3. Set `CONTACT_TO_EMAIL` to whichever inbox should receive messages
   (can be the same Gmail address, or a different one).

Any SMTP provider works the same way (Outlook, Zoho, a custom domain
inbox, etc.) — just change `SMTP_HOST`/`SMTP_PORT` accordingly.

## 3. Update your projects without touching code

The project list lives in `server/data/projects.json` and is served at
`GET /api/projects`. To add/update/delete one over the API (e.g. once
AS Tech or Alphard Chauffeur goes live), set `ADMIN_TOKEN` in `.env` to
something private, then call the API with that token, e.g.:

```bash
curl -X PUT http://localhost:4000/api/projects/as-tech \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token" \
  -d '{"status":"live","statusLabel":"live — astech.com","link":"https://astech.com"}'
```

Or just edit `server/data/projects.json` directly and restart the server
— either works.

## 4. Deploying it for real

- **Frontend**: run `npm run build` inside `client/`, which outputs static
  files to `client/dist/`. Host that on Vercel, Netlify, GitHub Pages, or
  Hostinger's static hosting.
- **Backend**: needs an actual Node process running, so static hosting
  won't work for it. Use Railway, Render, Fly.io (all have free tiers), or
  Hostinger's Node.js hosting if your plan supports it.
- Once both are deployed, set `VITE_API_URL` (in a `client/.env` file) to
  your backend's live URL before running `npm run build`, and set
  `CLIENT_ORIGIN` in the backend's `.env` to your frontend's live URL so
  CORS allows it.

## Why a backend at all?

For a portfolio specifically, most of it doesn't need one — that's normal
and fine. This one exists to (1) make the contact form actually deliver
email instead of just being a mailto link, and (2) let you update your
project list from anywhere without redeploying the frontend. Both are
genuinely useful, and having a real Express API on your resume/portfolio
is itself a small proof point for a fullstack role.
=======
# portfolio-
My Portfolio
>>>>>>> c36ca7aa9162cca9cfac0dd54a6b8e08af41be34
