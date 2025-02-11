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

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificare dacă suntem în directorul corect
if [ ! -f "package.json" ]; then
    error "Scriptul trebuie rulat din directorul rădăcină al proiectului"
    exit 1
fi

# 1. Backup
log "Începere backup..."
./deployment/scripts/backup/backup.sh
if [ $? -ne 0 ]; then
    error "Backup eșuat"
    exit 1
fi
log "Backup completat cu succes"

# 2. Frontend Build
log "Începere build frontend..."
cd frontend
npm ci
npm run build
if [ $? -ne 0 ]; then
    error "Build frontend eșuat"
    exit 1
fi
cd ..
log "Build frontend completat cu succes"

# 3. Backend Build
log "Începere build backend..."
cd backend
npm ci
npm run build
if [ $? -ne 0 ]; then
    error "Build backend eșuat"
    exit 1
fi
cd ..
log "Build backend completat cu succes"

# 4. Migrare bază de date
log "Începere migrare bază de date..."
./deployment/scripts/database/migrate.sh
if [ $? -ne 0 ]; then
    error "Migrare bază de date eșuată"
    exit 1
fi
log "Migrare bază de date completată cu succes"

# 5. Restart servicii
log "Restart servicii..."
pm2 restart eplatform-backend
if [ $? -ne 0 ]; then
    error "Restart backend eșuat"
    exit 1
fi
log "Servicii restarted cu succes"

# 6. Verificare health
log "Verificare health status..."
./deployment/scripts/health-check.sh
if [ $? -ne 0 ]; then
    error "Health check eșuat"
    warning "Consideră rollback dacă este necesar"
    exit 1
fi

log "Deployment completat cu succes!" 