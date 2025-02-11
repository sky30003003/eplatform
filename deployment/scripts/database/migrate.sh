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

# Încărcare variabile de mediu
source ./deployment/config/production/backend.env

# Verificare conexiune bază de date
log "Verificare conexiune bază de date..."
if ! nc -z -w5 ${DB_HOST} ${DB_PORT}; then
    error "Nu se poate conecta la baza de date"
    exit 1
fi

# Navigare în directorul backend
cd backend

# Rulare migrări
log "Rulare migrări..."
npm run typeorm migration:run
if [ $? -ne 0 ]; then
    error "Migrarea a eșuat"
    exit 1
fi

# Verificare status migrări
log "Verificare status migrări..."
npm run typeorm migration:show
if [ $? -ne 0 ]; then
    warning "Nu s-a putut verifica statusul migrărilor"
fi

cd ..

log "Migrare completată cu succes!"
exit 0 