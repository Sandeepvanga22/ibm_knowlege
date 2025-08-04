# IBM Knowledge Ecosystem - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (optional)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd ibm-knowledge-ecosystem
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start Services
```bash
# Option A: Using Docker (Recommended)
npm run docker:up

# Option B: Manual Setup
# Start PostgreSQL and Redis
npm run db:setup
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Individual Services
```bash
# Start only database services
docker-compose up -d postgres redis

# Start backend only
docker-compose up -d backend

# Start frontend only
docker-compose up -d frontend
```

## 🏗️ Production Deployment

### IBM Cloud Foundry
```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login to IBM Cloud
ibmcloud login

# Target your organization and space
ibmcloud target --cf

# Deploy application
ibmcloud cf push ibm-knowledge-ecosystem
```

### IBM Cloud Kubernetes Service
```bash
# Create Kubernetes cluster
ibmcloud ks cluster create classic --name ibm-knowledge-cluster

# Deploy using Helm
helm install ibm-knowledge ./helm-chart
```

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml ibm-knowledge
```

## 🔧 Configuration

### Environment Variables
```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-key
IBM_SSO_CLIENT_ID=your-ibm-sso-id

# Optional
NODE_ENV=production
PORT=5000
AGENT_CONFIDENCE_THRESHOLD=0.7
```

### Database Setup
```bash
# Initialize database schema
npm run db:setup

# Reset database (development only)
npm run db:reset
```

### SSL Configuration
```bash
# Generate SSL certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/private.key \
  -out nginx/ssl/certificate.crt

# Update nginx configuration
cp nginx/nginx.conf.example nginx/nginx.conf
```

## 📊 Monitoring & Logging

### Health Checks
```bash
# Application health
curl http://localhost:5000/api/health

# Agent health
curl http://localhost:5000/api/agents/health

# Database health
curl http://localhost:5000/api/health/db
```

### Logs
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# Docker logs
docker-compose logs -f backend
```

### Metrics
```bash
# Agent performance
curl http://localhost:5000/api/agents/performance

# User analytics
curl http://localhost:5000/api/analytics/dashboard
```

## 🔒 Security

### SSL/TLS Configuration
```nginx
# nginx/nginx.conf
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    
    location / {
        proxy_pass http://frontend:3000;
    }
    
    location /api {
        proxy_pass http://backend:5000;
    }
}
```

### IBM SSO Integration
```javascript
// Configure IBM SSO in production
const IBM_SSO_CONFIG = {
  clientId: process.env.IBM_SSO_CLIENT_ID,
  clientSecret: process.env.IBM_SSO_CLIENT_SECRET,
  redirectUri: 'https://your-domain.com/auth/callback',
  scope: 'openid profile email',
};
```

### Rate Limiting
```javascript
// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
```

## 🚀 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.prod.yml up -d
```

### Database Scaling
```bash
# Configure PostgreSQL replication
# Master-Slave setup for read scaling
# Connection pooling with PgBouncer
```

### Redis Clustering
```bash
# Redis Cluster for high availability
docker-compose -f docker-compose.cluster.yml up -d
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to IBM Cloud
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to IBM Cloud
        run: |
          ibmcloud cf push ibm-knowledge-ecosystem
```

### GitLab CI
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

deploy:
  stage: deploy
  script:
    - ibmcloud cf push ibm-knowledge-ecosystem
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL connection
psql -h localhost -U ibm_user -d ibm_knowledge

# Reset database
npm run db:reset
```

#### Redis Connection
```bash
# Check Redis connection
redis-cli ping

# Clear Redis cache
redis-cli FLUSHALL
```

#### Agent Issues
```bash
# Check agent health
curl http://localhost:5000/api/agents/health

# Reset agent performance
curl -X POST http://localhost:5000/api/agents/reset
```

#### Frontend Issues
```bash
# Clear React cache
cd client && npm run build

# Check API connectivity
curl http://localhost:5000/api/health
```

### Log Analysis
```bash
# Search for errors
grep -i error logs/combined.log

# Monitor agent performance
grep "agent.*performance" logs/combined.log

# Check user activity
grep "user.*action" logs/combined.log
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_questions_created_at ON questions(created_at);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
```

### Caching Strategy
```javascript
// Redis caching configuration
const cacheConfig = {
  questionCache: 3600, // 1 hour
  userCache: 86400,    // 24 hours
  agentCache: 1800,    // 30 minutes
};
```

### Agent Optimization
```javascript
// Agent confidence thresholds
const AGENT_CONFIG = {
  routingConfidence: 0.7,
  duplicateConfidence: 0.6,
  knowledgeGapConfidence: 0.6,
  expertiseConfidence: 0.6,
};
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
pg_dump ibm_knowledge > backup_$(date +%Y%m%d).sql

# Restore backup
psql ibm_knowledge < backup_20231201.sql
```

### Application Backup
```bash
# Backup configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env logs/

# Backup user data
pg_dump -t users -t questions -t answers ibm_knowledge > user_data_backup.sql
```

## 📞 Support

### Getting Help
- Documentation: [Internal Wiki Link]
- Email: knowledge-team@ibm.com
- Slack: #ibm-knowledge-ecosystem
- GitHub Issues: [Repository Issues]

### Emergency Contacts
- DevOps Team: devops@ibm.com
- Security Team: security@ibm.com
- Database Team: db-team@ibm.com

---

**Last Updated:** December 2024
**Version:** 1.0.0 