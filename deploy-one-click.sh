#!/bin/bash

echo "🎯 IBM Knowledge Ecosystem - One-Click Render Deployment"
echo "======================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Starting one-click deployment...${NC}"

# Push latest code
echo -e "${PURPLE}📤 Pushing code to GitHub...${NC}"
git add .
git commit -m "One-click Render deployment" || true
git push origin main
echo -e "${GREEN}✅ Code pushed${NC}"

# Open Render with Blueprint
echo -e "${PURPLE}🌐 Opening Render Blueprint deployment...${NC}"
open "https://render.com/docs/blueprint-spec#deploy-a-blueprint"

echo -e "\n${CYAN}📋 ONE-CLICK DEPLOYMENT STEPS${NC}"
echo -e "${BLUE}============================${NC}"

echo -e "\n${YELLOW}1. Click 'Deploy from Blueprint' on Render${NC}"
echo -e "${YELLOW}2. Connect your GitHub repository:${NC}"
echo -e "${BLUE}   https://github.com/Sandeepvanga22/ibm_knowlege${NC}"
echo -e "${YELLOW}3. Render will automatically:${NC}"
echo -e "${BLUE}   • Create PostgreSQL database${NC}"
echo -e "${BLUE}   • Deploy backend service${NC}"
echo -e "${BLUE}   • Configure environment variables${NC}"
echo -e "${BLUE}   • Connect database to backend${NC}"

echo -e "\n${GREEN}✅ Your IBM Knowledge Ecosystem will be deployed automatically!${NC}"

echo -e "\n${PURPLE}🎯 Final URLs:${NC}"
echo -e "${CYAN}Frontend:${NC} https://ibm-knowledge-ecosystem-9821fgfbw-sandeeps-projects-08af41b7.vercel.app"
echo -e "${CYAN}Backend:${NC} https://ibm-knowledge-backend.onrender.com"

echo -e "\n${PURPLE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password"

echo -e "\n${GREEN}🎉 Deployment will be complete in 5-10 minutes!${NC}"
