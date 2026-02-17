# DevStore Backend

DevStore API backend — Node.js, Express, and Prisma.

## 🚀 Quick Start

```bash
# 1. Clone and install dependencies
git clone <repository-url> && cd backend && npm install

# 2. Automatic setup with Docker
npm run setup

# 3. Apply schema
npm run db:push

# 4. Seed database (optional)
npm run db:seed

# 5. Start server
npm run dev
```

**Done!** Visit `http://localhost:3333/ping` to verify it's working.

---

## 📚 API Documentation

Full API documentation is available in **Swagger UI**:

**→ [http://localhost:3333/api-docs](http://localhost:3333/api-docs)**

- Interactive documentation for all endpoints
- Test requests directly in the UI
- Request/response schemas
- Usage examples

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Installation](#installation)
- [Troubleshooting](#-troubleshooting)
- [Stripe Webhook](#stripe-webhook)

---

## Installation

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Docker & Docker Compose** (for local development)
  - or **PostgreSQL** (version 12+) if not using Docker
- **Git**

### Option 1: Quick Start with Docker (Recommended) 🐳

1. Clone, install dependencies, and run setup:

    ```bash
    git clone <repository-url>
    cd backend
    npm install
    npm run setup
    ```

2. Apply schema and start the server:

    ```bash
    npm run db:push
    npm run db:seed   # optional
    npm run dev
    ```

The server will be running at `http://localhost:3333`.

### Option 2: Manual setup (without Docker)

1. Clone, install, and configure the environment:

    ```bash
    git clone <repository-url>
    cd backend
    npm install
    cp .env.example .env
    ```

2. Edit `.env` with `DATABASE_URL`, Stripe keys, etc.

3. With PostgreSQL running, apply the schema:

    ```bash
    npx prisma migrate deploy
    npx prisma generate
    npm run db:seed
    npm run dev
    ```

---

### 🐳 Docker Commands

| Command               | Description                       |
| -------------------- | --------------------------------- |
| `npm run db:up`      | Start PostgreSQL container        |
| `npm run db:down`    | Stop PostgreSQL container         |
| `npm run db:logs`    | View PostgreSQL logs              |
| `npm run db:generate`| Generate Prisma Client           |
| `npm run db:migrate` | Create and apply migrations       |
| `npm run db:push`    | Sync schema (dev)                 |
| `npm run db:studio`  | Open Prisma Studio (GUI)          |
| `npm run db:seed`    | Seed database with initial data   |

**Default connection:**

- Host: `localhost` | Port: `5432`
- User: `postgres` | Password: `postgres`
- Database: `devstore`

---

### 🔧 Troubleshooting

#### Port 5432 already in use

```bash
# macOS (Homebrew)
brew services stop postgresql

# Linux (systemd)
sudo systemctl stop postgresql
```

Or change the port in `docker-compose.yml` (e.g. `5433:5432`) and update `DATABASE_URL`.

#### Container won't start

```bash
npm run db:logs
docker compose down -v
npm run db:up
```

#### Error "Cannot find module '../generated/prisma'"

```bash
npm run db:generate
```

#### Reset database completely

```bash
npm run db:down
docker volume rm backend_postgres_data
npm run db:up
npm run db:push
npm run db:seed
```

---

## Stripe Webhook

### Environment variables

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Dashboard setup

1. **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://your-domain.com/webhook/stripe`
3. Events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

The endpoint verifies the Stripe signature. Keep the secret secure and use HTTPS in production.

---

## Structure and models

- **Data models:** `prisma/schema.prisma`
- **Authentication:** `Authorization: Bearer <token>` for protected endpoints
