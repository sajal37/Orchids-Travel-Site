# TravelHub Architecture

## System Overview

TravelHub is a production-grade travel marketplace built as a monorepo with clear separation of concerns, designed for scalability, reliability, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │          │
│  │  (Next.js)   │  │   (Future)   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes                           │   │
│  │  • Rate Limiting • Authentication • Request Validation    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Search     │  │   Bookings   │  │  AI Services │          │
│  │   Service    │  │   Service    │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Payments    │  │  Suppliers   │  │  Analytics   │          │
│  │  Service     │  │  Service     │  │  Service     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   S3/CDN     │          │
│  │  (Primary)   │  │   (Cache)    │  │  (Assets)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Observability Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Prometheus  │  │   Grafana    │  │    Sentry    │          │
│  │  (Metrics)   │  │ (Dashboards) │  │  (Errors)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Next.js 15)

**Technology Stack:**
- React 19 with Server Components
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Shadcn/UI for component library

**Key Features:**
- Server-side rendering (SSR) for SEO
- Client-side rendering for interactivity
- Code splitting and lazy loading
- Optimistic UI updates

**Directory Structure:**
```
src/app/
├── (marketing)/          # Public marketing pages
├── (auth)/              # Authentication pages
├── booking/             # Booking flow
├── supplier/            # Supplier portal
└── api/                 # API routes
```

### 2. Backend API Layer

**Architecture:** Serverless functions via Next.js API routes

**Key APIs:**
- `/api/search` - Search and filter listings
- `/api/bookings` - Booking management
- `/api/ai/*` - AI-powered features
- `/api/health` - Health checks

**Security:**
- Rate limiting (100 req/min)
- Input validation and sanitization
- CORS configuration
- Security headers (HSTS, CSP, etc.)

### 3. AI Subsystem

**Components:**

**a) Natural Language Content Editor**
- Parse natural language commands
- Generate preview of changes
- Require human approval
- Full audit trail
- Rollback support

**b) Natural Language Query Converter**
- Parse NL queries to structured filters
- Generate safe database queries
- Validate query safety (SQL injection prevention)
- Return AST for execution

**c) Recommendation Engine**
- User behavior analysis
- Collaborative filtering
- Content-based filtering
- Real-time personalization

**Safety Measures:**
- All changes require human approval
- Preview before apply
- Audit logging
- Rollback capability
- Input validation
- Query sanitization

### 4. Data Layer

**Primary Database: PostgreSQL**
- User accounts and profiles
- Bookings and transactions
- Listings (flights, hotels, etc.)
- AI audit trail

**Cache: Redis**
- Session management
- Search results caching
- Rate limiting counters
- Real-time data

**Object Storage: S3/CloudFront**
- Images and media
- User uploads
- Static assets

**Data Models:**
```typescript
User
├── id, email, name, role
├── bookings[]
└── preferences

Booking
├── id, userId, itemId
├── status, amount
├── passengers[]
└── paymentDetails

Listing (Flight/Hotel/Bus/Activity)
├── id, type, name
├── price, availability
├── amenities[], ratings
└── metadata

AIContentEdit
├── id, targetType, targetId
├── originalContent, proposedContent
├── status, createdBy
└── auditTrail
```

### 5. Observability Stack

**Metrics (Prometheus)**
- API response times
- Error rates
- Active users
- Booking conversion rate
- Cache hit ratio

**Logging (Structured JSON)**
- Request/response logs
- Error logs with stack traces
- AI operation logs
- Audit trail

**Monitoring (Grafana)**
- Real-time dashboards
- Alert configuration
- Performance metrics
- Business metrics

**Error Tracking (Sentry)**
- Frontend errors
- Backend errors
- Source maps
- User context

## Deployment Architecture

### Container Strategy

```dockerfile
# Multi-stage build
Stage 1: Dependencies → Stage 2: Build → Stage 3: Production
```

**Benefits:**
- Smaller image size
- Faster deployment
- Better security

### Orchestration Options

**Option 1: Docker Compose (Development/Small Scale)**
```yaml
services:
  - web (Next.js)
  - postgres
  - redis
  - prometheus
  - grafana
```

**Option 2: Kubernetes (Production)**
```yaml
resources:
  - Deployment (3+ replicas)
  - Service (LoadBalancer)
  - HPA (3-10 pods)
  - Ingress (HTTPS)
```

**Option 3: AWS ECS (Managed)**
```yaml
resources:
  - ECS Cluster
  - ECS Service (Fargate)
  - Application Load Balancer
  - RDS PostgreSQL
  - ElastiCache Redis
```

## Security Architecture

### Defense in Depth

**Layer 1: Network**
- WAF (Web Application Firewall)
- DDoS protection
- Rate limiting

**Layer 2: Application**
- Input validation
- Output encoding
- CSRF protection
- Security headers

**Layer 3: Data**
- Encryption at rest
- Encryption in transit
- Access control
- Audit logging

### Security Headers

```
Strict-Transport-Security: max-age=63072000
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

## Scalability Strategy

### Horizontal Scaling
- Stateless application servers
- Load balancer distribution
- Auto-scaling based on metrics

### Vertical Scaling
- Database read replicas
- Redis cluster
- CDN for static assets

### Caching Strategy
```
Level 1: CDN (CloudFront)
Level 2: Redis (Application cache)
Level 3: Database query cache
```

## Disaster Recovery

### Backup Strategy
- Database: Daily automated backups (7-day retention)
- Redis: RDB snapshots
- Application: Docker image versioning

### Recovery Plan
1. Detect issue (monitoring alerts)
2. Switch to read-only mode
3. Restore from backup
4. Verify data integrity
5. Resume normal operations

### RPO/RTO Targets
- RPO (Recovery Point Objective): 1 hour
- RTO (Recovery Time Objective): 4 hours

## Performance Optimization

### Frontend
- Code splitting
- Image optimization
- Font optimization
- Lazy loading
- Service workers (future)

### Backend
- Database query optimization
- Connection pooling
- Caching strategies
- Async processing

### Monitoring
- Core Web Vitals
- API response times
- Database query times
- Cache hit rates

## Future Enhancements

1. **Microservices Migration**
   - Split monolith into services
   - Event-driven architecture
   - Message queue (RabbitMQ/Kafka)

2. **Mobile Apps**
   - React Native apps
   - Shared business logic
   - Push notifications

3. **Advanced AI Features**
   - Dynamic pricing
   - Fraud detection
   - Chatbot support
   - Image recognition

4. **Real-time Features**
   - Live price updates
   - Real-time availability
   - WebSocket connections

5. **Multi-region Deployment**
   - Global CDN
   - Regional databases
   - Data replication

## Technology Decisions

### Why Next.js?
- Full-stack framework
- Server-side rendering
- API routes
- Great developer experience

### Why PostgreSQL?
- ACID compliance
- Complex queries
- JSON support
- Strong ecosystem

### Why Redis?
- Fast in-memory cache
- Pub/sub support
- Session storage
- Rate limiting

### Why TypeScript?
- Type safety
- Better IDE support
- Catch errors early
- Self-documenting code

## Conclusion

This architecture prioritizes:
- **Security**: Defense in depth, encryption, validation
- **Reliability**: Redundancy, monitoring, backups
- **Scalability**: Horizontal scaling, caching, CDN
- **Maintainability**: Clear structure, documentation, tests
- **Observability**: Metrics, logs, tracing, alerts