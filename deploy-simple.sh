#!/bin/bash

echo "🚀 IBM Knowledge Ecosystem - Simple Local Deployment"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Building the React app...${NC}"
cd client
npm run build

echo -e "${GREEN}✅ Build completed successfully!${NC}"

echo -e "${BLUE}🌐 Starting local server...${NC}"
echo -e "${YELLOW}Your IBM Knowledge Ecosystem is now running at:${NC}"
echo -e "${GREEN}http://localhost:3001${NC}"

echo -e "\n${BLUE}🎯 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password (demo mode)"

echo -e "\n${GREEN}🎉 Your IBM Knowledge Ecosystem is now accessible!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Start the server
npx serve -s build -l 3001
