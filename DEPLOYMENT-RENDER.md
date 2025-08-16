# 🚀 Deploy to Render - Step by Step Guide

## Prerequisites
- GitHub account
- Render account (free at render.com)

## Step 1: Push to GitHub
```bash
# Create a new repository on GitHub
# Then push your code:
git remote add origin https://github.com/YOUR_USERNAME/ibm-knowledge-ecosystem.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the backend service:**

   **Name:** `ibm-knowledge-backend`
   
   **Environment:** `Node`
   
   **Build Command:** `npm install`
   
   **Start Command:** `npm start`
   
   **Plan:** `Free`

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   DATABASE_URL=postgresql://your-db-url
   REDIS_URL=redis://your-redis-url
   IBM_SSO_CLIENT_ID=your-ibm-sso-client-id
   IBM_SSO_CLIENT_SECRET=your-ibm-sso-client-secret
   AGENT_CONFIDENCE_THRESHOLD=0.7
   ENABLE_MOCK_DATA=true
   ```

6. **Click "Create Web Service"**

## Step 3: Set Up Database

1. **Click "New +" → "PostgreSQL"**
2. **Name:** `ibm-knowledge-db`
3. **Plan:** `Free`
4. **Click "Create Database"**
5. **Copy the Internal Database URL**
6. **Go back to your backend service and update DATABASE_URL**

## Step 4: Set Up Redis (Optional)

1. **Click "New +" → "Redis"**
2. **Name:** `ibm-knowledge-redis`
3. **Plan:** `Free`
4. **Click "Create Redis"**
5. **Copy the Internal Redis URL**
6. **Update REDIS_URL in backend service**

## Step 5: Deploy Frontend

1. **Click "New +" → "Static Site"**
2. **Connect your GitHub repository**
3. **Configure:**
   
   **Name:** `ibm-knowledge-frontend`
   
   **Build Command:** `cd client && npm install && npm run build`
   
   **Publish Directory:** `client/build`
   
   **Plan:** `Free`

4. **Add Environment Variable:**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

5. **Click "Create Static Site"**

## Step 6: Update Frontend API URL

1. **Go to your frontend service**
2. **Add environment variable:**
   ```
   REACT_APP_API_URL=https://ibm-knowledge-backend.onrender.com
   ```
3. **Redeploy the frontend**

## Step 7: Test Your Deployment

- **Frontend:** `https://ibm-knowledge-frontend.onrender.com`
- **Backend API:** `https://ibm-knowledge-backend.onrender.com`
- **Health Check:** `https://ibm-knowledge-backend.onrender.com/api/health`

## Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

2. **Database Connection:**
   - Verify DATABASE_URL is correct
   - Check if database is accessible

3. **Frontend Can't Connect to Backend:**
   - Verify REACT_APP_API_URL is correct
   - Check CORS settings in backend

### Environment Variables Reference:

```env
# Required for Backend
NODE_ENV=production
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# Optional
IBM_SSO_CLIENT_ID=your-ibm-sso-id
IBM_SSO_CLIENT_SECRET=your-ibm-sso-secret
AGENT_CONFIDENCE_THRESHOLD=0.7
ENABLE_MOCK_DATA=true

# Required for Frontend
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## Cost Estimation (Free Tier)

- **Backend:** Free (750 hours/month)
- **Frontend:** Free (unlimited)
- **PostgreSQL:** Free (90 days, then $7/month)
- **Redis:** Free (30 days, then $7/month)

**Total:** $0 for first 30-90 days, then ~$14/month
