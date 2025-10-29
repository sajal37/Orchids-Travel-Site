# Deployment Guide

## Quick Start

### Local Development

```bash
# 1. Clone repository
git clone <repository-url>
cd travelhub

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev

# Open http://localhost:3000
```

## Docker Deployment

### Single Container

```bash
# Build image
docker build -t travelhub:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  travelhub:latest
```

### Docker Compose (Recommended for Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down

# Services include:
# - Web (Next.js) on :3000
# - PostgreSQL on :5432
# - Redis on :6379
# - Prometheus on :9090
# - Grafana on :3001
```

## Cloud Deployments

### AWS (ECS + Fargate)

```bash
# 1. Set up infrastructure with Terraform
cd terraform
terraform init
terraform plan
terraform apply

# 2. Build and push Docker image
docker build -t $DOCKER_USERNAME/travelhub:latest .
docker push $DOCKER_USERNAME/travelhub:latest

# 3. Update ECS service
aws ecs update-service \
  --cluster travelhub-cluster \
  --service travelhub-web \
  --force-new-deployment
```

**Resources Created:**
- VPC with public/private subnets
- ECS Cluster (Fargate)
- Application Load Balancer
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- CloudWatch Logs
- Auto-scaling policies

### Kubernetes

```bash
# 1. Apply Kubernetes manifests
kubectl apply -f k8s/

# 2. Check deployment status
kubectl get pods -l app=travelhub
kubectl get svc travelhub-web
kubectl get ingress travelhub-ingress

# 3. View logs
kubectl logs -f deployment/travelhub-web

# 4. Scale deployment
kubectl scale deployment travelhub-web --replicas=5

# Resources include:
# - Deployment (3 replicas)
# - Service (ClusterIP)
# - Ingress (HTTPS)
# - HorizontalPodAutoscaler (3-10 pods)
```

### Vercel (Easiest Option)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
# - DATABASE_URL
# - REDIS_URL
# - NEXTAUTH_SECRET
# - etc.

# 4. Deploy to production
vercel --prod
```

## Environment Variables

### Required Variables

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://travelhub.com
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
```

### Optional Variables

```bash
# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://travelhub.com

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Monitoring
DATADOG_API_KEY=...
SENTRY_DSN=https://...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
```

## Database Setup

### PostgreSQL Migration

```sql
-- Create database
CREATE DATABASE travelhub;

-- Create tables (example)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  item_id VARCHAR(50),
  category VARCHAR(50),
  status VARCHAR(50),
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Redis Configuration

```bash
# For caching
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Enable persistence
redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

## CI/CD Setup

### GitHub Actions

The project includes a complete CI/CD pipeline that:

1. **Runs on every push/PR:**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests
   - Integration tests
   - Security scanning

2. **On main branch:**
   - Builds Docker image
   - Pushes to Docker Hub
   - Deploys to production
   - Runs health checks
   - Sends notifications

### Required Secrets

Add these secrets in GitHub Settings:

```
DOCKER_USERNAME
DOCKER_PASSWORD
SNYK_TOKEN
SLACK_WEBHOOK
```

## Monitoring Setup

### Prometheus

```bash
# Access Prometheus
http://your-domain:9090

# Example queries
rate(http_requests_total[5m])
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Grafana

```bash
# Access Grafana
http://your-domain:3001
Username: admin
Password: admin (change immediately)

# Import dashboards
1. Go to Dashboards > Import
2. Upload JSON from grafana/dashboards/
```

### Sentry

```bash
# Add to .env
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Errors are automatically tracked
```

## SSL/TLS Setup

### Let's Encrypt (Kubernetes)

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/cert-issuer.yaml

# Certificate is automatically provisioned
```

### Cloudflare (Alternative)

1. Point domain to Cloudflare nameservers
2. Enable "Full (strict)" SSL mode
3. Add A record pointing to your server
4. Enable "Always Use HTTPS"

## Performance Optimization

### CDN Setup

```bash
# CloudFront (AWS)
1. Create CloudFront distribution
2. Set origin to ALB/domain
3. Configure cache behaviors
4. Update NEXT_PUBLIC_APP_URL

# Cloudflare (Easier)
1. Add site to Cloudflare
2. Update nameservers
3. Enable CDN (automatic)
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_flights_route ON flights(from_city, to_city);
CREATE INDEX idx_hotels_location ON hotels(city, country);
CREATE INDEX idx_bookings_date ON bookings(created_at);

-- Analyze tables
ANALYZE users;
ANALYZE bookings;
ANALYZE flights;
```

## Health Checks

### Application Health

```bash
# Check if app is running
curl http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Database Health

```bash
# PostgreSQL
pg_isready -h localhost -p 5432

# Redis
redis-cli ping
```

## Backup & Recovery

### Database Backups

```bash
# Automated daily backup
0 2 * * * pg_dump travelhub > /backups/travelhub-$(date +%Y%m%d).sql

# Restore from backup
psql travelhub < /backups/travelhub-20240115.sql
```

### Redis Snapshots

```bash
# Manual snapshot
redis-cli BGSAVE

# Automated snapshots (configured in redis.conf)
save 900 1
save 300 10
save 60 10000
```

## Rollback Procedure

### Quick Rollback (Kubernetes)

```bash
# Rollback to previous version
kubectl rollout undo deployment/travelhub-web

# Check status
kubectl rollout status deployment/travelhub-web
```

### Rollback (Docker)

```bash
# Deploy previous image version
docker pull travelhub:previous-version
docker stop travelhub-web
docker run ... travelhub:previous-version
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker logs travelhub-web
kubectl logs -f deployment/travelhub-web

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check if PostgreSQL is running
docker ps | grep postgres
kubectl get pods | grep postgres
```

### High Memory Usage

```bash
# Check container stats
docker stats travelhub-web

# Increase memory limit
docker run -m 2g ...
# or in k8s/deployment.yaml:
resources:
  limits:
    memory: "2Gi"
```

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up WAF rules
- [ ] Configure backup strategy
- [ ] Enable monitoring/alerting
- [ ] Review security headers
- [ ] Audit dependencies (npm audit)
- [ ] Enable 2FA for admin accounts
- [ ] Set up automated security scanning

## Scaling Guidelines

### When to Scale Up

- CPU usage > 70% for 5+ minutes
- Memory usage > 80%
- Response time > 500ms
- Error rate > 1%

### How to Scale

```bash
# Kubernetes (automatic with HPA)
kubectl get hpa

# Manual scaling
kubectl scale deployment travelhub-web --replicas=10

# ECS
aws ecs update-service \
  --cluster travelhub-cluster \
  --service travelhub-web \
  --desired-count 10
```

## Cost Optimization

### AWS Cost Savings

- Use Spot Instances for non-critical workloads
- Enable RDS reserved instances (40% savings)
- Use S3 lifecycle policies
- Enable CloudFront compression
- Right-size instances based on metrics

### Monitoring Costs

```bash
# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name travelhub-billing-alert \
  --alarm-description "Alert when spending exceeds $500" \
  --metric-name EstimatedCharges \
  --threshold 500
```

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check error rates
- Monitor API response times
- Review failed transactions

**Weekly:**
- Review logs for issues
- Check backup integrity
- Update dependencies (security patches)

**Monthly:**
- Review and optimize database queries
- Analyze user metrics
- Update documentation
- Review security alerts

### Getting Help

- Documentation: See README.md and ARCHITECTURE.md
- GitHub Issues: Report bugs and request features
- Email: support@travelhub.com
- Slack: #travelhub-support

---

**Deployment successful? Start here:**
1. Verify health check: `curl https://your-domain/api/health`
2. Check monitoring: Open Grafana dashboard
3. Test booking flow end-to-end
4. Monitor logs for first 24 hours
5. Set up alerts for critical metrics

**Questions?** Check ARCHITECTURE.md for system design details.