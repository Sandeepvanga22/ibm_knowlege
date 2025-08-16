#!/bin/bash

echo "🚀 Deploying IBM Knowledge Ecosystem Frontend to Vercel"
echo "======================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📤 Pushing code to GitHub...${NC}"
git add .
git commit -m "Deploy frontend to Vercel - Fix hosting issue" || true
git push origin main
echo -e "${GREEN}✅ Code pushed${NC}"

echo -e "\n${BLUE}🌐 Opening Vercel for frontend deployment...${NC}"
open "https://vercel.com/new"

echo -e "\n${CYAN}📋 VERCEL FRONTEND DEPLOYMENT${NC}"
echo -e "${BLUE}================================${NC}"

echo -e "\n${YELLOW}1. Click 'Import Git Repository'${NC}"
echo -e "${YELLOW}2. Connect repository:${NC}"
echo -e "${BLUE}   https://github.com/Sandeepvanga22/ibm_knowlege${NC}"
echo -e "${YELLOW}3. Configure project:${NC}"
echo -e "${BLUE}   • Project Name: ibm-knowledge-frontend${NC}"
echo -e "${BLUE}   • Framework Preset: Create React App${NC}"
echo -e "${BLUE}   • Root Directory: client${NC}"
echo -e "${BLUE}   • Build Command: npm run build${NC}"
echo -e "${BLUE}   • Output Directory: build${NC}"
echo -e "${YELLOW}4. Click 'Deploy'${NC}"

echo -e "\n${GREEN}✅ Vercel will automatically:${NC}"
echo -e "${BLUE}   • Install dependencies${NC}"
echo -e "${BLUE}   • Build the React app${NC}"
echo -e "${BLUE}   • Deploy to CDN${NC}"
echo -e "${BLUE}   • Provide a public URL${NC}"

echo -e "\n${PURPLE}🎯 After deployment:${NC}"
echo -e "${CYAN}Frontend:${NC} https://ibm-knowledge-frontend.vercel.app"
echo -e "${CYAN}Backend:${NC} Will deploy next"

echo -e "\n${BLUE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password"

echo -e "\n${GREEN}🎉 Frontend deployment will be ready in 2-3 minutes!${NC}"

# Create a test script
cat > test-vercel-deployment.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Vercel Frontend Deployment"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

FRONTEND_URL="https://ibm-knowledge-frontend.vercel.app"

echo -e "${BLUE}🔍 Testing frontend accessibility...${NC}"
if curl -s "$FRONTEND_URL" | grep -q "IBM Knowledge Ecosystem"; then
    echo -e "${GREEN}✅ Frontend is accessible at: $FRONTEND_URL${NC}"
else
    echo -e "${RED}❌ Frontend not accessible yet${NC}"
fi

echo -e "\n${BLUE}🎯 Test Login:${NC}"
echo -e "${YELLOW}1. Go to:${NC} $FRONTEND_URL"
echo -e "${YELLOW}2. Try to login with:${NC}"
echo -e "${GREEN}   IBM ID:${NC} EMP001"
echo -e "${GREEN}   Password:${NC} Any password"

echo -e "\n${GREEN}🎉 Test complete!${NC}"
EOF

chmod +x test-vercel-deployment.sh

echo -e "\n${BLUE}📄 Test script created: ./test-vercel-deployment.sh${NC}"
echo -e "${YELLOW}💡 Run it after deployment to test the frontend${NC}"
