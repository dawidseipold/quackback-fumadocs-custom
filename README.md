# crazy-hub

The web app of the Crazy ecosystem: ideas and voting, roadmaps, changelog, docs, accounts and tester ranks
for the **Crazy Gothic Trainer**.

It runs on the backend of [Quackback](https://github.com/QuackbackIO/quackback) (this branch is Quackback's
own git history from tag `v0.15.0` plus our commits) with a **frontend written from scratch** on
[crazy-ui](https://github.com/crazy-staff/crazy-ui) (`@crazy-staff/ui`).

- Decisions: [`docs/decisions.md`](docs/decisions.md)
- What gets a new UI: [`PARITY.md`](PARITY.md)
- Where the rewrite starts: [`docs/kickoff.md`](docs/kickoff.md)
- The frozen patch approach (`transform.py` over a Quackback checkout) lives on branch
  [`legacy-patch`](https://github.com/crazy-staff/crazy-hub/tree/legacy-patch).

## Running locally

Needs [bun 1.4.0](https://bun.sh) (the version pinned in `package.json`), Docker (Postgres with pgvector
and pg_cron, S3 storage, Mailpit from Quackback's `docker-compose.yml`).

```sh
bun run setup                               # first time: .env, containers, migrations, demo seed
bun run --filter @quackback/widget build    # the API serves the widget bundle
cd apps/web && bun run dev                  # http://localhost:3000
```

`scripts/setup.sh` is a bash script (Git Bash or WSL on Windows). It starts containers named
`quackback-db`/`quackback-minio` on ports 5432/9000 and stops other containers holding 5432: **stop the
old test portal (`legacy-patch`) first and make a dump of its data (`docs/owner-data.md`) before running
it.**

The new UI lives in `apps/web/src/app/` (see `CLAUDE.md` → "Where the new UI lives"); texts are in
`apps/web/messages/{en,pl,de,ru}.json`.

## Updating the backend from Quackback

```sh
git remote add upstream https://github.com/QuackbackIO/quackback.git   # once
git fetch upstream --tags
git merge v0.x.y        # or cherry-pick single commits
```

Our backend additions live in their own files and modules, so changes under `apps/web/src/lib/server`,
`apps/web/src/lib/shared` and `packages/*` merge cleanly. Upstream UI files are never patched; conflicts
in removed UI files are resolved by keeping them removed.

## License

Quackback is AGPL-3.0; this repository's changes are under the same license (see [`LICENSE`](LICENSE)).
