#!/usr/bin/env bash
#
# Safe production deploy for the Auditious Blog CMS (run ON the server).
#
# Live data lives OUTSIDE this repo directory so a code update can never touch it:
#   - Database:  .env  ->  DATABASE_URL=file:/home/ubuntu/cms-data/auditious-blog-cms.db
#   - Uploads :  public/media  ->  symlink to /home/ubuntu/cms-data/media
# See DEPLOY.md for the one-time setup.
#
# What this does: pull latest code, sync the DB schema (Payload `push`), build, restart.
# It NEVER deletes .env, the database, or uploaded media.
#
# Usage:  ./scripts/deploy.sh [branch]        # branch defaults to "main"
set -euo pipefail

APP="${APP_DIR:-/home/ubuntu/auditious-blog-cms}"
BRANCH="${1:-main}"
PORT="${CMS_PORT:-3001}"
PM2_NAME="${PM2_NAME:-auditious-cms}"
REPO_URL="${REPO_URL:-https://github.com/threatsafe/auditious-blog-cms.git}"
SYNC_PORT="${SYNC_PORT:-3778}"

cd "$APP"

echo "==> Fetching latest code ($BRANCH)"
TMP="$(mktemp -d)"
git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$TMP"

echo "==> Syncing code (preserving .env, database, and uploads)"
rsync -a --delete \
  --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='.env' --exclude='*.db' --exclude='*.db-shm' --exclude='*.db-wal' \
  --exclude='public/media' \
  "$TMP"/ "$APP"/
rm -rf "$TMP"

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

# Payload's schema `push` is intentionally disabled during `next build`, and the
# build statically renders pages that query the DB. So sync the live DB's schema
# to the new code in a short runtime pass BEFORE building. `push: true` in
# payload.config.ts makes this additive and data-preserving.
echo "==> Syncing DB schema (Payload push)"
pm2 stop "$PM2_NAME" >/dev/null 2>&1 || true
NODE_OPTIONS=--no-deprecation nohup pnpm exec next dev -p "$SYNC_PORT" >/tmp/cms-schema-sync.log 2>&1 &
SYNC_PID=$!
for _ in $(seq 1 30); do curl -sf -o /dev/null "http://127.0.0.1:${SYNC_PORT}/admin" && break; sleep 2; done
sleep 6
kill "$SYNC_PID" 2>/dev/null || true
pkill -f "next dev -p ${SYNC_PORT}" 2>/dev/null || true
sleep 2

echo "==> Building"
rm -rf .next
pnpm build

echo "==> Restarting"
pm2 restart "$PM2_NAME" --update-env 2>/dev/null \
  || pm2 start node_modules/next/dist/bin/next --name "$PM2_NAME" -- start -p "$PORT"
pm2 save

echo "==> Deployed '$BRANCH' — https://hub.auditious.io"
