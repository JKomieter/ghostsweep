# Ghostsweep

Ghostsweep is a privacy-first Next.js application for discovering, managing, and requesting deletion of user data across online services. It helps users locate accounts, submit deletion requests, and track deletion status across integrations (Google, Microsoft, Gmail, Stripe, Supabase, etc.).

## Key Features

- Account discovery and breach checks
- Deletion request creation and tracking
- Integrations: Google, Microsoft, Gmail, Stripe, Supabase, and others
- Onboarding flows, notifications, and a user dashboard
- Instrumentation and observability (Sentry + analytics)
- Rate limiting and abuse protection

## Tech Stack

- Next.js (app router)
- React 19
- Supabase for auth / storage (partial)
- Stripe for payments
- Sentry for error monitoring
- Tailwind CSS for styling
- TypeScript

## Quick Start

Prerequisites

- Node.js 18+ or compatible
- npm or pnpm

Install

```bash
npm install
# or
pnpm install
```

Run development server

```bash
npm run dev
```

Build and run production

```bash
npm run build
npm run start
```

Linting

```bash
npm run lint
```

## Environment

Create a `.env.local` in the project root and provide the secrets your deployment requires. Common environment variables the app expects include (example names — confirm in your deployment configs):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `NEXTAUTH_SECRET` or other session secret
- `SENTRY_DSN`
- `RESEND_API_KEY`
- OAuth credentials: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
- `HCAPTCHA_SITEKEY`, `HCAPTCHA_SECRET`

Note: The exact set of env vars depends on which integrations you enable; scan the `api/` folders and `lib/` for references if you need to add more.

## Project Layout

- `app/` — Next.js app routes, pages, and protected routes
- `api/` — Server routes and integration endpoints
- `components/` — Shared UI components
- `lib/` and `utils/` — Utilities, integrations, and helpers
- `public/` — Static assets

## Scripts

The important npm scripts (from `package.json`):

- `dev` — Run Next.js in development (`next dev --webpack`)
- `build` — Build for production (`next build --webpack`)
- `start` — Start the production server (`next start`)
- `lint` — Run ESLint

## Deployment

The repository includes `vercel.json` — deployment to Vercel is recommended for easy edge/SSR support. Ensure your environment variables are configured in the Vercel dashboard or your host of choice.

## Testing & Local Integrations

- There are no automated tests included by default. Add tests and CI as needed.
- For local development with Supabase or other hosted services, prefer using a staging/test project with limited permissions.

## Contributing

- Open issues and PRs are welcome. Follow existing code styles and TypeScript conventions.
- If you change runtime or deploy settings, update this README with any new env vars or steps.

## Security & Privacy

This project handles sensitive user data. Treat keys and secrets securely, and follow best practices for data deletion and retention. Refer to `SECURITY_LOGIN_RATE_LIMITING.md` and other docs in the repo for security-specific guidance.

## Where to look next

- App entry: `app/page.tsx` and `app/layout.tsx`
- API routes: `api/` (many integration endpoints)
- Utilities: `lib/`, `utils/`, and `hooks/`

## License

If this repository should include a license, add a `LICENSE` file at the project root. Otherwise assume internal/closed source.

---

If you'd like I can:

- add an `.env.example` populated with the common keys shown above
- generate a minimal CONTRIBUTING.md and CODE_OF_CONDUCT
- create a one-click Vercel deploy button and documentation for it

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
