#!/usr/bin/env bash
set -euo pipefail

: "${APP_DB_NAME:?missing}"; : "${APP_DB_USER:?missing}"; : "${APP_DB_PASSWORD:?missing}"

TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$TEMPLATE_DIR/01_create_db.sql"
OUT="$TEMPLATE_DIR/01_create_db.built.sql"

sed \
  -e "s/:APP_DB_NAME_TEMPLATE/${APP_DB_NAME}/g" \
  -e "s/:APP_DB_USER_TEMPLATE/${APP_DB_USER}/g" \
  -e "s/:APP_DB_PASSWORD_TEMPLATE/${APP_DB_PASSWORD}/g" \
  "$SRC" > "$OUT"

echo "Generated $OUT"
