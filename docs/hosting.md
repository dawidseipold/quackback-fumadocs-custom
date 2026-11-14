# Hosting (research notes)

**Not decided yet** (decision 11): the hub runs locally for now. These are the options researched on
2026-11-14 (prices without VAT) for when hosting is picked.

## Requirements

- Long-running Bun server (TanStack Start, Nitro `bun` preset), shipped as a Docker image.
- PostgreSQL 18 with **pgvector** and **pg_cron** (`docker/postgres/Dockerfile` from Quackback).
- S3-compatible storage for uploads.
- Email later (notifications are in-app only for now, `PARITY.md`).

## Options compared

| Option                                                              | ~Monthly            | Pros                                             | Cons                                                         |
| ------------------------------------------------------------------- | ------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| **Hetzner CX33 (4 vCPU/8 GB) + Postgres container + Cloudflare R2** | ≈ €11 incl. backups | Cheapest, EU, one compose file                   | CX/CAX often "not available" since Sep 2026; we run Postgres |
| Same on netcup VPS 1000 or Hetzner CPX22                            | €14–20              | Orderable fallback                               | More expensive                                               |
| Railway (Hobby + usage, extensions template)                        | $15–30              | Git-push deploys, Quackback ships Railway config | Usage billing creeps; still needs R2                         |
| VPS + Supabase Pro                                                  | ≈ $32               | Managed Postgres with pgvector + pg_cron         | 3× cost, network hop to the DB                               |
| VPS + Neon Launch (always-on)                                       | ≈ $27               | PITR, branching                                  | pg_cron needs always-on compute                              |
| Fly.io + Managed Postgres                                           | $45+                | Managed HA                                       | No pg_cron                                                   |

## Proposed setup (default plan)

```
Cloudflare (DNS, TLS, proxy, cache of static assets)
  └─ VPS (Docker Compose)
       ├─ hub         ghcr.io/crazy-staff/crazy-hub:<tag>   (built by GitHub Actions)
       ├─ postgres    postgres:18 + pgvector + pg_cron       (volume, not exposed)
       └─ backup      nightly pg_dump -Fc → R2 bucket (30-day lifecycle rule)
Cloudflare R2: uploads bucket (S3 API, S3_FORCE_PATH_STYLE=false), backups bucket
```

- Server hardening: SSH keys only, `ufw` allowing 22/80/443, `unattended-upgrades`, the origin accepts
  traffic only from Cloudflare (or a Cloudflare Tunnel, which needs no open ports at all).
- Deploy: CI builds and pushes the image on a release tag; the server runs `docker compose pull && up -d`
  (by hand at first, a deploy workflow over SSH later).
- Staging: PR previews are not planned for the hub (they are for crazy-ui's showcase); a `staging`
  subdomain on the same box can come later.

Sources: Hetzner price adjustment (docs.hetzner.com), Cloudflare R2 pricing, Railway pricing, Fly.io
Postgres extensions, Neon pg_cron docs, Supabase pricing.
