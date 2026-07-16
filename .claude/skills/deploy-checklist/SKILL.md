---
name: deploy-checklist
description: Walk through the pre- and post-deploy checklist for shipping the Website project (Next.js + Prisma + Postgres) to Vercel. Use this whenever the user says they want to deploy, ship, push to production, or release changes, or asks things like "is this ready to deploy" or "can we ship this" — even if they don't say the word "checklist."
---

This project has no CI pipeline and one maintainer, so nothing catches a broken build, a missing migration, or a forgotten env var except this checklist. Walk through every step below with the user before calling a deploy "done" — skipping one means finding out from a broken live site instead of before it goes live.

## Before deploying

1. **Build passes locally.** Run `npm run build` and confirm it completes without errors. Don't trust `npm run dev` succeeding as a substitute — the production build catches type errors and other issues dev mode hides.
2. **Prisma migrations are ready.** If the schema changed since the last deploy, generate the migration locally (`npx prisma migrate dev`), commit the migration files, and apply it to the production database (`npx prisma migrate deploy` against the production `DATABASE_URL`, or confirm Vercel's build step runs this automatically if that's how it's wired up).
3. **Env vars are set in Vercel.** Check the Vercel project's Settings → Environment Variables for `DATABASE_URL` (production database), plus any image-storage credentials once cloud storage (Cloudflare R2 / Vercel Blob) replaces local disk — not needed while storage is still local-only in dev.

## After deploying

4. **Smoke-test the admin side.** Load the asset-management pages on the live URL and confirm you can view existing assets and create or edit one.
5. **Smoke-test the storefront.** Load the public storefront and confirm listings render with their photos, and browsing doesn't error.

If any step fails, treat the deploy as not done — fix it and re-verify rather than shipping around it.
