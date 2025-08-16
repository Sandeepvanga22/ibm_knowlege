#!/bin/bash

echo "🔗 Setting up GitHub Repository"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Please create a GitHub repository named 'ibm-knowledge-ecosystem'${NC}"
echo -e "${BLUE}Then run this script with your GitHub username:${NC}"
echo -e "${GREEN}./setup-github.sh YOUR_GITHUB_USERNAME${NC}"

if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./setup-github.sh YOUR_GITHUB_USERNAME${NC}"
    exit 1
fi

GITHUB_USERNAME=$1

echo -e "${BLUE}Setting up remote repository...${NC}"

# Remove existing remote if any
git remote remove origin 2>/dev/null || true

# Add new remote
git remote add origin https://github.com/$GITHUB_USERNAME/ibm-knowledge-ecosystem.git

# Push to GitHub
echo -e "${YELLOW}Pushing code to GitHub...${NC}"
git push -u origin main

echo -e "${GREEN}✅ GitHub repository set up successfully!${NC}"
echo -e "${BLUE}Repository URL: https://github.com/$GITHUB_USERNAME/ibm-knowledge-ecosystem${NC}"

echo -e "\n${YELLOW}Now you can deploy to Render:${NC}"
echo -e "${BLUE}1. Go to https://render.com${NC}"
echo -e "${BLUE}2. Sign up with GitHub${NC}"
echo -e "${BLUE}3. Click 'New +' → 'PostgreSQL'${NC}"
echo -e "${BLUE}4. Create database, then create web service${NC}"
