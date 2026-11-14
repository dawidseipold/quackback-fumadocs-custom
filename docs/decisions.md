# Decisions

Settled in the planning conversation of 2026-11-13 (owner + Claude). Supersede by adding entries.

1. **Rewrite the frontend, keep the backend.** The patch approach (`transform.py` editing upstream UI,
   Fumadocs squeezed into the help center) produced spaghetti; it is frozen.
2. **Repo history.** This repo stays (`crazy-staff/crazy-hub`); `main` is rebuilt on Quackback's git
   history (v0.15.0) + our commits so backend updates can be cherry-picked/merged. Old code → branch
   `legacy-patch`.
3. **Parity tiers** as in `PARITY.md`: notifications stay (no email yet), auth and DB stay; unused modules
   keep their backend and get UI only when asked.
4. **Docs: a new module from scratch** with its own tables, API and admin panel; Quackback's help center is
   left untouched (renaming it to "Docs" in code was a mistake). Fumadocs (core) renders it.
5. **Docs content:** Markdown/MDX in the DB, edited on the site (TipTap 3 WYSIWYG + source view). Editing,
   translations, authors, categories and contributors live in the admin UI, never in git files. Features
   grow build by build.
6. **UI: crazy-ui** (`@crazy-staff/ui`, Base UI primitives) for every screen.
7. **i18n: Paraglide**, EN default + PL, DE, RU.
8. **Tests:** Vitest, Playwright e2e of main paths, visual tests, CI gate; screenshots of changed pages in
   every PR (Firefox, 3440×1440, owner's data).
9. **Feature flow:** idea on the hub → accepted → GitHub issue (spec, link to the post) → one conversation
   per issue → PR closes the issue → post status updates on the hub (webhooks).
10. **Order:** crazy-ui → crazy-hub → trainer. Hosting of the hub decided at the start of the hub phase.
11. **Hosting (2026-11-14, proposed at the start of the hub phase; supersede if the owner picks otherwise).**
    One EU VPS with Docker Compose behind Cloudflare (DNS, TLS, proxy): the hub's image (built in CI,
    pushed to GHCR, never built on the server) and Postgres with pgvector and pg_cron in a container, on a
    4 vCPU / 8 GB box (Hetzner CX33 ≈ €9/mo; if CX/CAX can't be ordered, netcup VPS 1000 or Hetzner CPX22,
    €14–20). Uploads in Cloudflare R2 (free tier covers our size). Backups: provider snapshots plus a nightly
    `pg_dump -Fc` to R2 with a 30-day retention rule; restore tested once. Outbound email later through a
    transactional provider (Resend/Postmark), never from the VPS. Rejected: Fly.io (managed Postgres has no
    pg_cron), Supabase/Neon + VPS (~3× the cost, DB latency), Railway kept as the low-ops fallback
    (~$15–30/mo, extensions template). Details: `docs/hosting.md`.
