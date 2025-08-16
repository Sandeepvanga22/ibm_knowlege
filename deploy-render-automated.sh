#!/bin/bash

echo "🚀 IBM Knowledge Ecosystem - Automated Render Deployment"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="Sandeepvanga22/ibm_knowlege"
FRONTEND_URL="https://ibm-knowledge-ecosystem-9821fgfbw-sandeeps-projects-08af41b7.vercel.app"
BACKEND_NAME="ibm-knowledge-backend"
DB_NAME="ibm-knowledge-db"

echo -e "${CYAN}📋 Current Status:${NC}"
echo -e "${GREEN}✅ Frontend deployed to Vercel: ${FRONTEND_URL}${NC}"
echo -e "${YELLOW}⏳ Backend needs deployment to Render${NC}"
echo -e "${YELLOW}⏳ Database needs creation on Render${NC}"

echo -e "\n${PURPLE}🔧 Step 1: Verify GitHub Repository${NC}"
if git remote get-url origin | grep -q "github.com"; then
    echo -e "${GREEN}✅ GitHub repository connected${NC}"
    echo -e "${BLUE}Repository: $(git remote get-url origin)${NC}"
else
    echo -e "${RED}❌ GitHub repository not found${NC}"
    exit 1
fi

echo -e "\n${PURPLE}📤 Step 2: Push Latest Code${NC}"
git add .
git commit -m "Deploy to Render - Automated deployment" || true
git push origin main
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"

echo -e "\n${PURPLE}🌐 Step 3: Open Render Dashboard${NC}"
echo -e "${YELLOW}Opening Render dashboard in your browser...${NC}"

# Open Render in browser
if command -v open &> /dev/null; then
    open https://render.com
elif command -v xdg-open &> /dev/null; then
    xdg-open https://render.com
else
    echo -e "${YELLOW}Please open: https://render.com${NC}"
fi

echo -e "\n${CYAN}📝 AUTOMATED DEPLOYMENT INSTRUCTIONS${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${PURPLE}🗄️  Step 4: Create PostgreSQL Database${NC}"
echo -e "${YELLOW}1. Click 'New +' → 'PostgreSQL'${NC}"
echo -e "${YELLOW}2. Configure:${NC}"
echo "   • Name: ${DB_NAME}"
echo "   • Plan: Free"
echo "   • Region: Choose closest to you"
echo -e "${YELLOW}3. Click 'Create Database'${NC}"
echo -e "${YELLOW}4. Copy the 'Internal Database URL'${NC}"

echo -e "\n${PURPLE}⚙️  Step 5: Create Web Service${NC}"
echo -e "${YELLOW}1. Click 'New +' → 'Web Service'${NC}"
echo -e "${YELLOW}2. Connect GitHub repository:${NC}"
echo "   • Search for: ${REPO_NAME}"
echo "   • Or paste: https://github.com/${REPO_NAME}"
echo -e "${YELLOW}3. Configure service:${NC}"
echo "   • Name: ${BACKEND_NAME}"
echo "   • Environment: Node"
echo "   • Build Command: npm install"
echo "   • Start Command: npm start"
echo "   • Plan: Free"

echo -e "\n${PURPLE}🔑 Step 6: Add Environment Variables${NC}"
echo -e "${YELLOW}In your web service settings, add these environment variables:${NC}"
echo ""
echo "NODE_ENV=production"
echo "JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024"
echo "AGENT_CONFIDENCE_THRESHOLD=0.7"
echo "ENABLE_MOCK_DATA=true"
echo "CORS_ORIGIN=${FRONTEND_URL}"
echo "DATABASE_URL=postgresql://[paste-your-database-url-here]"
echo ""

echo -e "\n${PURPLE}🔗 Step 7: Connect Database${NC}"
echo -e "${YELLOW}1. Go to your PostgreSQL service${NC}"
echo -e "${YELLOW}2. Copy the 'Internal Database URL'${NC}"
echo -e "${YELLOW}3. Paste it as DATABASE_URL environment variable${NC}"

echo -e "\n${PURPLE}🚀 Step 8: Deploy${NC}"
echo -e "${YELLOW}1. Click 'Create Web Service'${NC}"
echo -e "${YELLOW}2. Wait for deployment (5-10 minutes)${NC}"
echo -e "${YELLOW}3. Your backend will be available at:${NC}"
echo -e "${BLUE}   https://${BACKEND_NAME}.onrender.com${NC}"

echo -e "\n${GREEN}✅ FINAL RESULT${NC}"
echo -e "${BLUE}===============${NC}"
echo -e "${CYAN}Frontend:${NC} ${FRONTEND_URL}"
echo -e "${CYAN}Backend:${NC} https://${BACKEND_NAME}.onrender.com"
echo -e "${CYAN}Database:${NC} PostgreSQL on Render"
echo -e "${CYAN}Cost:${NC} $0/month (completely free)"

echo -e "\n${PURPLE}🎯 Demo Access${NC}"
echo -e "${YELLOW}IBM ID:${NC} EMP001, EMP002, EMP003"
echo -e "${YELLOW}Password:${NC} Any password (demo mode)"

echo -e "\n${GREEN}🎉 Your IBM Knowledge Ecosystem will be fully functional!${NC}"
echo -e "${YELLOW}⏳ Total deployment time: 10-15 minutes${NC}"

# Create a quick reference file
cat > RENDER_DEPLOYMENT_QUICK_REFERENCE.md << EOF
# 🚀 Render Deployment Quick Reference

## Services to Create:

### 1. PostgreSQL Database
- Name: ${DB_NAME}
- Plan: Free
- Copy Internal Database URL

### 2. Web Service
- Name: ${BACKEND_NAME}
- Repository: ${REPO_NAME}
- Environment: Node
- Build: npm install
- Start: npm start

## Environment Variables:
\`\`\`
NODE_ENV=production
JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024
AGENT_CONFIDENCE_THRESHOLD=0.7
ENABLE_MOCK_DATA=true
CORS_ORIGIN=${FRONTEND_URL}
DATABASE_URL=postgresql://[your-database-url]
\`\`\`

## Final URLs:
- Frontend: ${FRONTEND_URL}
- Backend: https://${BACKEND_NAME}.onrender.com

## Demo Access:
- IBM ID: EMP001, EMP002, EMP003
- Password: Any password
EOF

echo -e "\n${GREEN}📄 Quick reference saved to: RENDER_DEPLOYMENT_QUICK_REFERENCE.md${NC}"
echo -e "${YELLOW}💡 You can refer to this file during deployment${NC}"
