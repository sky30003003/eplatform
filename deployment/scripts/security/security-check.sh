#!/bin/bash

# Definire culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Începere verificări de securitate...${NC}\n"

# Verificare permisiuni fișiere
echo -e "${YELLOW}Verificare permisiuni fișiere:${NC}"
find . -type f -perm /o+w -ls
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nu s-au găsit fișiere cu permisiuni de scriere pentru toți utilizatorii${NC}"
else
    echo -e "${RED}✗ S-au găsit fișiere cu permisiuni de scriere pentru toți utilizatorii${NC}"
fi

# Verificare fișiere de configurare
echo -e "\n${YELLOW}Verificare fișiere de configurare:${NC}"
config_files=(".env" "config/*.env" "*.config.js")
for pattern in "${config_files[@]}"; do
    files=$(find . -name "$pattern" -type f)
    if [ ! -z "$files" ]; then
        echo -e "${RED}! Fișiere de configurare găsite:${NC}"
        echo "$files"
    fi
done

# Verificare dependințe vulnerabile
echo -e "\n${YELLOW}Verificare dependințe vulnerabile:${NC}"
if [ -f "package.json" ]; then
    echo "Rulare npm audit..."
    npm audit
else
    echo -e "${YELLOW}Nu s-a găsit package.json${NC}"
fi

# Verificare porturi deschise
echo -e "\n${YELLOW}Verificare porturi deschise:${NC}"
netstat -tuln | grep LISTEN

# Verificare procese suspecte
echo -e "\n${YELLOW}Verificare procese suspecte:${NC}"
ps aux | grep -i "suspicious\|malware\|virus" | grep -v grep

# Verificare fișiere de log pentru activități suspecte
echo -e "\n${YELLOW}Verificare logs pentru activități suspecte:${NC}"
suspicious_patterns=("SQL injection" "XSS" "attack" "hack" "exploit")
log_files=("/var/log/nginx/access.log" "/var/log/nginx/error.log" "logs/app.log")

for pattern in "${suspicious_patterns[@]}"; do
    echo -e "\nCăutare pentru: $pattern"
    for log in "${log_files[@]}"; do
        if [ -f "$log" ]; then
            grep -i "$pattern" "$log" | tail -n 5
        fi
    done
done

# Verificare certificate SSL
echo -e "\n${YELLOW}Verificare certificate SSL:${NC}"
if [ -f "/etc/nginx/ssl/eplatform.crt" ]; then
    openssl x509 -in /etc/nginx/ssl/eplatform.crt -noout -dates
else
    echo -e "${RED}Nu s-a găsit certificatul SSL${NC}"
fi

echo -e "\n${GREEN}Verificări de securitate complete!${NC}" 