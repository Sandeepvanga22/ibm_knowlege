#!/bin/bash

echo "🚀 Deploying IBM Knowledge Ecosystem to Vercel..."

# Remove any existing Vercel config
rm -rf .vercel

# Build the client
echo "📦 Building React app..."
cd client
npm run build
cd ..

# Deploy to Vercel with valid project name
echo "🌐 Deploying to Vercel..."
vercel --prod --yes --name ibm-knowledge-app

echo "✅ Deployment complete!"
echo "🎯 Your IBM Knowledge Ecosystem is now live!"
