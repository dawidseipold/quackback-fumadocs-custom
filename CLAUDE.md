# crazy-hub — instructions for Claude

The web app of the Crazy ecosystem (org `crazy-staff`): ideas and voting, roadmaps, changelog, docs,
accounts and tester ranks for the **Crazy Gothic Trainer**. Built on **Quackback's backend** with a
**frontend written from scratch** on **crazy-ui**. Decisions: `docs/decisions.md`. What is ported:
`PARITY.md`.

## Current state (2026-11-14)

- **The rewrite has started.** `main` is Quackback's own git history (tag `v0.15.0`, remote `upstream`)
  plus our commits (decision 2). The old approach (patches + `transform.py`) is frozen on branch
  `legacy-patch`; the owner keeps running it locally as a test portal.
- crazy-ui shipped (`@crazy-staff/ui` 0.2.0). `docs/kickoff.md` lists the first steps, how to use crazy-ui,
  the layout to reuse and the rules learned there.
- Our docs (`CLAUDE.md`, `PARITY.md`, `docs/decisions.md`, `docs/kickoff.md`, `docs/hosting.md`,
  `docs/owner-data.md`) sit next to Quackback's own
  files in `docs/`; Quackback's `README.md` is replaced by ours.
- The app skeleton (#3) is in place; every `PARITY.md` row has its issue (#4–#17 and #19, labels `phase: 1/2`).
  Start the next feature from its issue, in the order of the `Order:` line.

## Where the new UI lives

- `apps/web/src/app/` is ours: `root.tsx`, `router.tsx`, `server.ts` (Quackback's entry wrapped in
  Paraglide's middleware), `routes.ts` (virtual route config), `routes/` (file routes), `components/`,
  `lib/`, `styles/app.css`. Messages in `apps/web/messages/{en,pl,de,ru}.json` (Paraglide, compiled to
  `src/app/paraglide`, git-ignored).
- Quackback's `src/routes` and `src/components` stay untouched and **out of the build**: `routes.ts` mounts
  only its server routes (`/api/*`, `.well-known`, OAuth, feeds, robots, sitemap). A new upstream server
  route outside `src/routes/api` must be added there. Old UI files are the reference for parity only.
- Reuse `src/lib` freely (server functions, `lib/client` hooks and queries, `lib/shared`). The root context
  has Quackback's shape, and `/admin` keeps its route id and role guard so the admin hooks work.
- Wiring edits to upstream files are kept to `apps/web/vite.config.ts` (marked `crazy-hub:`),
  `apps/web/package.json` and `.github/workflows/ci.yml`. The dependency-graph snapshot
  `apps/web/src/lib/server/policy/dep-graph/GRAPH.md` lists `src/app` too; after an upstream merge,
  regenerate it with `bunx vitest run apps/web/src/lib/server/policy/dep-graph -u`.
- Use **bun 1.4.0** (the `packageManager` pin): newer bun installs duplicate `drizzle-orm` copies and the
  typecheck fails with thousands of false errors. `bun run --cwd apps/web typecheck:app` checks the new app
  and everything it imports; the full `typecheck` covers the old UI and no longer applies.

## People and process

- **Language with Claude is Polish**: messages to the owner, prompts for new sessions, handoffs and scheduled tasks are written in Polish. Only what lands on GitHub (code, commits, issues, PRs, docs) is in English.
- The owner (Dawid) is project lead and a frontend developer; he may push quick style fixes himself —
  keep the look, clean up the code.
- **Talk to him in Polish.** Everything on GitHub is in **English**. Labels use `kind: value`.
- One conversation = one feature, started from a GitHub issue that holds the spec. Tell him when to start
  a new conversation and whether it should be Chat (planning) or Code (repo work).
- Review on his setup: 3440×1440, 100 %, Zen browser (Firefox engine). Screenshots with Playwright
  Firefox at that size, on a copy of his real data (dump of his local portal), never only demo seed data.
- Local clones live in `F:\Documents\projects\<repo>` on his Windows PC.

## Architecture (decided)

- Keep **all** of Quackback's backend: `apps/web/src/lib/server`, `lib/shared`, `packages/*` (db, ids,
  email, logger), server functions, `/api/v1`, auth, notifications, integrations. Don't delete backend
  modules, even unused ones: their UI is built when needed (`PARITY.md`).
- Replace the UI: every route component and `components/*` is rewritten on **crazy-ui**
  (`@crazy-staff/ui`). No patching of upstream UI files.
- Backend updates from Quackback: `git fetch upstream` and cherry-pick/merge changes under
  `lib/server`, `lib/shared`, `packages/*`. Keep our backend additions in separate files/modules so
  merges stay clean.
- **Docs is a new module written from scratch** (own tables, own API under `/api/v1/docs/...`, own admin
  panel), rendered with **fumadocs-core**. Quackback's help center stays in the code untouched and unused.
  Content is Markdown/MDX stored in the DB; editor is TipTap 3 with markdown round-trip and a source view.
- i18n: **Paraglide**; languages EN (default), PL, DE, RU.
- Stack: TanStack Start/Router/Query/Form/Table, valibot, Tailwind 4, Base UI via crazy-ui, motion,
  lucide, bun.
- Tests: Vitest, Playwright e2e for the main paths (sign in, post an idea, vote, moderate, edit a docs
  page), visual tests of key pages, CI gate.
- Hosting: decided at the start of the hub phase. Needs Postgres + pgvector, S3-compatible storage and a
  long-running Bun server; default plan is Docker on a VPS behind Cloudflare.
