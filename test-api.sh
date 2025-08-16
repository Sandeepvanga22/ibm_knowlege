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
