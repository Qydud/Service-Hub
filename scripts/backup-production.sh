#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

# Load production variables for pg_dump connection details.
if [ ! -f .env.production ]; then
  echo "Missing .env.production" >&2
  exit 1
fi

set -a
. ./.env.production
set +a

FILE="$BACKUP_DIR/servicehub-$TIMESTAMP.sql.gz"

echo "Creating PostgreSQL backup: $FILE"
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$FILE"

echo "Backup complete."
