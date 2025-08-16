# 🚀 Deploy to Heroku - Step by Step Guide

## 🎯 Goal: Deploy Your IBM Knowledge Ecosystem to Heroku

Heroku is a great platform for deploying full-stack applications. Your app will be available at `https://your-app-name.herokuapp.com`

## ⚡ Quick Deploy to Heroku

### Prerequisites
- Heroku account (free at heroku.com)
- Heroku CLI installed

### Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Heroku App
```bash
heroku create ibm-knowledge-ecosystem
```

### Step 4: Set Up Database
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Add Redis addon
heroku addons:create heroku-redis:mini
```

### Step 5: Configure Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
heroku config:set IBM_SSO_CLIENT_ID=your-ibm-sso-client-id
heroku config:set IBM_SSO_CLIENT_SECRET=your-ibm-sso-client-secret
heroku config:set AGENT_CONFIDENCE_THRESHOLD=0.7
heroku config:set ENABLE_MOCK_DATA=true
heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com
```

### Step 6: Deploy Your App
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Step 7: Run Database Migrations
```bash
heroku run npm run db:setup
```

### Step 8: Open Your App
```bash
heroku open
```

## 🔧 Heroku Configuration Files

### Create `Procfile`
Create a `Procfile` in your project root:
```
web: npm start
```

### Update `package.json`
Make sure your `package.json` has the correct scripts:
```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "cd client && npm install && npm run build",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### Create `app.json`
Create an `app.json` file for Heroku:
```json
{
  "name": "IBM Knowledge Ecosystem",
  "description": "IBM Agent-Powered Knowledge Ecosystem - Smart Q&A Platform",
  "repository": "https://github.com/YOUR_USERNAME/ibm-knowledge-ecosystem",
  "logo": "https://node-js-sample.herokuapp.com/node.png",
  "keywords": ["ibm", "knowledge", "agents", "qa", "enterprise"],
  "addons": [
    "heroku-postgresql:mini",
    "heroku-redis:mini"
  ],
  "env": {
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    },
    "JWT_SECRET": {
      "description": "JWT Secret Key",
      "generator": "secret"
    }
  },
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ]
}
```

## 🚀 Automated Deployment Script

### Run the Heroku Deployment Script
```bash
./deploy-heroku.sh
```

## 🔧 Manual Deployment Steps

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create Heroku App
```bash
heroku create ibm-knowledge-ecosystem
```

### 3. Add Buildpacks
```bash
heroku buildpacks:set heroku/nodejs
```

### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024
heroku config:set AGENT_CONFIDENCE_THRESHOLD=0.7
heroku config:set ENABLE_MOCK_DATA=true
```

### 5. Add Database
```bash
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
```

### 6. Deploy
```bash
git push heroku main
```

### 7. Run Migrations
```bash
heroku run npm run db:setup
```

### 8. Open App
```bash
heroku open
```

## 🌍 Your Heroku URL

After deployment, your app will be available at:
**`https://ibm-knowledge-ecosystem.herokuapp.com`**

## 🔍 Testing Your Deployment

### Health Check
```bash
curl https://ibm-knowledge-ecosystem.herokuapp.com/api/health
```

### Demo Login
- **URL:** `https://ibm-knowledge-ecosystem.herokuapp.com`
- **IBM ID:** `EMP001`, `EMP002`, `EMP003`
- **Password:** Any password (demo mode)

## 📊 Heroku Dashboard

Access your app dashboard at:
- **Dashboard:** https://dashboard.heroku.com/apps/ibm-knowledge-ecosystem
- **Logs:** `heroku logs --tail`
- **Console:** `heroku run bash`

## 💰 Cost Information

### Free Tier (Discontinued)
- Heroku no longer offers a free tier
- **Paid Plans:**
  - **Basic:** $7/month per dyno
  - **Standard:** $25/month per dyno
  - **Performance:** $250/month per dyno

### Addon Costs
- **PostgreSQL Mini:** $5/month
- **Redis Mini:** $10/month
- **Total:** ~$22/month minimum

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails:**
   ```bash
   heroku logs --tail
   ```

2. **Database Connection:**
   ```bash
   heroku config:get DATABASE_URL
   heroku run npm run db:setup
   ```

3. **App Crashes:**
   ```bash
   heroku logs --tail
   heroku restart
   ```

4. **Environment Variables:**
   ```bash
   heroku config
   heroku config:set VARIABLE_NAME=value
   ```

### Useful Commands
```bash
# View logs
heroku logs --tail

# Restart app
heroku restart

# Scale dynos
heroku ps:scale web=1

# Run commands
heroku run npm run db:setup

# Open app
heroku open

# Check status
heroku ps
```

## 🎯 Alternative: Free Platforms

Since Heroku no longer has a free tier, consider these free alternatives:

1. **Render** - Free tier available
2. **Railway** - $5 credit/month
3. **Vercel** - Free tier available
4. **Netlify** - Free tier available

## 🚀 Quick Start Commands

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create ibm-knowledge-ecosystem

# Add database
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Deploy
git push heroku main

# Open app
heroku open
```

---

**Your IBM Knowledge Ecosystem will be live on Heroku! 🚀**
