#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DB_FILE="$BACKUP_DIR/servicehub-db-$TIMESTAMP.sql.gz"
UPLOADS_FILE="$BACKUP_DIR/servicehub-uploads-$TIMESTAMP.tar.gz"

if [ ! -f .env.production ]; then
  echo "Missing .env.production" >&2
  exit 1
fi

# The production compose file uses the default database/user names from
# .env.production.example. If you customize them, pass DB_USER and DB_NAME.
DB_USER="${DB_USER:-servicehub}"
DB_NAME="${DB_NAME:-servicehub}"

echo "Creating PostgreSQL backup: $DB_FILE"
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$DB_FILE"

echo "Creating uploads backup: $UPLOADS_FILE"
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T backend \
  tar -czf - -C /app/uploads . > "$UPLOADS_FILE"

echo "Backups complete."
