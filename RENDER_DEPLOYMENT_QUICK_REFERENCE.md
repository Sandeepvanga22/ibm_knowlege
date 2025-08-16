# 🚀 Render Deployment Quick Reference

## Services to Create:

### 1. PostgreSQL Database
- Name: ibm-knowledge-db
- Plan: Free
- Copy Internal Database URL

### 2. Web Service
- Name: ibm-knowledge-backend
- Repository: Sandeepvanga22/ibm_knowlege
- Environment: Node
- Build: npm install
- Start: npm start

## Environment Variables:
```
NODE_ENV=production
JWT_SECRET=ibm-knowledge-ecosystem-super-secret-jwt-key-2024
AGENT_CONFIDENCE_THRESHOLD=0.7
ENABLE_MOCK_DATA=true
CORS_ORIGIN=https://ibm-knowledge-ecosystem-9821fgfbw-sandeeps-projects-08af41b7.vercel.app
DATABASE_URL=postgresql://[your-database-url]
```

## Final URLs:
- Frontend: https://ibm-knowledge-ecosystem-9821fgfbw-sandeeps-projects-08af41b7.vercel.app
- Backend: https://ibm-knowledge-backend.onrender.com

## Demo Access:
- IBM ID: EMP001, EMP002, EMP003
- Password: Any password
