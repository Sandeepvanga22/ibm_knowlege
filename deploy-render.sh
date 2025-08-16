#!/bin/bash

# IBM Knowledge Ecosystem - Render Deployment Script
# This will give you a working public URL like Heroku

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 IBM Knowledge Ecosystem - Render Deployment"
echo "=============================================="
echo ""

# Check if git remote is set
if ! git remote get-url origin &>/dev/null; then
    print_error "Git remote not set. Please set up GitHub repository first."
    echo ""
    echo "Run these commands:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-ecosystem.git"
    echo "git push -u origin main"
    exit 1
fi

print_success "Git remote is configured!"

# Push to GitHub
print_status "Pushing code to GitHub..."
git add .
git commit -m "Deploy to Render" || true
git push origin main

print_success "Code pushed to GitHub!"

echo ""
echo "🌐 Now deploy to Render to get your public URL:"
echo ""
echo "1. Go to: https://render.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository: sandeep22/ibm-knowledge-ecosystem"
echo "5. Configure the service:"
echo "   - Name: ibm-knowledge-ecosystem"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Plan: Free"
echo ""
echo "6. Add Environment Variables:"
echo "   NODE_ENV=production"
echo "   JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024"
echo "   AGENT_CONFIDENCE_THRESHOLD=0.7"
echo "   ENABLE_MOCK_DATA=true"
echo ""
echo "7. Add Database:"
echo "   - Click 'New +' → 'PostgreSQL'"
echo "   - Name: ibm-knowledge-db"
echo "   - Plan: Free"
echo "   - Copy the Internal Database URL"
echo "   - Add as DATABASE_URL environment variable"
echo ""
echo "8. Add Redis:"
echo "   - Click 'New +' → 'Redis'"
echo "   - Name: ibm-knowledge-redis"
echo "   - Plan: Free"
echo "   - Copy the Internal Redis URL"
echo "   - Add as REDIS_URL environment variable"
echo ""
echo "9. Deploy!"
echo ""
echo "🌟 Your IBM Knowledge Ecosystem will be available at:"
echo "   https://ibm-knowledge-ecosystem.onrender.com"
echo ""
echo "🔧 Demo Login:"
echo "   IBM ID: EMP001, EMP002, EMP003"
echo "   Password: Any password (demo mode)"
echo ""
print_success "Deployment instructions ready!"
echo ""
echo "📱 Your app is currently running locally at:"
echo "   http://localhost:3000"
echo ""
echo "🌐 After Render deployment, it will be available publicly!"
