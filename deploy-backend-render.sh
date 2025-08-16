#!/bin/bash

echo "🚀 Deploying IBM Knowledge Ecosystem Backend to Render"
echo "======================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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
    echo -e "${RED}❌ No remote repository found. Please set up GitHub repository first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met!${NC}"

echo -e "\n${BLUE}📤 Step 1: Push latest code to GitHub${NC}"
git add .
git commit -m "Deploy backend to Render - Fix GitHub Pages API connection" || true
git push origin main
echo -e "${GREEN}✅ Code pushed to GitHub!${NC}"

echo -e "\n${BLUE}🌐 Step 2: Open Render Dashboard${NC}"
echo -e "${YELLOW}Opening Render dashboard...${NC}"

# Open Render in browser
if command -v open &> /dev/null; then
    open https://render.com
elif command -v xdg-open &> /dev/null; then
    xdg-open https://render.com
else
    echo -e "${YELLOW}Please open: https://render.com${NC}"
fi

echo -e "\n${BLUE}📝 Manual Steps for Backend Deployment:${NC}"
echo -e "${YELLOW}1. Sign up/Login to Render with GitHub${NC}"
echo -e "${YELLOW}2. Click 'New +' → 'PostgreSQL'${NC}"
echo -e "${YELLOW}3. Configure Database:${NC}"
echo "   - Name: ibm-knowledge-db"
echo "   - Plan: Free"
echo "   - Region: Choose closest to you"
echo -e "${YELLOW}4. Click 'Create Database'${NC}"
echo -e "${YELLOW}5. Copy the 'Internal Database URL'${NC}"

echo -e "\n${BLUE}⚙️  Step 3: Create Web Service${NC}"
echo -e "${YELLOW}1. Click 'New +' → 'Web Service'${NC}"
echo -e "${YELLOW}2. Connect your GitHub repository${NC}"
echo -e "${YELLOW}3. Configure Backend Service:${NC}"
echo "   - Name: ibm-knowledge-backend"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Plan: Free"

echo -e "\n${BLUE}🔑 Step 4: Add Environment Variables${NC}"
echo "NODE_ENV=production"
echo "JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024"
echo "AGENT_CONFIDENCE_THRESHOLD=0.7"
echo "ENABLE_MOCK_DATA=true"
echo "CORS_ORIGIN=https://sandeepvanga22.github.io"
echo "DATABASE_URL=postgresql://[paste-your-database-url-here]"

echo -e "\n${BLUE}🔗 Step 5: Connect Database${NC}"
echo -e "${YELLOW}1. Go to your PostgreSQL service${NC}"
echo -e "${YELLOW}2. Copy the 'Internal Database URL'${NC}"
echo -e "${YELLOW}3. Paste it as DATABASE_URL environment variable${NC}"

echo -e "\n${BLUE}🚀 Step 6: Deploy${NC}"
echo -e "${YELLOW}1. Click 'Create Web Service'${NC}"
echo -e "${YELLOW}2. Wait for deployment (5-10 minutes)${NC}"

echo -e "\n${GREEN}✅ After deployment, your URLs will be:${NC}"
echo -e "${BLUE}Frontend:${NC} https://sandeepvanga22.github.io/ibm_knowlege/"
echo -e "${BLUE}Backend:${NC} https://ibm-knowledge-backend.onrender.com"

echo -e "\n${YELLOW}⏳ Deployment will take 5-10 minutes...${NC}"
echo -e "${GREEN}🎉 Your IBM Knowledge Ecosystem will be fully functional!${NC}"

echo -e "\n${BLUE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password (demo mode)"
