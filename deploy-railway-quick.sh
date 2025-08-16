#!/bin/bash

echo "🚀 Quick Railway Backend Deployment"
echo "==================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📤 Pushing code to GitHub...${NC}"
git add .
git commit -m "Quick Railway deployment - Fix login issue" || true
git push origin main
echo -e "${GREEN}✅ Code pushed${NC}"

echo -e "\n${BLUE}🌐 Opening Railway for deployment...${NC}"
open "https://railway.app/new"

echo -e "\n${CYAN}📋 QUICK RAILWAY DEPLOYMENT${NC}"
echo -e "${BLUE}==========================${NC}"

echo -e "\n${YELLOW}1. Click 'Deploy from GitHub repo'${NC}"
echo -e "${YELLOW}2. Connect repository:${NC}"
echo -e "${BLUE}   https://github.com/Sandeepvanga22/ibm_knowlege${NC}"
echo -e "${YELLOW}3. Railway will automatically:${NC}"
echo -e "${BLUE}   • Detect Node.js project${NC}"
echo -e "${BLUE}   • Install dependencies${NC}"
echo -e "${BLUE}   • Start the server${NC}"
echo -e "${BLUE}   • Provide a public URL${NC}"

echo -e "\n${BLUE}🔑 Add Environment Variables:${NC}"
echo "NODE_ENV=production"
echo "JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024"
echo "AGENT_CONFIDENCE_THRESHOLD=0.7"
echo "ENABLE_MOCK_DATA=true"
echo "CORS_ORIGIN=https://sandeepvanga22.github.io"

echo -e "\n${GREEN}✅ Railway deployment is much faster than Render!${NC}"
echo -e "${YELLOW}⏳ Deployment will take 2-3 minutes...${NC}"

echo -e "\n${PURPLE}🎯 After deployment:${NC}"
echo -e "${CYAN}Frontend:${NC} https://sandeepvanga22.github.io/ibm_knowlege/"
echo -e "${CYAN}Backend:${NC} https://your-app-name.railway.app"

echo -e "\n${BLUE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password"
