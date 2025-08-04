# 🚀 IBM Knowledge Ecosystem - Free Hosting Deployment Guide

## 📋 Prerequisites
- GitHub account
- Free database service (PostgreSQL)
- Free Redis service
- Free hosting platform account

## 🎯 Free Hosting Options

### 1. **Render (Recommended)**
**Free Tier:** 750 hours/month, 512MB RAM, Shared CPU

#### Setup Steps:
1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/your-username/ibm-knowledge-ecosystem.git
   cd ibm-knowledge-ecosystem
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Name:** `ibm-knowledge-backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables (Backend)**
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   DATABASE_URL=your-postgresql-url
   REDIS_URL=your-redis-url
   PORT=10000
   ```

5. **Deploy Frontend**
   - Click "New +" → "Static Site"
   - **Name:** `ibm-knowledge-frontend`
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish Directory:** `client/build`
   - **Environment Variable:** `REACT_APP_API_URL=https://your-backend-url.onrender.com`

---

### 2. **Railway**
**Free Tier:** $5 credit/month, 512MB RAM

#### Setup Steps:
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-secret-key
   railway variables set DATABASE_URL=your-postgresql-url
   railway variables set REDIS_URL=your-redis-url
   ```

---

### 3. **Vercel**
**Free Tier:** 100GB bandwidth, 100 serverless function executions

#### Setup Steps:
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add NODE_ENV production
   vercel env add JWT_SECRET your-secret-key
   vercel env add DATABASE_URL your-postgresql-url
   vercel env add REDIS_URL your-redis-url
   ```

---

### 4. **Heroku**
**Free Tier:** Discontinued, but still works with paid plans

#### Setup Steps:
1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Deploy**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set DATABASE_URL=your-postgresql-url
   heroku config:set REDIS_URL=your-redis-url
   ```

---

## 🗄️ Free Database Services

### PostgreSQL Options:
1. **Neon** (Recommended)
   - Free: 3GB storage, 10GB transfer
   - URL: https://neon.tech

2. **Supabase**
   - Free: 500MB database, 2GB bandwidth
   - URL: https://supabase.com

3. **Railway PostgreSQL**
   - Free: $5 credit/month
   - URL: https://railway.app

### Redis Options:
1. **Upstash**
   - Free: 10,000 requests/day
   - URL: https://upstash.com

2. **Redis Cloud**
   - Free: 30MB storage
   - URL: https://redis.com

---

## 🔧 Environment Variables Setup

### Required Variables:
```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-2024
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
PORT=10000
```

### Frontend Variables:
```bash
REACT_APP_API_URL=https://your-backend-url.com
```

---

## 🚀 Quick Deployment Commands

### Render (Recommended):
```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# 2. Connect to Render dashboard
# 3. Import repository
# 4. Set environment variables
# 5. Deploy
```

### Railway:
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Deploy
railway login
railway init
railway up

# 3. Set variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret
railway variables set DATABASE_URL=your-db-url
railway variables set REDIS_URL=your-redis-url
```

### Vercel:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Set environment variables
vercel env add NODE_ENV production
vercel env add JWT_SECRET your-secret
vercel env add DATABASE_URL your-db-url
vercel env add REDIS_URL your-redis-url
```

---

## 🔍 Post-Deployment Verification

### 1. **Health Check**
```bash
curl https://your-backend-url.com/api/health
```

### 2. **Database Connection**
```bash
curl https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"ibmId": "EMP001", "password": "any"}'
```

### 3. **Frontend Access**
- Open: `https://your-frontend-url.com`
- Login with: IBM ID: `EMP001`, Password: `any`

---

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify SSL settings for production
   - Test connection locally

2. **Redis Connection Failed**
   - Check REDIS_URL format
   - Verify Redis service is running
   - Test connection locally

3. **Build Failed**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for errors

4. **Environment Variables Not Set**
   - Verify all required variables are set
   - Check variable names (case-sensitive)
   - Restart deployment after setting variables

---

## 📊 Monitoring

### Free Monitoring Tools:
1. **UptimeRobot** - Website monitoring
2. **LogRocket** - Error tracking
3. **Sentry** - Error monitoring
4. **Google Analytics** - User analytics

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Database connection uses SSL
- [ ] Redis connection is secure
- [ ] Environment variables are not exposed
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented

---

## 🎉 Success!

After deployment, your IBM Knowledge Ecosystem will be available at:
- **Frontend:** https://your-frontend-url.com
- **Backend API:** https://your-backend-url.com
- **Health Check:** https://your-backend-url.com/api/health

**Login Credentials:**
- IBM ID: `EMP001`
- Password: `any`

**Features Available:**
- ✅ User authentication
- ✅ Question posting
- ✅ AI agent orchestration
- ✅ Analytics dashboard
- ✅ Agent performance monitoring 