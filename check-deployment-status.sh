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
