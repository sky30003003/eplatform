#!/bin/bash

# Colors pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Încărcare variabile de mediu
ENV=${1:-development}
if [ ! -f "./deployment/config/$ENV/backend.env" ]; then
    error "Nu s-a găsit fișierul de configurare pentru mediul $ENV"
    exit 1
fi

source "./deployment/config/$ENV/backend.env"

# Verificare dacă MySQL este instalat
if ! command -v mysql &> /dev/null; then
    error "MySQL nu este instalat"
    exit 1
fi

log "Inițializare bază de date pentru mediul: $ENV"

# Creare bază de date și utilizator
mysql -h "$DB_HOST" -P "$DB_PORT" -u root -p <<EOF
CREATE DATABASE IF NOT EXISTS $DB_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificare dacă utilizatorul există
SET @user_exists = (SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '$DB_USERNAME' AND host = '%'));

-- Creare utilizator doar dacă nu există
SET @sql = IF(@user_exists = 0,
    CONCAT('CREATE USER \'$DB_USERNAME\'@\'%\' IDENTIFIED BY \'$DB_PASSWORD\''),
    CONCAT('ALTER USER \'$DB_USERNAME\'@\'%\' IDENTIFIED BY \'$DB_PASSWORD\'')
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Acordare privilegii
GRANT ALL PRIVILEGES ON $DB_DATABASE.* TO '$DB_USERNAME'@'%';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    log "Baza de date și utilizatorul au fost create cu succes"
else
    error "A apărut o eroare la crearea bazei de date"
    exit 1
fi

# Instalare dependențe necesare
log "Instalare dependențe..."
cd backend
npm install
if [ $? -ne 0 ]; then
    error "Eroare la instalarea dependențelor"
    exit 1
fi

# Rulare migrări
log "Rulare migrări..."
npm run typeorm migration:run
if [ $? -ne 0 ]; then
    error "A apărut o eroare la aplicarea migrărilor"
    exit 1
fi
log "Migrările au fost aplicate cu succes"

# Creare superadmin
log "Creare superadmin..."
cd ../deployment/scripts/database
npm install typescript ts-node @types/node typeorm mysql2 argon2 uuid dotenv
NODE_ENV=$ENV ts-node create-superadmin.ts
if [ $? -ne 0 ]; then
    error "A apărut o eroare la crearea superadmin-ului"
    exit 1
fi

log "Inițializarea bazei de date s-a încheiat cu succes!" 