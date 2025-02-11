#!/bin/bash

# Colors pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functie pentru logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Încărcare variabile de mediu
source ./deployment/config/production/backend.env

# Creare director pentru backup dacă nu există
BACKUP_DIR="./backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Backup bază de date
log "Începere backup bază de date..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="${BACKUP_DIR}/database_${TIMESTAMP}.sql"

mysqldump -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" > "${DB_BACKUP_FILE}"
if [ $? -ne 0 ]; then
    error "Backup bază de date eșuat"
    exit 1
fi
log "Backup bază de date salvat în ${DB_BACKUP_FILE}"

# Backup fișiere aplicație
log "Începere backup fișiere aplicație..."
APP_BACKUP_FILE="${BACKUP_DIR}/app_${TIMESTAMP}.tar.gz"

# Excludem node_modules, .git și alte fișiere temporare
tar --exclude='./node_modules' \
    --exclude='./.git' \
    --exclude='./backups' \
    --exclude='./dist' \
    --exclude='./build' \
    -czf "${APP_BACKUP_FILE}" .

if [ $? -ne 0 ]; then
    error "Backup fișiere aplicație eșuat"
    exit 1
fi
log "Backup fișiere aplicație salvat în ${APP_BACKUP_FILE}"

# Curățare backup-uri vechi (păstrăm ultimele 7 zile)
log "Curățare backup-uri vechi..."
find ./backups -type d -mtime +7 -exec rm -rf {} \;

log "Backup completat cu succes!"
exit 0 