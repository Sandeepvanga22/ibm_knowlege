#!/bin/bash

echo "🚀 IBM Knowledge Ecosystem - Simple Deployment"
echo "=============================================="
echo ""

# Build the React app
echo "📦 Building React app..."
cd client && npm run build && cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🌐 To deploy to Netlify and get your public URL:"
echo ""
echo "1. Go to: https://app.netlify.com/start"
echo "2. Click 'Deploy manually'"
echo "3. Drag and drop the 'client/build' folder to the deployment area"
echo "4. Your site will be deployed and you'll get a public URL!"
echo ""
echo "📱 Your app is currently running locally at:"
echo "   http://localhost:3001"
echo ""
echo "🎯 Your public URL will be something like:"
echo "   https://your-site-name.netlify.app"
echo ""
echo "🔧 To connect frontend to backend:"
echo "   Add environment variable: REACT_APP_API_URL=https://your-backend-url.com"
