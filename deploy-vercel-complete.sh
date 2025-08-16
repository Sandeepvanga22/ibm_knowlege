#!/bin/bash

echo "🚀 Complete IBM Knowledge Ecosystem Deployment to Vercel"
echo "======================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}📤 Pushing code to GitHub...${NC}"
git add .
git commit -m "Complete Vercel deployment - Frontend + Backend" || true
git push origin main
echo -e "${GREEN}✅ Code pushed${NC}"

echo -e "\n${BLUE}🌐 Opening Vercel for complete deployment...${NC}"
open "https://vercel.com/new"

echo -e "\n${CYAN}📋 COMPLETE VERCEL DEPLOYMENT${NC}"
echo -e "${BLUE}================================${NC}"

echo -e "\n${PURPLE}🎯 Step 1: Deploy Frontend${NC}"
echo -e "${YELLOW}1. Click 'Import Git Repository'${NC}"
echo -e "${YELLOW}2. Connect repository:${NC}"
echo -e "${BLUE}   https://github.com/Sandeepvanga22/ibm_knowlege${NC}"
echo -e "${YELLOW}3. Configure Frontend:${NC}"
echo -e "${BLUE}   • Project Name: ibm-knowledge-frontend${NC}"
echo -e "${BLUE}   • Framework Preset: Create React App${NC}"
echo -e "${BLUE}   • Root Directory: client${NC}"
echo -e "${BLUE}   • Build Command: npm run build${NC}"
echo -e "${BLUE}   • Output Directory: build${NC}"
echo -e "${YELLOW}4. Click 'Deploy'${NC}"

echo -e "\n${PURPLE}🎯 Step 2: Deploy Backend${NC}"
echo -e "${YELLOW}1. Go to: https://vercel.com/new${NC}"
echo -e "${YELLOW}2. Import the same repository again${NC}"
echo -e "${YELLOW}3. Configure Backend:${NC}"
echo -e "${BLUE}   • Project Name: ibm-knowledge-backend${NC}"
echo -e "${BLUE}   • Framework Preset: Node.js${NC}"
echo -e "${BLUE}   • Root Directory: server${NC}"
echo -e "${BLUE}   • Build Command: npm install${NC}"
echo -e "${BLUE}   • Output Directory: .${NC}"
echo -e "${YELLOW}4. Add Environment Variables:${NC}"
echo "   NODE_ENV=production"
echo "   JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024"
echo "   AGENT_CONFIDENCE_THRESHOLD=0.7"
echo "   ENABLE_MOCK_DATA=true"
echo "   CORS_ORIGIN=https://ibm-knowledge-frontend.vercel.app"
echo -e "${YELLOW}5. Click 'Deploy'${NC}"

echo -e "\n${GREEN}✅ Vercel will automatically:${NC}"
echo -e "${BLUE}   • Deploy frontend to CDN${NC}"
echo -e "${BLUE}   • Deploy backend as serverless functions${NC}"
echo -e "${BLUE}   • Handle routing automatically${NC}"
echo -e "${BLUE}   • Provide public URLs${NC}"

echo -e "\n${PURPLE}🎯 Final URLs:${NC}"
echo -e "${CYAN}Frontend:${NC} https://ibm-knowledge-frontend.vercel.app"
echo -e "${CYAN}Backend:${NC} https://ibm-knowledge-backend.vercel.app"

echo -e "\n${BLUE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password"

echo -e "\n${GREEN}🎉 Complete deployment will be ready in 5-10 minutes!${NC}"

# Create a test script
cat > test-vercel-complete.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Complete Vercel Deployment"
echo "====================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

FRONTEND_URL="https://ibm-knowledge-frontend.vercel.app"
BACKEND_URL="https://ibm-knowledge-backend.vercel.app"

echo -e "${BLUE}🔍 Testing frontend...${NC}"
if curl -s "$FRONTEND_URL" | grep -q "IBM Knowledge Ecosystem"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
fi

echo -e "\n${BLUE}🔍 Testing backend...${NC}"
if curl -s "$BACKEND_URL" | grep -q "IBM Knowledge Ecosystem"; then
    echo -e "${GREEN}✅ Backend is accessible${NC}"
else
    echo -e "${RED}❌ Backend not accessible${NC}"
fi

echo -e "\n${BLUE}🎯 Test Complete Login:${NC}"
echo -e "${YELLOW}1. Go to:${NC} $FRONTEND_URL"
echo -e "${YELLOW}2. Try to login with:${NC}"
echo -e "${GREEN}   IBM ID:${NC} EMP001"
echo -e "${GREEN}   Password:${NC} Any password"

echo -e "\n${GREEN}🎉 Complete test finished!${NC}"
EOF

chmod +x test-vercel-complete.sh

echo -e "\n${BLUE}📄 Test script created: ./test-vercel-complete.sh${NC}"
echo -e "${YELLOW}💡 Run it after deployment to test everything${NC}"
