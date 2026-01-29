# SiteFlow (BuildOps Lite)

**Production-ready, self-hosted construction operations management system**

## Overview

SiteFlow is a comprehensive multi-tenant application for managing construction projects with:
- **Task management** with weekly planning, dependencies, and blocking rules
- **Quality inspections** with customizable checklists and photo requirements
- **Issue tracking** (punch-list) with SLA monitoring and automated escalations
- **Delivery management** with work-blocking capabilities
- **Decision tracking** with approval workflows
- **RBAC** (Role-Based Access Control) at tenant and project levels
- **Automated workflows** for reminders, notifications, and daily digests
- **Audit trails** for all changes

## Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify + TypeScript
- **Database**: PostgreSQL with Kysely query builder
- **Queue**: Redis + BullMQ
- **Storage**: MinIO (S3-compatible)
- **API**: OpenAPI/Swagger with Zod validation

### Frontend
- **Framework**: React 18 + Vite
- **Router**: TanStack Router
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **UI**: Tailwind CSS
- **Drag & Drop**: dnd-kit

### Infrastructure
- **Reverse Proxy**: Nginx
- **Container**: Docker + Docker Compose
- **Package Manager**: pnpm workspaces

## Architecture

### Monorepo Structure
```
buildops-lite/
├── apps/
│   ├── api/          # Fastify backend
│   ├── worker/       # BullMQ background jobs
│   └── web/          # React frontend
├── packages/
│   ├── shared/       # Shared types, Zod schemas
│   └── ui/           # Reusable UI components
├── db/
│   ├── migrations/   # SQL migration files
│   └── seed/         # Database seed scripts
├── infra/
│   ├── nginx/        # Nginx configuration
│   └── scripts/      # VPS setup and backup scripts
└── docker/           # Dockerfiles
```

### Multi-Tenant Model
- **Tenant** → Projects → Locations, Tasks, Inspections, Issues, Deliveries, Decisions
- **Invite-only**: No public registration
- **Object-level access**: Users see only entities they're assigned to or watching

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/mk-ui-dev/buildops-lite.git
cd buildops-lite
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start development environment**
```bash
make dev
```

This will:
- Start PostgreSQL, Redis, MinIO in Docker
- Run database migrations
- Start API server (http://localhost:3000)
- Start worker process
- Start frontend dev server (http://localhost:5173)

4. **Seed demo data** (optional)
```bash
make seed
```

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for VPS setup instructions.

## Environment Variables

### Minimal Production ENV (runtime)
```bash
INSTANCE_MASTER_KEY=<random-256bit-hex>
DOMAIN=buildops.example.com
BOOTSTRAP_ADMIN_TOKEN=<secure-random-token>
```

All other configuration (SMTP, S3 credentials, policies) is managed via UI and stored encrypted in database.

## Key Features

### 1. Task Management
- Weekly planning with drag-and-drop
- Task dependencies with automatic blocking
- Multi-assignee support
- Work blocking by deliveries or decisions

### 2. Inspections
- Customizable checklist templates
- Photo requirements per checklist item
- Approve/Reject workflow
- Auto-generate issues on rejection

### 3. Issue Tracking
- SLA monitoring with overdue detection
- Photo proof requirements (before/after)
- Inspector verification workflow
- Automated escalation notifications

### 4. Delivery Management
- Tracks supplier deliveries
- Can block task start until delivered
- Acceptance/rejection workflow

### 5. Decision Tracking
- Multi-approver workflows
- Can block task start until approved
- Auto-create follow-up tasks

### 6. Automated Workflows
- Daily digest emails
- Reminder notifications (D-2, D-0)
- Overdue escalations
- Review timeout alerts

## Security

- **Authentication**: JWT access tokens + HttpOnly refresh cookies with CSRF protection
- **Authorization**: RBAC + object-level access control
- **Secrets**: AES-256-GCM encryption for instance settings
- **Passwords**: Argon2id hashing
- **API**: Helmet, CORS, rate limiting, input validation (Zod)
- **Audit**: Complete activity log for all changes

## RBAC Roles

### Instance Level
- **InstanceAdmin**: Manage system settings, SMTP, S3, policies

### Tenant Level
- **TenantAdmin**: Manage users, roles, projects, checklist templates

### Project Level
- **INVESTOR**: Read-only + create decisions
- **INSPECTOR**: Approve/reject inspections, verify issues
- **GC** (General Contractor): Full project management
- **SUB** (Subcontractor): Limited to assigned tasks
- **PROCUREMENT**: Manage deliveries

## API Documentation

Once the API is running, access Swagger UI at:
```
http://localhost:3000/api/docs
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @buildops/api test
```

## Database Schema

See [db/migrations/001_init.sql](./db/migrations/001_init.sql) for complete normalized schema with:
- 40+ tables
- Foreign key constraints
- Indexes (including partial indexes)
- Check constraints
- Audit history tables

## License

MIT

## Support

For issues and questions, please use GitHub Issues.
