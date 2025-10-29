# TravelHub - Production-Grade Travel Marketplace

A fullstack, production-ready travel marketplace platform inspired by MakeMyTrip, featuring flights, hotels, buses, and activities booking with AI-powered features.

## 🚀 Features

### Core Functionality
- ✈️ **Multi-Category Booking**: Flights, Hotels, Buses, and Activities
- 🔍 **Advanced Search**: Traditional filters and AI-powered natural language search
- 💳 **Secure Payments**: PCI-compliant payment processing
- 📱 **Responsive Design**: Mobile-first, works on all devices
- 🌓 **Dark Mode**: Full dark mode support

### AI-Powered Features
- 🤖 **Natural Language Content Editor**: Edit listings using plain English
- 🔮 **Preview Before Apply**: See changes before committing
- 📝 **Full Audit Trail**: Track all AI-generated changes
- ↩️ **Rollback Support**: Undo any changes with one click
- 🛡️ **Human-in-the-Loop**: All AI changes require approval
- 🔍 **Smart Filters**: Convert natural language to safe database queries
- 🎯 **Personalized Recommendations**: AI-driven travel suggestions

### Security & Reliability
- 🔒 **Security Headers**: HSTS, CSP, XSS Protection
- 🛡️ **Rate Limiting**: Prevent abuse and DDoS attacks
- 🔐 **Input Validation**: SQL injection and XSS prevention
- 📊 **Health Checks**: Kubernetes-ready health endpoints
- 🔍 **Request Tracing**: Full request ID tracking

### Observability
- 📈 **Prometheus Metrics**: Performance and business metrics
- 📊 **Grafana Dashboards**: Real-time monitoring
- 🐛 **Error Tracking**: Sentry integration
- 📝 **Structured Logging**: JSON logging for easy parsing
- ⚡ **Performance Monitoring**: Track API response times

## 🏗️ Architecture

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # Backend API routes
│   │   │   ├── search/        # Search endpoints
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── ai/            # AI subsystem APIs
│   │   │   └── health/        # Health check
│   │   ├── booking/           # Booking flow pages
│   │   ├── confirmation/      # Confirmation pages
│   │   └── supplier/          # Supplier portal
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── SearchBar.tsx     # Search interface
│   │   ├── FlightCard.tsx    # Flight listing card
│   │   └── AIContentEditor.tsx # AI content editor
│   ├── lib/                   # Utilities
│   │   ├── monitoring.ts     # Observability utils
│   │   └── mockData.ts       # Development data
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Security middleware
├── __tests__/                 # Test files
├── .github/workflows/         # CI/CD pipelines
├── Dockerfile                 # Container config
├── docker-compose.yml         # Multi-service setup
└── prometheus.yml            # Monitoring config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (optional)
- PostgreSQL 16+ (for production)
- Redis 7+ (for caching)

### Local Development

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd travelhub
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
```
http://localhost:3000
```

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm test             # Run tests
```

### Project Structure

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI Components**: Shadcn/UI + Tailwind CSS
- **State Management**: React hooks
- **API Routes**: Next.js API routes (serverless functions)
- **Styling**: Tailwind CSS v4 with custom design tokens

## 🤖 AI Features

### Natural Language Content Editor

Edit any listing using plain English:

```javascript
// Example: Decrease flight price
"Decrease price by 2000"

// Example: Add hotel amenities
"Add amenity: Free breakfast"

// Example: Update availability
"Mark as unavailable"
```

**Safety Features:**
- ✅ Preview changes before applying
- ✅ Human approval required
- ✅ Full audit trail of all changes
- ✅ One-click rollback
- ✅ Change validation

### Natural Language Search

Search using natural language queries:

```
"Show me non-stop flights under 20000"
"Top 5 highest rated hotels with pool"
"Cheapest business class flights to Dubai"
"AC sleeper buses to Bangalore"
```

**Security:**
- SQL injection prevention
- XSS attack prevention
- Query validation
- Safe AST generation

### Personalized Recommendations

AI analyzes:
- User booking history
- Search patterns
- Price preferences
- Rating importance
- Amenity preferences

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Prometheus Metrics
```
http://localhost:9090
```

### Grafana Dashboards
```
http://localhost:3001
Username: admin
Password: admin
```

## 🔒 Security

### Implemented Security Measures

1. **HTTP Security Headers**
   - HSTS (Strict-Transport-Security)
   - CSP (Content-Security-Policy)
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection

2. **Rate Limiting**
   - 100 requests per minute per IP
   - Configurable via environment variables

3. **Input Validation**
   - SQL injection prevention
   - XSS attack prevention
   - CSRF protection

4. **Authentication** (Ready for integration)
   - NextAuth.js compatible
   - JWT token support
   - Role-based access control

## 🚢 Deployment

### Environment Variables

Required for production:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
```

See `.env.example` for full list.

### CI/CD Pipeline

GitHub Actions workflow includes:
- ✅ Linting
- ✅ Type checking
- ✅ Unit tests
- ✅ Integration tests
- ✅ Security scanning (npm audit, Snyk)
- ✅ Docker build and push
- ✅ Automated deployment
- ✅ Slack notifications

### Kubernetes Ready

```yaml
# Health check endpoint
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

## 📈 Performance

- ⚡ Server-side rendering (SSR)
- 📦 Code splitting
- 🖼️ Image optimization
- 🗜️ Response compression
- 💾 Redis caching
- 🔄 CDN-ready static assets

## 🧩 Extensibility

### Add New Travel Category

1. Define type in `src/types/travel.ts`
2. Add mock data in `src/lib/mockData.ts`
3. Create card component
4. Update search API
5. Add to navigation

### Integrate Real Payment Gateway

1. Install payment SDK
2. Update `src/app/booking/[id]/page.tsx`
3. Add webhook handler
4. Configure environment variables

### Connect to Real Database

1. Update `DATABASE_URL` in `.env`
2. Run migrations (add migration tool)
3. Update API routes to use database
4. Remove mock data imports

## 📚 API Documentation

### Search API
```typescript
POST /api/search
Body: {
  category: 'flights' | 'hotels' | 'buses' | 'activities',
  from?: string,
  to?: string,
  departDate?: string,
  passengers?: number,
  class?: string
}
```

### AI Content Edit API
```typescript
POST /api/ai/content-edit
Body: {
  targetType: string,
  targetId: string,
  naturalLanguageCommand: string,
  userId: string
}
```

### Natural Language Query API
```typescript
POST /api/ai/nl-query
Body: {
  naturalLanguage: string,
  category: string
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- Vercel for deployment platform
- Open source community

## 📞 Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Email: support@travelhub.com

---

**Built with ❤️ using Next.js, TypeScript, and AI**