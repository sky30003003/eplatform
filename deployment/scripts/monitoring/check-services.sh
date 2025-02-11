#!/bin/bash

# Definire culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurare
BACKEND_URL="https://api.eplatform.yourdomain.com/health"
FRONTEND_URL="https://eplatform.yourdomain.com"
DB_HOST="localhost"
DB_PORT="5432"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Funcție pentru verificarea unui serviciu HTTP
check_http() {
    local url=$1
    local name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $url)
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}✓ $name este funcțional (HTTP $response)${NC}"
    else
        echo -e "${RED}✗ $name nu răspunde corect (HTTP $response)${NC}"
    fi
}

# Funcție pentru verificarea unui port
check_port() {
    local host=$1
    local port=$2
    local name=$3
    
    nc -z -w5 $host $port
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $name este accesibil pe portul $port${NC}"
    else
        echo -e "${RED}✗ $name nu este accesibil pe portul $port${NC}"
    fi
}

echo -e "${YELLOW}Verificare Servicii:${NC}\n"

# Verificare Backend
check_http $BACKEND_URL "Backend API"

# Verificare Frontend
check_http $FRONTEND_URL "Frontend"

# Verificare Database
check_port $DB_HOST $DB_PORT "Database"

# Verificare Redis
check_port $REDIS_HOST $REDIS_PORT "Redis"

# Verificare Logs
echo -e "\n${YELLOW}Verificare Logs pentru Erori:${NC}"
if [ -f "/var/log/nginx/error.log" ]; then
    echo "Ultimele 5 erori Nginx:"
    tail -n 5 /var/log/nginx/error.log
fi

if [ -f "logs/app-error.log" ]; then
    echo -e "\nUltimele 5 erori Aplicație:"
    tail -n 5 logs/app-error.log
fi 