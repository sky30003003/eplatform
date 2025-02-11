#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to generate a random string
generate_random_string() {
    openssl rand -base64 32
}

echo -e "${YELLOW}Setting up production configuration...${NC}"

# Backend configuration
echo -e "\n${GREEN}Setting up backend configuration...${NC}"

# Generate secure password for database
DB_PASSWORD=$(generate_random_string)
# Generate secure JWT secret
JWT_SECRET=$(generate_random_string)

# Replace placeholders in backend.env
sed -i.bak \
    -e "s/CHANGE_THIS_PASSWORD_IN_PRODUCTION/$DB_PASSWORD/" \
    -e "s/CHANGE_THIS_SECRET_IN_PRODUCTION/$JWT_SECRET/" \
    backend.env

echo -e "${GREEN}✓ Backend configuration updated${NC}"
echo -e "${YELLOW}Please note down these credentials:${NC}"
echo -e "Database Password: $DB_PASSWORD"
echo -e "JWT Secret: $JWT_SECRET"

# Frontend configuration
echo -e "\n${GREEN}Setting up frontend configuration...${NC}"

# Prompt for domain
read -p "Enter your domain (e.g., example.com): " DOMAIN

# Update frontend configuration
sed -i.bak \
    -e "s/eplatform.yourdomain.com/$DOMAIN/" \
    frontend.env

# Update backend configuration with frontend URL
sed -i.bak \
    -e "s/eplatform.yourdomain.com/$DOMAIN/" \
    backend.env

echo -e "${GREEN}✓ Frontend configuration updated${NC}"

# Cleanup backup files
rm *.bak

echo -e "\n${GREEN}Configuration setup complete!${NC}"
echo -e "${YELLOW}Please review the configuration files and update any remaining placeholders.${NC}"

# Make the script executable
chmod +x setup-config.sh 