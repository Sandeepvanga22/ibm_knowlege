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
