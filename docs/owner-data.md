# The owner's data for screenshots

Decision 8: screenshots for review are taken on a copy of the owner's real data (his local test portal),
never only on demo seed data. This is how the copy is made and used.

**The dump contains personal data (emails, names, password hashes). It never goes into git, an issue, a
PR or a public place.** It is attached to the Claude session that needs it, and lives only in that
sandbox and on the owner's PC.

## 1. Make the dump (owner, PowerShell)

The local portal runs in Docker (Quackback's compose files). Find the Postgres container:

```powershell
docker ps --format "table {{.Names}}\t{{.Image}}"
# usually quackback-db
```

Dump the database as plain SQL (portable across Postgres versions), without the data of tables that only
hold live login secrets:

```powershell
$db = "quackback-db"   # container name from above
docker exec $db pg_dump -U postgres -d quackback --no-owner --no-acl `
  --exclude-table-data=session `
  --exclude-table-data=verification `
  --exclude-table-data=one_time_token `
  --exclude-table-data=oauth_access_token `
  --exclude-table-data=oauth_refresh_token `
  -f /tmp/crazy-hub.sql
docker exec $db gzip -f /tmp/crazy-hub.sql
docker cp "${db}:/tmp/crazy-hub.sql.gz" "$HOME\Desktop\crazy-hub.sql.gz"
```

If the user or database name differs, read them with `docker exec $db env | Select-String POSTGRES`.

Uploaded files (avatars, images in posts and docs) live in the MinIO/Silo container, in its own on-disk
format, so they are copied out through the S3 API with `mc` (credentials are `S3_ACCESS_KEY_ID` /
`S3_SECRET_ACCESS_KEY` of the portal, `minioadmin` by default; bucket `S3_BUCKET`, `quackback` by default):

```powershell
$out = "$HOME\Desktop\crazy-hub-uploads"; New-Item -ItemType Directory -Force $out | Out-Null
docker run --rm -v "${out}:/out" -e MC_HOST_local=http://minioadmin:minioadmin@host.docker.internal:9000 `
  pgsty/mc:RELEASE.2026-09-16T00-00-00Z mirror local/quackback /out
Compress-Archive "$out\*" "$HOME\Desktop\crazy-hub-uploads.zip"
```

## 2. Hand it over

Attach `crazy-hub.sql.gz` (and `crazy-hub-uploads.zip` if it isn't empty) to the Claude session that
takes screenshots. Make a fresh dump when the data on the portal has changed a lot.

## 3. Use it (Claude, in the sandbox)

```sh
createdb -h localhost -U postgres crazyhub_owner
gunzip -c crazy-hub.sql.gz | psql -h localhost -U postgres -d crazyhub_owner -v ON_ERROR_STOP=1
DATABASE_URL=postgresql://postgres:password@localhost:5432/crazyhub_owner bun run db:migrate
```

- Sign in for screenshots with a separate review account created in the copy (never the owner's own
  credentials); give it the admin role there.
- The dump comes from the frozen patch build (Quackback v0.15.0 + patches). The schema is Quackback's, so
  `db:migrate` brings it to the current `main`.
- Delete the copy when the session ends.
