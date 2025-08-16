#!/bin/bash

echo "🚀 Deploying IBM Knowledge API to Vercel"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📤 Pushing API code to GitHub...${NC}"
git add .
git commit -m "Add Vercel API functions for immediate login fix" || true
git push origin main
echo -e "${GREEN}✅ Code pushed${NC}"

echo -e "\n${BLUE}🌐 Opening Vercel for API deployment...${NC}"
open "https://vercel.com/new"

echo -e "\n${CYAN}📋 VERCEL API DEPLOYMENT${NC}"
echo -e "${BLUE}========================${NC}"

echo -e "\n${YELLOW}1. Click 'Import Git Repository'${NC}"
echo -e "${YELLOW}2. Connect repository:${NC}"
echo -e "${BLUE}   https://github.com/Sandeepvanga22/ibm_knowlege${NC}"
echo -e "${YELLOW}3. Configure project:${NC}"
echo -e "${BLUE}   • Project Name: ibm-knowledge-api${NC}"
echo -e "${BLUE}   • Framework Preset: Other${NC}"
echo -e "${BLUE}   • Root Directory: ./ (leave empty)${NC}"
echo -e "${YELLOW}4. Click 'Deploy'${NC}"

echo -e "\n${GREEN}✅ Vercel will automatically:${NC}"
echo -e "${BLUE}   • Detect the API functions${NC}"
echo -e "${BLUE}   • Deploy them as serverless functions${NC}"
echo -e "${BLUE}   • Provide a public URL${NC}"

echo -e "\n${PURPLE}🎯 After deployment:${NC}"
echo -e "${CYAN}Frontend:${NC} https://sandeepvanga22.github.io/ibm_knowlege/"
echo -e "${CYAN}API:${NC} https://ibm-knowledge-api.vercel.app/api"

echo -e "\n${BLUE}🎮 Demo Access:${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password"

echo -e "\n${GREEN}🎉 API deployment will be ready in 2-3 minutes!${NC}"

# Create a test script
cat > test-api.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing IBM Knowledge API"
echo "============================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="https://ibm-knowledge-api.vercel.app/api"

echo -e "${BLUE}🔍 Testing API endpoints...${NC}"

# Test login endpoint
echo -e "${YELLOW}Testing login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: https://sandeepvanga22.github.io" \
  -d '{"ibmId":"EMP001","password":"test"}')

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Login endpoint working${NC}"
else
    echo -e "${RED}❌ Login endpoint failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
fi

echo -e "\n${GREEN}🎉 API test complete!${NC}"
EOF

chmod +x test-api.sh

echo -e "\n${BLUE}📄 API test script created: ./test-api.sh${NC}"
echo -e "${YELLOW}💡 Run it after deployment to test the API${NC}"
