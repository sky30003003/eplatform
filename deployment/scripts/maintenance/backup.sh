#!/bin/bash

# Definire culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurare
BACKUP_DIR="/backup"
DB_NAME="eplatform"
DB_USER="postgres"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Verificare și creare director backup
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
fi

echo -e "${YELLOW}Începere backup - $DATE${NC}"

# Backup Database
echo -e "\n${YELLOW}Backup Database...${NC}"
pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_$DATE.sql"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup database realizat cu succes${NC}"
else
    echo -e "${RED}✗ Eroare la backup database${NC}"
    exit 1
fi

# Backup Fișiere
echo -e "\n${YELLOW}Backup Fișiere...${NC}"
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup fișiere realizat cu succes${NC}"
else
    echo -e "${RED}✗ Eroare la backup fișiere${NC}"
    exit 1
fi

# Compresie și arhivare
echo -e "\n${YELLOW}Compresie și arhivare...${NC}"
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
    "$BACKUP_DIR/db_$DATE.sql" \
    "$BACKUP_DIR/files_$DATE.tar.gz"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Arhivare realizată cu succes${NC}"
    # Ștergere fișiere temporare
    rm "$BACKUP_DIR/db_$DATE.sql" "$BACKUP_DIR/files_$DATE.tar.gz"
else
    echo -e "${RED}✗ Eroare la arhivare${NC}"
    exit 1
fi

# Curățare backup-uri vechi
echo -e "\n${YELLOW}Curățare backup-uri vechi...${NC}"
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Curățare backup-uri vechi realizată cu succes${NC}"
else
    echo -e "${RED}✗ Eroare la curățarea backup-urilor vechi${NC}"
fi

echo -e "\n${GREEN}Backup complet realizat cu succes!${NC}"
echo -e "Locație backup: $BACKUP_DIR/backup_$DATE.tar.gz" 