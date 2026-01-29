#!/bin/bash
set -euo pipefail

# BuildOps Lite Backup Script

BACKUP_DIR="${BACKUP_DIR:-/opt/buildops/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="buildops_backup_${TIMESTAMP}"

echo "Creating backup: ${BACKUP_NAME}"

mkdir -p "${BACKUP_DIR}"

# Backup PostgreSQL
echo "Backing up database..."
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U buildops buildops | gzip > "${BACKUP_DIR}/${BACKUP_NAME}_db.sql.gz"

# Backup MinIO data
echo "Backing up files..."
docker compose -f docker-compose.prod.yml exec -T minio mc mirror /data "${BACKUP_DIR}/${BACKUP_NAME}_files"

# Create tar archive
echo "Creating archive..."
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}_db.sql.gz" "${BACKUP_NAME}_files"

# Cleanup individual backups
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}_db.sql.gz" "${BACKUP_DIR}/${BACKUP_NAME}_files"

# Keep only last 7 backups
echo "Cleaning old backups..."
ls -t "${BACKUP_DIR}"/*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup complete: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
