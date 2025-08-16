#!/bin/bash

echo "🚀 Deploying IBM Knowledge Ecosystem to GitHub Pages..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Building React app...${NC}"
cd client
npm run build

echo -e "${BLUE}🌐 Deploying to GitHub Pages...${NC}"
npm run deploy

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}🎯 Your IBM Knowledge Ecosystem is now live at:${NC}"
echo -e "${GREEN}https://sandeepvanga22.github.io/ibm_knowlege/${NC}"

echo -e "\n${BLUE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password (demo mode)"

echo -e "\n${GREEN}🎉 Your app is accessible to everyone!${NC}"
