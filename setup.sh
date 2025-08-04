#!/bin/bash

echo "🚀 Setting up IBM Knowledge Ecosystem..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p client/public
mkdir -p server/logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Check if PostgreSQL is running
echo "🗄️  Checking PostgreSQL connection..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Please install PostgreSQL."
    echo "   You can use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ibm_knowledge -p 5432:5432 -d postgres:14"
else
    echo "✅ PostgreSQL client found"
fi

# Check if Redis is running
echo "🔴 Checking Redis connection..."
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis client not found. Please install Redis."
    echo "   You can use Docker: docker run --name redis -p 6379:6379 -d redis:6"
else
    echo "✅ Redis client found"
fi

# Create database setup script
echo "📝 Creating database setup script..."
cat > setup-db.js << 'EOF'
const { initializeDatabase } = require('./server/utils/database');

async function setupDatabase() {
    try {
        console.log('🗄️  Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

setupDatabase();
EOF

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start PostgreSQL and Redis"
echo "3. Run: npm run db:setup"
echo "4. Run: npm run dev"
echo ""
echo "🔗 Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run server       - Start backend only"
echo "  npm run client       - Start frontend only"
echo "  npm run db:setup     - Initialize database"
echo "  npm run build        - Build for production"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "🔧 API documentation at: http://localhost:5000/api/health" 