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

# Verificare endpoint backend health
BACKEND_URL="http://localhost:${PORT}/health"
log "Verificare backend health la ${BACKEND_URL}..."

RETRY_COUNT=0
MAX_RETRIES=5
WAIT_TIME=10

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${BACKEND_URL})
    
    if [ "$RESPONSE" = "200" ]; then
        log "Backend health check: OK"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            error "Backend health check eșuat după ${MAX_RETRIES} încercări"
            exit 1
        fi
        log "Încercare ${RETRY_COUNT}/${MAX_RETRIES} eșuată. Se așteaptă ${WAIT_TIME} secunde..."
        sleep $WAIT_TIME
    fi
done

# Verificare conexiune bază de date
log "Verificare conexiune bază de date..."
if ! nc -z -w5 ${DB_HOST} ${DB_PORT}; then
    error "Nu se poate conecta la baza de date"
    exit 1
fi
log "Conexiune bază de date: OK"

# Verificare conexiune Redis
log "Verificare conexiune Redis..."
if ! nc -z -w5 ${REDIS_HOST} ${REDIS_PORT}; then
    error "Nu se poate conecta la Redis"
    exit 1
fi
log "Conexiune Redis: OK"

# Verificare procese PM2
log "Verificare procese PM2..."
if ! pm2 list | grep -q "eplatform-backend.*online"; then
    error "Procesul backend nu rulează în PM2"
    exit 1
fi
log "Procese PM2: OK"

log "Toate verificările au trecut cu succes!"
exit 0 