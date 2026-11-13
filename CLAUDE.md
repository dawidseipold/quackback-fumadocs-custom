# crazy-hub — instructions for Claude

The web app of the Crazy ecosystem (org `crazy-staff`): ideas and voting, roadmaps, changelog, docs,
accounts and tester ranks for the **Crazy Gothic Trainer**. Built on **Quackback's backend** with a
**frontend written from scratch** on **crazy-ui**. Decisions: `docs/decisions.md`. What is ported:
`PARITY.md`.

## Current state (2026-11-13)

- This repo still holds the old approach (patches + `transform.py` over Quackback). It is **frozen**:
  no more fixes. The owner keeps running it locally as a test portal.
- **Not started yet:** the rewrite waits until crazy-ui has its foundations (order: crazy-ui → crazy-hub →
  trainer).
- First step of the rewrite (decision 2): `main` becomes Quackback's own git history (tag v0.15.0) plus our
  commits; the patch approach moves to branch `legacy-patch`. Carry this file, `PARITY.md` and `docs/`
  over to the new `main`.

## People and process

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
