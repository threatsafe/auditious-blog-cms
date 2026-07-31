# Deploying the Auditious Blog CMS

Production runs on a single server (Ubuntu + nginx) under **pm2**, served at
`https://hub.auditious.io`. This is a Payload CMS (Next.js) app on **SQLite**.

## Live data lives OUTSIDE the repo directory

The database and uploaded media are kept in a persistent directory so that a code
update can never overwrite or delete them:

| Data | Location | Wired via |
| --- | --- | --- |
| Database | `/home/ubuntu/cms-data/auditious-blog-cms.db` | `.env` → `DATABASE_URL=file:/home/ubuntu/cms-data/auditious-blog-cms.db` |
| Uploads  | `/home/ubuntu/cms-data/media` | `public/media` is a **symlink** to it |

> The `.db` file committed to this repo is only a seed/reference. **Do not** copy it
> over the live database — that would wipe production content.

Daily backups (DB snapshot + media tarball, last 7 kept) run from
`/home/ubuntu/cms-backup.sh` via cron into `/home/ubuntu/cms-backups/`.

## Deploying

```bash
cd /home/ubuntu/auditious-blog-cms
./scripts/deploy.sh          # deploy main  (or: ./scripts/deploy.sh <branch>)
```

`scripts/deploy.sh` pulls the latest code, **preserves** `.env` / database / uploads,
syncs the DB schema, builds, and restarts pm2. It never deletes live data.

## Why the schema-sync step?

This project ships its SQLite DB instead of using migrations, so a live database can
lag the code's schema after a deploy (e.g. a new field or block). `payload.config.ts`
sets `push: true` (additive, data-preserving schema sync), but Payload disables `push`
during `next build` — and the build statically renders pages that query the DB. So the
deploy script runs a short runtime pass first to apply the schema, then builds.

**Recommended long-term:** adopt Payload migrations (`pnpm payload migrate:create`) and
run `pnpm payload migrate` on deploy instead of relying on `push` + a committed `.db`.

## CI

`.github/workflows/main.yml` currently only **builds** (a check). It does not deploy.
To automate deploys, add a job that SSHes to the server and runs `scripts/deploy.sh`
(requires an org owner to add `DEPLOY_HOST` / `DEPLOY_SSH_KEY` repo secrets).
