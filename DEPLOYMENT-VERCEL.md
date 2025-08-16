# 🚀 Deploy to Vercel - Step by Step Guide

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

## Step 1: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-ecosystem.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**

   **Framework Preset:** `Node.js`
   
   **Root Directory:** `./` (leave empty)
   
   **Build Command:** `npm run build`
   
   **Output Directory:** `client/build`
   
   **Install Command:** `npm install && cd client && npm install`

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   DATABASE_URL=your-database-url
   REDIS_URL=your-redis-url
   IBM_SSO_CLIENT_ID=your-ibm-sso-client-id
   IBM_SSO_CLIENT_SECRET=your-ibm-sso-client-secret
   AGENT_CONFIDENCE_THRESHOLD=0.7
   ENABLE_MOCK_DATA=true
   ```

6. **Click "Deploy"**

## Step 3: Configure Database

You'll need to set up a PostgreSQL database. Options:
- **Vercel Postgres** (recommended)
- **Supabase** (free tier available)
- **Neon** (free tier available)

### Using Vercel Postgres:
1. **In Vercel dashboard, go to "Storage"**
2. **Click "Create Database"**
3. **Select "Postgres"**
4. **Copy the connection string**
5. **Add to environment variables as DATABASE_URL**

## Step 4: Configure Redis

Options for Redis:
- **Upstash Redis** (free tier available)
- **Redis Cloud** (free tier available)

### Using Upstash Redis:
1. **Go to [upstash.com](https://upstash.com)**
2. **Create free Redis database**
3. **Copy the connection string**
4. **Add to environment variables as REDIS_URL**

## Step 5: Update vercel.json (if needed)

The project already includes a `vercel.json` file, but you might need to adjust it:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Step 6: Test Your Deployment

- **Your app will be available at:** `https://your-project-name.vercel.app`
- **API endpoints:** `https://your-project-name.vercel.app/api/*`
- **Health check:** `https://your-project-name.vercel.app/api/health`

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json

2. **API Routes Not Working:**
   - Verify vercel.json configuration
   - Check if server/index.js is properly configured

3. **Database Connection:**
   - Verify DATABASE_URL is correct
   - Check if database is accessible from Vercel

### Environment Variables Reference:

```env
# Required
NODE_ENV=production
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://user:pass@host:6379

# Optional
IBM_SSO_CLIENT_ID=your-ibm-sso-id
IBM_SSO_CLIENT_SECRET=your-ibm-sso-secret
AGENT_CONFIDENCE_THRESHOLD=0.7
ENABLE_MOCK_DATA=true
```

## Cost Estimation (Free Tier)

- **Vercel:** Free (unlimited deployments)
- **Vercel Postgres:** Free (256MB, 1 database)
- **Upstash Redis:** Free (10,000 requests/day)

**Total:** $0/month (free tier)
