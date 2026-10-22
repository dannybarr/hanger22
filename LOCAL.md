# Run Hanger 22 locally

Install Node.js 22 and pnpm 10.33.4 (`corepack enable` picks that up from `package.json`).

Then, from this folder:

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

The public site renders with no environment variables. Cut-out images are already in `public/cutouts`. Optional settings are listed in `.env.example`. Copy that file to `.env.local` only if you want a public site URL or the private desk password. Without `STUDIO_PASSWORD`, `/studio` stays unpublished and the rest of the site still runs.
