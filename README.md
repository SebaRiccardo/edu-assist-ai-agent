# EduAssist

**An AI powered email workspace for university instructors.** EduAssist connects course context with an instructor's email inbox to help organize student messages, assess urgency, find relevant course material, and prepare replies.

> This repository contains an actively developed application. Connecting a real inbox can expose email content to configured AI and integration providers. Review generated classifications and drafts before acting on them; the reply workflow can send email.

## What it does

- Connects Gmail and Outlook accounts through Composio.
- Organizes courses and course context in Supabase.
- Analyzes inbox messages for course relevance and category, with reasoning and priority estimates.
- Generates response drafts and supports sending replies.
- Offers a chat experience with course and email tools, plus retrieval features based on course embeddings.
- Includes account, inbox, course, subscription, and administrative screens.
- Supports English and Spanish, with Spanish as the default locale.

## Built with

- [Next.js 15](https://nextjs.org/) App Router and React 19
- TypeScript, Tailwind CSS 4, and Radix UI based components
- [Vercel AI SDK](https://ai-sdk.dev/) and Google's Generative AI provider
- [Supabase](https://supabase.com/) for authentication and application data
- [Composio](https://composio.dev/) for Gmail and Outlook connections and tools
- Mercado Pago for subscription and payment workflows
- TanStack Query, React Hook Form, Zod, and next-intl

## How the application is organized

```text
src/
├── actions/       Server actions for inbox, subscriptions, and plans
├── agents/        AI workflows for analysis, prioritization, drafting, and labeling
├── app/           Next.js routes, pages, and API handlers
├── auth/          Authentication helpers
├── components/    Shared UI, dashboard, landing, and admin components
├── hooks/         Client queries and mutations
├── lib/           Supabase, Composio, Mercado Pago, AI, and utilities
├── subscriptions/ Subscription configuration and plan logic
└── types/         Shared application types

messages/          English and Spanish translations
docs/              Feature notes and implementation guides
```

The browser UI uses Supabase's publishable/anon key with Supabase Auth. Server actions and route handlers validate the signed-in user before running protected operations. Composio connects a user's email account; AI workflows then use course details and email content to produce categorizations, priority suggestions, or response text.

## Run locally

### Requirements

- Node.js 20 or later
- npm
- A Supabase project
- Google AI API access for Gemini powered features
- A Composio account and configured Gmail or Outlook auth connections

Mercado Pago credentials are needed only to exercise payment and subscription flows. Some features also depend on the Supabase schema and provider-side configuration described in the project documentation; this repository does not automatically provision those services.

### Install

```bash
git clone https://github.com/SebaRiccardo/edu-assist-ai-agent.git
cd edu-assist-ai-agent
npm ci
```

Create `.env.local` in the project root. It is ignored by Git; use your own values and never commit credentials:

```dotenv
# Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=

# AI and email integrations
GOOGLE_GENERATIVE_AI_API_KEY=
COMPOSIO_API_KEY=
GMAIL_AUTH_CONFIG_ID=
OUTLOOK_AUTH_CONFIG_ID=

# Public app URL and beta-access token signing
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETA_ACCESS_CODES=
BETA_ACCESS_SECRET=

# Optional: Google OAuth redirect URL, if configured by your auth setup
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL=

# Optional: Mercado Pago billing
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
MERCADOPAGO_BASIC_PLAN_ID=
MERCADOPAGO_PRO_PLAN_ID=
MERCADOPAGO_PRO_PLUS_PLAN_ID=
```

`NEXT_PUBLIC_*` values are included in browser bundles and must never contain private credentials. The Supabase publishable/anon key is designed for client use when the project has appropriate Row Level Security policies. Keep provider secrets and signing keys server-side.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign-in, connected inboxes, AI calls, and billing require correctly configured provider projects; the app is not a self-contained mock demo.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Build the production application |
| `npm run start` | Serve a production build |
| `npm run type-check` | Run the TypeScript compiler without emitting files |
| `npm run format:check` | Check formatting with Prettier |

## Provider and data setup

1. Create a Supabase project and configure its authentication providers, redirect URLs, and database schema for this application. Generated database types live under `src/lib/supabase/types/`.
2. Create a Composio project, set up Gmail and/or Outlook auth configurations, and provide their IDs through `GMAIL_AUTH_CONFIG_ID` and `OUTLOOK_AUTH_CONFIG_ID`.
3. Add a Google AI API key for Gemini analysis, embeddings, and response generation.
4. For subscription flows, configure Mercado Pago credentials, plans, webhook delivery, and the public app URL.
5. Set a strong, unique `BETA_ACCESS_SECRET` in every deployed environment where beta access is enabled.

See [`docs/`](docs/) for feature-specific notes, including [subscription flows](docs/SUBSCRIPTION_FLOW.md), [beta access](docs/BETA_ACCESS.md), [email labeling](docs/EMAIL_LABELING.md), and [RAG/course embeddings](docs/RAG_AGENT_GUIDE.md). Provider dashboards and Supabase policies must be configured separately.

## Security and privacy

- Never commit `.env.local`, API tokens, OAuth credentials, webhook secrets, or production data. The repository ignores `.env.local`.
- If a credential has ever appeared in Git history, revoke or rotate it. Removing a file from a later commit does not erase earlier copies; see [GitHub's guide to removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).
- Email content is sent to the AI and integration providers configured for the deployment. Review their data handling terms and avoid using sensitive real inboxes during development.
- Configure Supabase Row Level Security and OAuth redirect URLs for your deployment. Do not treat client-side visibility or UI checks as access control.
- Generated labels, priorities, and replies may be incorrect. Review them before modifying or sending messages.

## Contributing

Issues and pull requests are welcome. For a change, include a short description of the user-facing behavior and the checks you ran. Do not include secrets, personal email data, or production database exports in issues, commits, or screenshots.

## License

No license file is currently provided. Until a license is added, the source is publicly viewable but reuse, modification, and redistribution are not granted by this repository. Add a license that matches the maintainer's intent before inviting external reuse.
