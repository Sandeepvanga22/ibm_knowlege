#!/bin/bash

echo "🚀 IBM Knowledge Ecosystem - Quick Start"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created"
fi

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."

# Check backend health
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not responding"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

# Check database
if docker-compose exec postgres pg_isready -U ibm_user -d ibm_knowledge > /dev/null 2>&1; then
    echo "✅ PostgreSQL database is ready"
else
    echo "❌ PostgreSQL database is not ready"
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis cache is ready"
else
    echo "❌ Redis cache is not ready"
fi

echo ""
echo "🎉 IBM Knowledge Ecosystem is ready!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "👤 Test Login Credentials:"
echo "   IBM ID: EMP001, Password: any"
echo "   IBM ID: EMP002, Password: any"
echo "   IBM ID: EMP003, Password: any"
echo ""
echo "🤖 Agent Features:"
echo "   - Smart Routing: Suggests experts for questions"
echo "   - Duplicate Detection: Identifies similar questions"
echo "   - Knowledge Gaps: Finds missing documentation"
echo "   - Expertise Discovery: Maps user skills"
echo ""
echo "📊 Monitor Performance:"
echo "   Agent Performance: http://localhost:3000/agents"
echo "   Analytics Dashboard: http://localhost:3000/analytics"
echo ""
echo "🔍 Troubleshooting:"
echo "   If services don't start, check logs: docker-compose logs"
echo "   If database issues: docker-compose restart postgres"
echo "   If Redis issues: docker-compose restart redis"
echo ""
echo "✨ Enjoy exploring the IBM Knowledge Ecosystem!" 