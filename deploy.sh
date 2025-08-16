#!/bin/bash

# IBM Knowledge Ecosystem - Deployment Script
# This script helps you deploy the application to various platforms

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_warning "Created .env file from template. Please edit it with your configuration."
    fi
    
    print_success "Environment setup completed!"
}

# Function to build application
build_application() {
    print_status "Building application..."
    
    npm run install-all
    
    if [ $? -eq 0 ]; then
        print_success "Application built successfully!"
    else
        print_error "Build failed!"
        exit 1
    fi
}

# Function to deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    
    if ! command_exists render; then
        print_warning "Render CLI not found. Please install it first:"
        echo "curl -fsSL https://render.com/download-cli/install.sh | bash"
        echo ""
        print_status "Or deploy manually using the guide in DEPLOYMENT-RENDER.md"
        return 1
    fi
    
    render deploy
    print_success "Deployment to Render completed!"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command_exists vercel; then
        print_warning "Vercel CLI not found. Please install it first:"
        echo "npm i -g vercel"
        echo ""
        print_status "Or deploy manually using the guide in DEPLOYMENT-VERCEL.md"
        return 1
    fi
    
    vercel --prod
    print_success "Deployment to Vercel completed!"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        return 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        return 1
    fi
    
    docker-compose up -d --build
    print_success "Docker deployment completed!"
    print_status "Access your application at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    if ! command_exists netlify; then
        print_warning "Netlify CLI not found. Please install it first:"
        echo "npm install -g netlify-cli"
        echo ""
        print_status "Or deploy manually using Netlify dashboard:"
        echo "1. Go to https://netlify.com"
        echo "2. Click 'New site from Git'"
        echo "3. Connect your GitHub repository"
        echo "4. Build command: cd client && npm install && npm run build"
        echo "5. Publish directory: client/build"
        return 1
    fi
    
    netlify login
    netlify deploy --prod
    print_success "Deployment to Netlify completed!"
    print_status "Your site will be available at: https://your-site-name.netlify.app"
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command_exists railway; then
        print_warning "Railway CLI not found. Please install it first:"
        echo "npm i -g @railway/cli"
        echo ""
        print_status "Or deploy manually using Railway dashboard"
        return 1
    fi
    
    railway login
    railway up
    print_success "Deployment to Railway completed!"
}

# Function to show deployment options
show_options() {
    echo ""
    echo "🚀 IBM Knowledge Ecosystem - Deployment Options"
    echo "================================================"
    echo ""
    echo "1. Netlify (Public URL like your friend's site)"
    echo "   - Public URL accessible anywhere"
    echo "   - Free hosting with custom domain"
    echo "   - Perfect for portfolio/demo"
    echo ""
    echo "2. Render (Recommended - Free tier available)"
    echo "   - Easy deployment"
    echo "   - Free PostgreSQL and Redis"
    echo "   - Automatic HTTPS"
    echo ""
    echo "3. Vercel (Free tier available)"
    echo "   - Great for React apps"
    echo "   - Serverless functions"
    echo "   - Global CDN"
    echo ""
    echo "4. Docker (Local or Cloud)"
    echo "   - Full control"
    echo "   - Deploy anywhere"
    echo "   - Production ready"
    echo ""
    echo "5. Railway (Free tier available)"
    echo "   - Simple deployment"
    echo "   - Built-in database"
    echo "   - Automatic scaling"
    echo ""
    echo "6. Manual Setup"
    echo "   - Build and test locally"
    echo "   - Choose your own platform"
    echo ""
}

# Function to get user choice
get_deployment_choice() {
    while true; do
        read -p "Enter your choice (1-6): " choice
        case $choice in
            1) deploy_netlify; break;;
            2) deploy_render; break;;
            3) deploy_vercel; break;;
            4) deploy_docker; break;;
            5) deploy_railway; break;;
            6) manual_setup; break;;
            *) echo "Invalid choice. Please enter 1-6.";;
        esac
    done
}

# Function for manual setup
manual_setup() {
    print_status "Manual setup mode..."
    echo ""
    echo "To deploy manually:"
    echo "1. Push your code to GitHub:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-ecosystem.git"
    echo "   git push -u origin main"
    echo ""
    echo "2. Choose a platform and follow the deployment guide:"
    echo "   - DEPLOYMENT-RENDER.md for Render"
    echo "   - DEPLOYMENT-VERCEL.md for Vercel"
    echo "   - DEPLOYMENT-DOCKER.md for Docker/Cloud platforms"
    echo ""
    echo "3. Set up your database and Redis"
    echo "4. Configure environment variables"
    echo "5. Deploy and test"
}

# Main function
main() {
    echo "🚀 IBM Knowledge Ecosystem - Deployment Script"
    echo "================================================"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_environment
    
    # Build application
    build_application
    
    # Show options and get user choice
    show_options
    get_deployment_choice
    
    echo ""
    print_success "Deployment process completed!"
    echo ""
    echo "📚 Next steps:"
    echo "1. Configure your environment variables"
    echo "2. Set up your database and Redis"
    echo "3. Test your deployment"
    echo "4. Monitor your application"
    echo ""
    echo "📖 Documentation:"
    echo "- DEPLOYMENT-RENDER.md"
    echo "- DEPLOYMENT-VERCEL.md"
    echo "- DEPLOYMENT-DOCKER.md"
    echo "- README.md"
}

# Run main function
main "$@" 