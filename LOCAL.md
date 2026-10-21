# Run Hanger 22 locally

Install Node.js 20 or later.

Then, from this folder:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The public site renders with no environment variables. Cut-out images are already in `public/cutouts`. Optional settings are listed in `.env.example`. Copy that file to `.env.local` only if you want a public site URL or the private desk password. Without `STUDIO_PASSWORD`, `/studio` stays unpublished and the rest of the site still runs.
