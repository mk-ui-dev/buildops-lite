#!/bin/bash
set -euo pipefail

# BuildOps Lite Restore Script

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "Restoring from: ${BACKUP_FILE}"

# Extract backup
TEMP_DIR=$(mktemp -d)
tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"

# Stop services
echo "Stopping services..."
docker compose -f docker-compose.prod.yml down

# Restore database
echo "Restoring database..."
docker compose -f docker-compose.prod.yml up -d postgres
sleep 5
gunzip < "${TEMP_DIR}"/*_db.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U buildops buildops

# Restore files
echo "Restoring files..."
docker compose -f docker-compose.prod.yml up -d minio
sleep 5
docker compose -f docker-compose.prod.yml exec -T minio mc mirror "${TEMP_DIR}"/*_files /data

# Cleanup
rm -rf "${TEMP_DIR}"

# Restart all services
echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "Restore complete!"
