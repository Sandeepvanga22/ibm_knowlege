#!/bin/bash

# 🚀 IBM Knowledge Ecosystem - Free Hosting Deployment Script
# This script helps deploy to various free hosting platforms

echo "🚀 IBM Knowledge Ecosystem - Free Hosting Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not found. Please initialize git first:"
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    exit 1
fi

# Check if all files are committed
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Deploy to free hosting platform"
fi

echo ""
echo "🎯 Choose your deployment platform:"
echo "1. Render (Recommended - 750 hours/month free)"
echo "2. Railway ($5 credit/month)"
echo "3. Vercel (100GB bandwidth free)"
echo "4. Heroku (Paid plans only)"
echo "5. Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_info "Deploying to Render..."
        echo ""
        echo "📋 Render Deployment Steps:"
        echo "1. Go to https://render.com"
        echo "2. Sign up with GitHub"
        echo "3. Click 'New +' → 'Web Service'"
        echo "4. Connect your GitHub repository"
        echo "5. Set the following configuration:"
        echo "   - Name: ibm-knowledge-backend"
        echo "   - Environment: Node"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "   - Plan: Free"
        echo ""
        echo "6. Add these environment variables:"
        echo "   NODE_ENV=production"
        echo "   JWT_SECRET=your-secret-key-here"
        echo "   DATABASE_URL=your-postgresql-url"
        echo "   REDIS_URL=your-redis-url"
        echo "   PORT=10000"
        echo ""
        echo "7. Deploy the frontend as a Static Site:"
        echo "   - Name: ibm-knowledge-frontend"
        echo "   - Build Command: cd client && npm install && npm run build"
        echo "   - Publish Directory: client/build"
        echo "   - Environment Variable: REACT_APP_API_URL=https://your-backend-url.onrender.com"
        echo ""
        print_status "Render deployment guide created! Follow the steps above."
        ;;
    2)
        print_info "Deploying to Railway..."
        echo ""
        echo "📋 Railway Deployment Steps:"
        echo "1. Install Railway CLI:"
        echo "   npm install -g @railway/cli"
        echo ""
        echo "2. Deploy:"
        echo "   railway login"
        echo "   railway init"
        echo "   railway up"
        echo ""
        echo "3. Set environment variables:"
        echo "   railway variables set NODE_ENV=production"
        echo "   railway variables set JWT_SECRET=your-secret-key"
        echo "   railway variables set DATABASE_URL=your-postgresql-url"
        echo "   railway variables set REDIS_URL=your-redis-url"
        echo ""
        print_status "Railway deployment guide created! Follow the steps above."
        ;;
    3)
        print_info "Deploying to Vercel..."
        echo ""
        echo "📋 Vercel Deployment Steps:"
        echo "1. Install Vercel CLI:"
        echo "   npm install -g vercel"
        echo ""
        echo "2. Deploy:"
        echo "   vercel"
        echo ""
        echo "3. Set environment variables:"
        echo "   vercel env add NODE_ENV production"
        echo "   vercel env add JWT_SECRET your-secret-key"
        echo "   vercel env add DATABASE_URL your-postgresql-url"
        echo "   vercel env add REDIS_URL your-redis-url"
        echo ""
        print_status "Vercel deployment guide created! Follow the steps above."
        ;;
    4)
        print_warning "Heroku free tier is discontinued. You'll need a paid plan."
        echo ""
        echo "📋 Heroku Deployment Steps (Paid Plan Required):"
        echo "1. Install Heroku CLI:"
        echo "   npm install -g heroku"
        echo ""
        echo "2. Deploy:"
        echo "   heroku create your-app-name"
        echo "   git push heroku main"
        echo ""
        echo "3. Set environment variables:"
        echo "   heroku config:set NODE_ENV=production"
        echo "   heroku config:set JWT_SECRET=your-secret-key"
        echo "   heroku config:set DATABASE_URL=your-postgresql-url"
        echo "   heroku config:set REDIS_URL=your-redis-url"
        echo ""
        print_status "Heroku deployment guide created! Follow the steps above."
        ;;
    5)
        print_info "Exiting deployment script."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🗄️  Database Setup Required:"
echo "============================"
echo "You'll need to set up a free PostgreSQL database:"
echo ""
echo "Recommended options:"
echo "1. Neon (https://neon.tech) - 3GB free"
echo "2. Supabase (https://supabase.com) - 500MB free"
echo "3. Railway PostgreSQL - $5 credit/month"
echo ""
echo "Redis Setup Required:"
echo "===================="
echo "You'll need to set up a free Redis service:"
echo ""
echo "Recommended options:"
echo "1. Upstash (https://upstash.com) - 10,000 requests/day"
echo "2. Redis Cloud (https://redis.com) - 30MB free"
echo ""
echo "🔧 Environment Variables Template:"
echo "=================================="
echo "NODE_ENV=production"
echo "JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024"
echo "DATABASE_URL=postgresql://username:password@host:port/database"
echo "REDIS_URL=redis://username:password@host:port"
echo "PORT=10000"
echo ""
echo "REACT_APP_API_URL=https://your-backend-url.com"
echo ""
print_status "Deployment configuration complete!"
echo ""
echo "📚 For detailed instructions, see: README-DEPLOYMENT.md"
echo "🎉 Good luck with your deployment!" 