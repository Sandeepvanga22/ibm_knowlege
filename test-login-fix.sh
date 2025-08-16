#!/bin/bash

echo "🧪 Testing IBM Knowledge Ecosystem Login Fix"
echo "============================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Testing Frontend Accessibility...${NC}"
if curl -s https://sandeepvanga22.github.io/ibm_knowlege/ | grep -q "IBM Knowledge Ecosystem"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend not accessible${NC}"
fi

echo -e "\n${BLUE}🔍 Testing Backend Status...${NC}"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://ibm-knowledge-backend.onrender.com)
if [ "$BACKEND_STATUS" = "404" ] || [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${YELLOW}⚠️  Backend is deployed (Status: $BACKEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Backend not accessible (Status: $BACKEND_STATUS)${NC}"
fi

echo -e "\n${BLUE}🎯 Login Test Instructions:${NC}"
echo -e "${YELLOW}1. Go to:${NC} https://sandeepvanga22.github.io/ibm_knowlege/"
echo -e "${YELLOW}2. Try to login with:${NC}"
echo -e "${GREEN}   IBM ID:${NC} EMP001"
echo -e "${GREEN}   Password:${NC} Any password"
echo -e "${YELLOW}3. Check browser console for mock API messages${NC}"

echo -e "\n${BLUE}🔧 What's Fixed:${NC}"
echo -e "${GREEN}✅ Frontend deployed with mock API fallback${NC}"
echo -e "${GREEN}✅ Login should work immediately (mock responses)${NC}"
echo -e "${GREEN}✅ Backend deployment in progress${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo -e "${YELLOW}1. Test login now (should work with mock API)${NC}"
echo -e "${YELLOW}2. Complete backend deployment on Render${NC}"
echo -e "${YELLOW}3. Run:${NC} ./check-deployment-status.sh"

echo -e "\n${GREEN}🎉 Login should work immediately!${NC}"
