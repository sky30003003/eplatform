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

# Setup Backend
echo -e "\n${GREEN}Setting up backend configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    cp "deployment/config/$ENV/backend.env" "backend/.env"
    echo -e "${GREEN}✓ Backend .env created${NC}"
else
    echo -e "${YELLOW}Backend .env already exists. Skipping...${NC}"
fi

# Setup Frontend
echo -e "\n${GREEN}Setting up frontend configuration...${NC}"
if [ ! -f "frontend/.env" ]; then
    cp "deployment/config/$ENV/frontend.env" "frontend/.env"
    echo -e "${GREEN}✓ Frontend .env created${NC}"
else
    echo -e "${YELLOW}Frontend .env already exists. Skipping...${NC}"
fi

# If production environment, run additional setup
if [ "$ENV" == "production" ]; then
    echo -e "\n${YELLOW}Running production setup script...${NC}"
    ./deployment/config/production/setup-config.sh
fi

echo -e "\n${GREEN}Environment setup complete!${NC}"
echo -e "${YELLOW}Please review the .env files and update any necessary values.${NC}" 