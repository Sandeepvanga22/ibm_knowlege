#!/bin/bash

echo "🚀 IBM Knowledge Ecosystem - Complete Render Deployment"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Prerequisites Check:${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository. Please initialize git first.${NC}"
    exit 1
fi

# Check if we have a remote repository
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  No remote repository found. Creating one...${NC}"
    echo -e "${BLUE}Please create a GitHub repository and run:${NC}"
    echo "git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-ecosystem.git"
    echo "git push -u origin main"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met!${NC}"

echo -e "\n${BLUE}🔧 Step 1: Push code to GitHub${NC}"
echo -e "${YELLOW}Pushing latest changes to GitHub...${NC}"

git add .
git commit -m "Deploy to Render - Complete setup" || true
git push origin main

echo -e "${GREEN}✅ Code pushed to GitHub!${NC}"

echo -e "\n${BLUE}🌐 Step 2: Deploy to Render${NC}"
echo -e "${YELLOW}Opening Render dashboard...${NC}"

# Open Render in browser
if command -v open &> /dev/null; then
    open https://render.com
elif command -v xdg-open &> /dev/null; then
    xdg-open https://render.com
else
    echo -e "${YELLOW}Please open: https://render.com${NC}"
fi

echo -e "\n${BLUE}📝 Manual Steps for Render Deployment:${NC}"
echo -e "${YELLOW}1. Sign up/Login to Render with GitHub${NC}"
echo -e "${YELLOW}2. Click 'New +' → 'PostgreSQL'${NC}"
echo -e "${YELLOW}3. Configure Database:${NC}"
echo "   - Name: ibm-knowledge-db"
echo "   - Plan: Free"
echo "   - Region: Choose closest to you"
echo -e "${YELLOW}4. Click 'New +' → 'Web Service'${NC}"
echo -e "${YELLOW}5. Connect your GitHub repository${NC}"
echo -e "${YELLOW}6. Configure Backend Service:${NC}"
echo "   - Name: ibm-knowledge-backend"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Plan: Free"

echo -e "\n${BLUE}🔑 Environment Variables for Backend:${NC}"
echo "NODE_ENV=production"
echo "JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024"
echo "AGENT_CONFIDENCE_THRESHOLD=0.7"
echo "ENABLE_MOCK_DATA=true"
echo "CORS_ORIGIN=https://ibm-knowledge-ecosystem-roibfcvgy-sandeeps-projects-08af41b7.vercel.app"

echo -e "\n${BLUE}🔗 Database URL:${NC}"
echo "Copy the Internal Database URL from your PostgreSQL service"
echo "Format: postgresql://username:password@host:port/database"

echo -e "\n${GREEN}✅ After deployment, your URLs will be:${NC}"
echo -e "${BLUE}Frontend:${NC} https://ibm-knowledge-ecosystem-roibfcvgy-sandeeps-projects-08af41b7.vercel.app"
echo -e "${BLUE}Backend:${NC} https://ibm-knowledge-backend.onrender.com"

echo -e "\n${YELLOW}⏳ Deployment will take 5-10 minutes...${NC}"
echo -e "${GREEN}🎉 Your IBM Knowledge Ecosystem will be fully functional!${NC}"
