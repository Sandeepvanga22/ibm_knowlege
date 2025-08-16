#!/bin/bash

# IBM Knowledge Ecosystem - Heroku Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "🚀 IBM Knowledge Ecosystem - Heroku Deployment"
echo "=============================================="
echo ""

# Check if Heroku CLI is installed
if ! command_exists heroku; then
    print_error "Heroku CLI is not installed."
    echo ""
    echo "Please install Heroku CLI first:"
    echo "brew tap heroku/brew && brew install heroku"
    echo ""
    echo "Or download from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

print_success "Heroku CLI is installed!"

# Check if user is logged in
print_status "Checking Heroku login status..."
if ! heroku auth:whoami &>/dev/null; then
    print_warning "You are not logged in to Heroku."
    echo "Please login first:"
    heroku login
else
    print_success "Already logged in to Heroku!"
fi

# Get app name
APP_NAME="ibm-knowledge-ecosystem"
print_status "Using app name: $APP_NAME"

# Check if app exists
if heroku apps:info --app $APP_NAME &>/dev/null; then
    print_warning "App $APP_NAME already exists. Using existing app."
else
    print_status "Creating new Heroku app: $APP_NAME"
    heroku create $APP_NAME
fi

# Set buildpack
print_status "Setting Node.js buildpack..."
heroku buildpacks:set heroku/nodejs --app $APP_NAME

# Add PostgreSQL addon
print_status "Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini --app $APP_NAME

# Add Redis addon
print_status "Adding Redis cache..."
heroku addons:create heroku-redis:mini --app $APP_NAME

# Set environment variables
print_status "Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024 --app $APP_NAME
heroku config:set AGENT_CONFIDENCE_THRESHOLD=0.7 --app $APP_NAME
heroku config:set ENABLE_MOCK_DATA=true --app $APP_NAME
heroku config:set CORS_ORIGIN=https://$APP_NAME.herokuapp.com --app $APP_NAME

# Commit changes
print_status "Committing changes..."
git add .
git commit -m "Deploy to Heroku" || true

# Deploy to Heroku
print_status "Deploying to Heroku..."
git push heroku main

# Run database setup
print_status "Setting up database..."
heroku run npm run db:setup --app $APP_NAME

# Open the app
print_status "Opening your app..."
heroku open --app $APP_NAME

print_success "Deployment completed!"
echo ""
echo "🌍 Your IBM Knowledge Ecosystem is now live at:"
echo "   https://$APP_NAME.herokuapp.com"
echo ""
echo "📊 Dashboard: https://dashboard.heroku.com/apps/$APP_NAME"
echo ""
echo "🔧 Useful commands:"
echo "   heroku logs --tail --app $APP_NAME"
echo "   heroku restart --app $APP_NAME"
echo "   heroku run bash --app $APP_NAME"
echo ""
echo "💰 Cost: ~$22/month (Basic dyno + PostgreSQL + Redis)"
echo ""
print_warning "Note: Heroku no longer has a free tier. Consider free alternatives like Render or Railway."
