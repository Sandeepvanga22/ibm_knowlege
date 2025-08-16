# 🐳 Deploy with Docker - Step by Step Guide

## Prerequisites
- Docker and Docker Compose installed
- Cloud platform account (AWS, Google Cloud, Azure, DigitalOcean, etc.)

## Option 1: Local Docker Deployment

### Step 1: Build and Run with Docker Compose

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ibm-knowledge-ecosystem.git
cd ibm-knowledge-ecosystem

# Create environment file
cp env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Step 2: Access Your Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## Option 2: Deploy to Cloud Platforms

### AWS Deployment

#### Using AWS ECS (Elastic Container Service):

1. **Install AWS CLI and configure:**
```bash
aws configure
```

2. **Create ECR repositories:**
```bash
aws ecr create-repository --repository-name ibm-knowledge-backend
aws ecr create-repository --repository-name ibm-knowledge-frontend
```

3. **Build and push images:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build images
docker build -f Dockerfile.backend -t ibm-knowledge-backend .
docker build -f Dockerfile.frontend -t ibm-knowledge-frontend .

# Tag images
docker tag ibm-knowledge-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ibm-knowledge-backend:latest
docker tag ibm-knowledge-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ibm-knowledge-frontend:latest

# Push images
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ibm-knowledge-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ibm-knowledge-frontend:latest
```

4. **Create ECS cluster and services using AWS Console or CLI**

#### Using AWS App Runner:

1. **Go to AWS App Runner console**
2. **Create service from source code**
3. **Connect your GitHub repository**
4. **Configure build settings**
5. **Add environment variables**

### Google Cloud Platform Deployment

#### Using Google Cloud Run:

1. **Install Google Cloud CLI:**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

2. **Enable required APIs:**
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

3. **Deploy backend:**
```bash
gcloud run deploy ibm-knowledge-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

4. **Deploy frontend:**
```bash
cd client
gcloud run deploy ibm-knowledge-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### DigitalOcean Deployment

#### Using DigitalOcean App Platform:

1. **Go to DigitalOcean App Platform**
2. **Create new app from source code**
3. **Connect your GitHub repository**
4. **Configure services:**

   **Backend Service:**
   - Source: `/`
   - Build Command: `npm install`
   - Run Command: `npm start`
   - Environment: Node.js

   **Frontend Service:**
   - Source: `/client`
   - Build Command: `npm install && npm run build`
   - Output Directory: `build`
   - Environment: Static Site

5. **Add environment variables**
6. **Deploy**

## Option 3: Kubernetes Deployment

### Create Kubernetes Manifests:

1. **Create namespace:**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ibm-knowledge
```

2. **Create ConfigMap:**
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ibm-knowledge-config
  namespace: ibm-knowledge
data:
  NODE_ENV: "production"
  AGENT_CONFIDENCE_THRESHOLD: "0.7"
  ENABLE_MOCK_DATA: "true"
```

3. **Create Secret:**
```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ibm-knowledge-secret
  namespace: ibm-knowledge
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  DATABASE_URL: <base64-encoded-db-url>
  REDIS_URL: <base64-encoded-redis-url>
```

4. **Create Deployment:**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ibm-knowledge-backend
  namespace: ibm-knowledge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ibm-knowledge-backend
  template:
    metadata:
      labels:
        app: ibm-knowledge-backend
    spec:
      containers:
      - name: backend
        image: ibm-knowledge-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: ibm-knowledge-config
        - secretRef:
            name: ibm-knowledge-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

5. **Create Service:**
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ibm-knowledge-backend-service
  namespace: ibm-knowledge
spec:
  selector:
    app: ibm-knowledge-backend
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

6. **Deploy to Kubernetes:**
```bash
kubectl apply -f k8s/
```

## Option 4: Docker Swarm Deployment

### Initialize Swarm:
```bash
docker swarm init
```

### Deploy Stack:
```bash
docker stack deploy -c docker-compose.prod.yml ibm-knowledge
```

### Scale Services:
```bash
docker service scale ibm-knowledge_backend=3
docker service scale ibm-knowledge_frontend=2
```

## Environment Variables for Production

```env
# Required
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://user:pass@host:6379

# Optional
IBM_SSO_CLIENT_ID=your-ibm-sso-client-id
IBM_SSO_CLIENT_SECRET=your-ibm-sso-client-secret
AGENT_CONFIDENCE_THRESHOLD=0.7
AGENT_LEARNING_RATE=0.1
ENABLE_MOCK_DATA=true
ENABLE_AGENT_DEBUG=false

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Monitoring and Logging

### Health Checks:
```bash
# Application health
curl http://your-domain.com/api/health

# Agent health
curl http://your-domain.com/api/agents/health

# Database health
curl http://your-domain.com/api/health/db
```

### Logs:
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes logs
kubectl logs -f deployment/ibm-knowledge-backend -n ibm-knowledge
```

## Cost Estimation

### AWS ECS:
- **EC2 instances:** $10-50/month
- **RDS PostgreSQL:** $15-30/month
- **ElastiCache Redis:** $15-30/month
- **Total:** $40-110/month

### Google Cloud Run:
- **Backend:** $5-20/month
- **Frontend:** $1-5/month
- **Cloud SQL:** $15-30/month
- **Total:** $21-55/month

### DigitalOcean:
- **App Platform:** $12-24/month
- **Managed Database:** $15/month
- **Total:** $27-39/month

## Security Considerations

1. **Use secrets management** for sensitive data
2. **Enable HTTPS** with SSL certificates
3. **Configure CORS** properly
4. **Set up rate limiting**
5. **Use environment-specific configurations**
6. **Regular security updates**
