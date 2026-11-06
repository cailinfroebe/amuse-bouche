# amuse bouche

Meal planning, craving-inspired recipes, grocery estimates and Free style, with email sign-in and private saved kitchens.

This is the standalone GitHub/Vercel/Supabase version of the app. **Your family will not need ChatGPT accounts.** The design, chef artwork, SVG wordmark, unfolding Meals menu, profiles, dietary preferences, 98 shared recipes and local Free style recipe composer are included.

## Start here

1. **GitHub:** create a repository called `amuse-bouche`. Upload the contents of this folder into the repository root. Keep `public`, `api`, `lib`, `supabase`, `tests`, `scripts`, `package.json` and `vercel.json` together. Do not upload the outer ZIP file or a `node_modules` folder.
2. **Supabase:** create a project. Open **SQL Editor**, paste `supabase/schema.sql`, and run it once. This creates private per-user kitchen records with row-level security.
3. **Vercel:** import that GitHub repository. The included configuration serves `public/` and runs the API functions. Add these environment variables from your Supabase project, then deploy:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY` (a publishable key or legacy **anon** key)
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to your new Vercel URL. Add the exact production origin with a trailing `/` to allowed redirect URLs. Add `http://localhost:3000/` only for local development. Use explicit production URLs, rather than a broad wildcard.
5. Under **Authentication → Sign In / Providers**, enable email and allow new signups if your family should create their own accounts. For a six-digit email code, set the **Magic Link** email template to include `{{ .Token }}`. For example:

   ```html
   <h2>Your amuse bouche sign-in code</h2>
   <p>Enter this code in the app: <strong>{{ .Token }}</strong></p>
   ```

   The frontend also accepts Supabase's default emailed sign-in link. Follow Supabase's current guidance on email delivery, rate limits and custom SMTP; production delivery to family members may require your own email sender. Configure that in Supabase, never in browser code.
6. Open the deployed app, enter your email, verify it, and create your profile. Test a second email in a separate browser/private window: it should start with its own empty kitchen.

**Moving code to GitHub by itself does not configure email login. Complete the Supabase and Vercel setup above. GitHub Pages alone does not run this app's backend API functions.**

## Local development

Use Node.js 22 or newer:

```bash
npm install
cp .env.example .env.local
# Fill in the two public Supabase project settings in .env.local.
npm run dev
```

`npm run dev` uses the Vercel CLI. Sign into Vercel when asked and follow its local-project prompts. Open the URL printed by the CLI; do not double-click `public/index.html`.

```bash
npm test
npm run build
```

The build command validates source files; this app does not need a frontend bundler. Vercel installs the Node dependencies used by `api/`.

## Privacy and account separation

- Server requests verify the Supabase access token using `auth.getUser()`. Browser-supplied IDs never determine the authenticated user.
- Database row-level policies only allow a user to read or change their own `kitchens` row.
- Updates check an expected revision, preventing one device from silently overwriting another's changes.
- The app confirms the active email before loading saved recipes, verifies account-bound cache ownership, and rechecks sessions after returning to the app.
- `SUPABASE_PUBLISHABLE_KEY`/legacy anon key is intentionally public. **Never substitute a service-role or secret key.** This app rejects those privileged keys.
- No production profiles, grocery lists, credentials, site tokens or account database exports are included in this repository.

## Existing app data

The existing ChatGPT-hosted version stays available and is not changed by this ZIP. Its saved profiles are not automatically copied here: the two systems have different account IDs. Any future transfer must verify the owner of both accounts. Do not make the old database public or put a database export into GitHub.

## Recipe features

- Dietary buttons and common-allergen/ingredient filtering; check actual labels for allergies and cross-contact.
- The sugar-free preference means **no added sugar**, not zero naturally occurring sugar.
- Budget and cooking-time preferences help rank recipes; prices and nutrition are estimates.
- Free style uses built-in cooking rules and does not require paid AI or an AI API key.
- Recipe imports support common structured recipe pages and follow public Pinterest source links when available. Blocked, private or incomplete social posts can require the original recipe website or pasted recipe text.
- Saved social-board links are bookmarks. Automatic Pinterest, Instagram and Facebook folder syncing is not implemented.

## Before inviting family

Verify email delivery, two-account isolation, same-account persistence on a second device, sign-out/back-button behavior, recipe import and a complete grocery-list edit. The included automated checks do not replace a live email-login test against your own Supabase project.

## Files

- `public/`: complete app, recipe collection, chef artwork, fonts and icons.
- `public/auth.js`: email-code/link sign-in through Supabase.
- `api/kitchen.js`: authenticated profile/menu/grocery saving.
- `api/import-recipe.js`: authenticated import of public recipe websites.
- `api/config.js`: public project configuration, with no privileged credentials.
- `supabase/schema.sql`: table and private ownership policies.
- `tests/`: local recipe, preference and security checks.

Official setup references:
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://vercel.com/docs/git
- https://vercel.com/docs/functions/runtimes/node-js

Your supplied artwork is included as app branding. Review its licensing before redistributing it separately.
