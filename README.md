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
