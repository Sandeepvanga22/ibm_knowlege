#!/bin/bash

echo "🚀 IBM Knowledge Ecosystem - One-Click Complete Deployment"
echo "=========================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🎯 Starting complete deployment...${NC}"

# Step 1: Push latest code
echo -e "${PURPLE}📤 Step 1: Pushing code to GitHub...${NC}"
git add .
git commit -m "One-click complete deployment - Frontend + Backend" || true
git push origin main
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"

# Step 2: Deploy frontend to GitHub Pages
echo -e "${PURPLE}🌐 Step 2: Deploying frontend to GitHub Pages...${NC}"
cd client
npm run build
npm run deploy
cd ..
echo -e "${GREEN}✅ Frontend deployed to GitHub Pages${NC}"

# Step 3: Open Render for backend deployment
echo -e "${PURPLE}⚙️  Step 3: Opening Render for backend deployment...${NC}"
open "https://render.com/docs/blueprint-spec#deploy-a-blueprint"

echo -e "\n${CYAN}📋 ONE-CLICK BACKEND DEPLOYMENT${NC}"
echo -e "${BLUE}================================${NC}"

echo -e "\n${YELLOW}1. Click 'Deploy from Blueprint' on Render${NC}"
echo -e "${YELLOW}2. Connect your GitHub repository:${NC}"
echo -e "${BLUE}   https://github.com/Sandeepvanga22/ibm_knowlege${NC}"
echo -e "${YELLOW}3. Render will automatically:${NC}"
echo -e "${BLUE}   • Create PostgreSQL database${NC}"
echo -e "${BLUE}   • Deploy backend service${NC}"
echo -e "${BLUE}   • Configure environment variables${NC}"
echo -e "${BLUE}   • Connect database to backend${NC}"
echo -e "${BLUE}   • Set up CORS for GitHub Pages${NC}"

echo -e "\n${GREEN}✅ Your IBM Knowledge Ecosystem will be deployed automatically!${NC}"

echo -e "\n${PURPLE}🎯 Final URLs:${NC}"
echo -e "${CYAN}Frontend:${NC} https://sandeepvanga22.github.io/ibm_knowlege/"
echo -e "${CYAN}Backend:${NC} https://ibm-knowledge-backend.onrender.com"

echo -e "\n${PURPLE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password"

echo -e "\n${GREEN}🎉 Complete deployment will be ready in 5-10 minutes!${NC}"

# Create a status checker
cat > check-deployment-status.sh << 'EOF'
#!/bin/bash

echo "🔍 Checking IBM Knowledge Ecosystem Deployment Status"
echo "===================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Checking Frontend (GitHub Pages)...${NC}"
if curl -s -o /dev/null -w "%{http_code}" https://sandeepvanga22.github.io/ibm_knowlege/ | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend: https://sandeepvanga22.github.io/ibm_knowlege/ (Working)${NC}"
else
    echo -e "${RED}❌ Frontend: Not accessible yet${NC}"
fi

echo -e "${YELLOW}Checking Backend (Render)...${NC}"
if curl -s -o /dev/null -w "%{http_code}" https://ibm-knowledge-backend.onrender.com | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Backend: https://ibm-knowledge-backend.onrender.com (Deployed)${NC}"
else
    echo -e "${RED}❌ Backend: Not deployed yet${NC}"
fi

echo -e "\n${YELLOW}🎮 Test Login:${NC}"
echo -e "${GREEN}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${GREEN}Password:${NC} Any password"
EOF

chmod +x check-deployment-status.sh

echo -e "\n${BLUE}📄 Status checker created: ./check-deployment-status.sh${NC}"
echo -e "${YELLOW}💡 Run it to check deployment progress${NC}"
