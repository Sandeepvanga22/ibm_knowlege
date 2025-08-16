#!/bin/bash

# Quick Agent Testing Script
echo "🧪 Quick Agent Testing"
echo "====================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test URL
URL="https://ibmprojec.netlify.app"

echo -e "${BLUE}🌐 Testing Netlify deployment: ${URL}${NC}"

# Test 1: Check if the site is accessible
echo -e "\n${YELLOW}1. Testing site accessibility...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Site is accessible${NC}"
else
    echo -e "${RED}❌ Site is not accessible${NC}"
    exit 1
fi

echo -e "\n${BLUE}🎯 QUICK AGENT TESTING GUIDE:${NC}"

echo -e "\n${GREEN}📋 Step-by-Step Instructions:${NC}"
echo -e "${YELLOW}1. Open your browser and go to: ${URL}/agents${NC}"
echo -e "${YELLOW}2. Scroll down to 'Test Agents with Any Question' section${NC}"
echo -e "${YELLOW}3. Enter one of these test questions:${NC}"

echo -e "\n${GREEN}🧪 Test Questions:${NC}"
echo -e "${YELLOW}• 'How to implement generative AI in our cloud platform?'${NC}"
echo -e "${YELLOW}• 'What are the best practices for Kubernetes security?'${NC}"
echo -e "${YELLOW}• 'How to set up CI/CD pipelines for microservices?'${NC}"
echo -e "${YELLOW}• 'How to optimize Docker containers for production?'${NC}"
echo -e "${YELLOW}• 'What are the latest cybersecurity threats?'${NC}"

echo -e "\n${GREEN}🎯 Expected Results:${NC}"
echo -e "${YELLOW}• Smart Routing Agent (Green): Routes to appropriate team${NC}"
echo -e "${YELLOW}• Duplicate Detection Agent (Red): Shows similarity analysis${NC}"
echo -e "${YELLOW}• Knowledge Gap Agent (Yellow): Identifies missing documentation${NC}"
echo -e "${YELLOW}• Expertise Discovery Agent (Purple): Finds relevant experts${NC}"

echo -e "\n${GREEN}🔍 What to Look For:${NC}"
echo -e "${YELLOW}✅ Loading animation when you click 'Test All Agents'${NC}"
echo -e "${YELLOW}✅ Four colored cards with analysis results${NC}"
echo -e "${YELLOW}✅ Intelligent routing based on question content${NC}"
echo -e "${YELLOW}✅ Realistic confidence scores (80-95%)${NC}"
echo -e "${YELLOW}✅ Relevant expert recommendations${NC}"

echo -e "\n${GREEN}🎯 Agent Capabilities:${NC}"
echo -e "${YELLOW}• AI Questions → Routes to AI & Machine Learning team${NC}"
echo -e "${YELLOW}• Security Questions → Routes to Security & Compliance team${NC}"
echo -e "${YELLOW}• Cloud Questions → Routes to Cloud Infrastructure team${NC}"
echo -e "${YELLOW}• Database Questions → Routes to Data Engineering team${NC}"
echo -e "${YELLOW}• DevOps Questions → Routes to DevOps & Automation team${NC}"

echo -e "\n${GREEN}🚀 Ready to Test!${NC}"
echo -e "${BLUE}Visit: ${URL}/agents${NC}"
echo -e "${YELLOW}Enter any question and watch the agents work their magic!${NC}"
