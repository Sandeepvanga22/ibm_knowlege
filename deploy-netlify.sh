#!/bin/bash

echo "🚀 Deploying IBM Knowledge Ecosystem to Netlify..."

# Build the React app
echo "📦 Building React app..."
cd client && npm run build && cd ..

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=client/build

echo "✅ Deployment completed!"
echo "🌍 Your app will be available at the URL shown above"
echo ""
echo "📱 You can also access it locally at: http://localhost:3001"
