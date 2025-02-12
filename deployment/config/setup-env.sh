#!/bin/bash

# Colors pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENV=${1:-development}

# Validate environment
if [[ ! "$ENV" =~ ^(development|production|test)$ ]]; then
    echo -e "${RED}Invalid environment. Use: development, production, or test${NC}"
    exit 1
fi

echo -e "${YELLOW}Setting up $ENV environment...${NC}"

# Create backup directory
BACKUP_DIR="deployment/config/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Setup Backend
echo -e "\n${GREEN}Setting up backend configuration...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}Backing up existing backend .env...${NC}"
    cp "backend/.env" "$BACKUP_DIR/backend.env.bak"
fi
cp "deployment/config/$ENV/backend.env" "backend/.env"
echo -e "${GREEN}✓ Backend .env updated${NC}"

# Setup Frontend
echo -e "\n${GREEN}Setting up frontend configuration...${NC}"
if [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}Backing up existing frontend .env...${NC}"
    cp "frontend/.env" "$BACKUP_DIR/frontend.env.bak"
fi
cp "deployment/config/$ENV/frontend.env" "frontend/.env"
echo -e "${GREEN}✓ Frontend .env updated${NC}"

# If production environment, run additional setup
if [ "$ENV" == "production" ]; then
    echo -e "\n${YELLOW}Running production setup script...${NC}"
    ./deployment/config/production/setup-config.sh
fi

echo -e "\n${GREEN}Environment setup complete!${NC}"
echo -e "${YELLOW}Backups saved in: $BACKUP_DIR${NC}"
echo -e "${YELLOW}Please review the .env files and update any necessary values.${NC}" 