# DevStore Backend API Documentation

This document describes all available API routes, their parameters, request/response types, and authentication requirements.

## 🚀 Quick Start

```bash
# 1. Clone e instale dependências
git clone <repository-url> && cd backend && npm install

# 2. Setup automático com Docker
npm run setup

# 3. Aplicar schema
npm run db:push

# 4. Popular banco (opcional)
npm run db:seed

# 5. Iniciar servidor
npm run dev
```

**Pronto!** Acesse `http://localhost:4000/ping` para verificar se está funcionando.

---

## Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#installation)
- [Troubleshooting](#-troubleshooting)
- [API Documentation](#-api-documentation)
- [General](#general)
- [Banners](#banners)
- [Products](#products)
- [Categories](#categories)
- [Cart](#cart)
- [User](#user)
- [Orders](#orders)
- [Webhooks](#webhooks)

> 💡 **Primeira vez?** Siga o [Setup Checklist](./SETUP-CHECKLIST.md) para não pular nenhum passo!

---

## Installation

### Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Docker & Docker Compose** (for local development with PostgreSQL)
    - OR **PostgreSQL** database (version 12 or higher) if not using Docker
- **Git** for version control

### Setup Instructions

#### Option 1: Quick Start with Docker (Recomendado) 🐳

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd backend
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Setup completo automático**

    ```bash
    npm run setup
    ```

    Este comando irá:
    - Copiar `.env.example` para `.env`
    - Subir o container Docker do PostgreSQL
    - Gerar o Prisma Client

4. **Aplicar o schema do banco**

    ```bash
    npm run db:push
    ```

    Ou criar uma migration:

    ```bash
    npm run db:migrate
    ```

5. **Seed do banco de dados (opcional)**

    Popule o banco com dados iniciais:

    ```bash
    npm run db:seed
    ```

6. **Iniciar o servidor**
    ```bash
    npm run dev
    ```

**Pronto!** 🎉 O servidor estará rodando em `http://localhost:4000`

---

#### Option 2: Setup Manual (sem Docker)

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd backend
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Configuration**

    Copy the environment example file and configure your variables:

    ```bash
    cp .env.example .env
    ```

    Then edit the `.env` file with your specific configuration values (database URL, Stripe keys, etc.).

4. **Database Setup**

    Make sure your PostgreSQL database is running and accessible. Verify your `DATABASE_URL` variable in the `.env` file is correctly configured for your database connection.

5. **Run Database Migrations**

    Apply the database schema:

    ```bash
    npx prisma migrate deploy
    ```

    Or for development with migration history:

    ```bash
    npx prisma migrate dev
    ```

6. **Generate Prisma Client**

    ```bash
    npx prisma generate
    ```

7. **Seed the Database**

    Populate the database with initial data (categories, products, banners):

    ```bash
    npm run db:seed
    ```

---

### 🐳 Docker Commands

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run db:up`       | Inicia o container PostgreSQL       |
| `npm run db:down`     | Para o container PostgreSQL         |
| `npm run db:logs`     | Visualiza logs do PostgreSQL        |
| `npm run db:generate` | Gera o Prisma Client                |
| `npm run db:migrate`  | Cria e aplica migrations            |
| `npm run db:push`     | Sincroniza schema (desenvolvimento) |
| `npm run db:studio`   | Abre Prisma Studio (GUI)            |
| `npm run db:seed`     | Popula banco com dados iniciais     |

**Configurações do Docker:**

- Host: `localhost`
- Porta: `5432`
- Usuário: `postgres`
- Senha: `postgres`
- Database: `devstore`

Para mais detalhes sobre Docker, consulte [DOCKER.md](./DOCKER.md)

---

### 🔧 Troubleshooting

#### Porta 5432 já está em uso

Se você já tem PostgreSQL instalado localmente:

```bash
# macOS (Homebrew)
brew services stop postgresql

# Linux (systemd)
sudo systemctl stop postgresql

# Ou altere a porta no docker-compose.yml
# Mude de "5432:5432" para "5433:5432"
# E ajuste DATABASE_URL para localhost:5433
```

#### Container não inicia

```bash
# Ver logs detalhados
npm run db:logs

# Remover e recriar
docker compose down -v
npm run db:up
```

#### Erro "Cannot find module '../generated/prisma'"

```bash
# Gerar o Prisma Client
npm run db:generate
```

#### Resetar banco completamente

```bash
npm run db:down
docker volume rm backend_postgres_data
npm run db:up
npm run db:push
npm run db:seed
```

---

## 📚 API Documentation

A API possui documentação interativa com **Swagger UI**:

```
http://localhost:3333/api-docs
```

### Recursos do Swagger:

- ✅ Documentação interativa de todos os endpoints
- ✅ Testar requisições diretamente na interface
- ✅ Ver schemas de request/response
- ✅ Exemplos de uso

Para adicionar documentação em novas rotas, consulte [SWAGGER.md](./SWAGGER.md)

---

### Running the Project

#### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:4000` (or the port specified in your `.env` file).

#### Production Mode

```bash
# Build the project (if applicable)
npm run build

# Start the production server
npm start
```

### Verifying the Installation

1. **Health Check**

    Visit `http://localhost:3000/ping` - you should see:

    ```json
    { "pong": true }
    ```

---

## General

### `GET /ping`

- **Description:** Health check endpoint.
- **Auth:** None
- **Response:**
    ```json
    { "pong": true }
    ```

---

## Banners

### `GET /banners`

- **Description:** Get all banners.
- **Auth:** None
- **Response:**
    ```json
    {
        "error": null,
        "banners": [
            {
                "img": "media/banners/<filename>",
                "link": "<url>"
            }
        ]
    }
    ```

---

## Products

### `GET /products`

- **Description:** List products with optional filters.
- **Auth:** None
- **Query Parameters:**
  | Name | Type | Required | Description |
  | -------- | ------ | -------- | -------------------------------- |
  | metadata | string | No | JSON string of metadata filters |
  | orderBy | string | No | "views", "selling", or "price" |
  | limit | string | No | Max number of products to return |
- **Response:**
    ```json
    {
        "error": null,
        "products": [
            {
                "id": 1,
                "label": "Product Name",
                "price": 99.99,
                "image": "media/products/<filename>",
                "liked": false
            }
        ]
    }
    ```

### `GET /product/:id`

- **Description:** Get a single product by ID.
- **Auth:** None
- **Params:**
  | Name | Type | Required |
  | ---- | ---------------- | -------- |
  | id | string (numeric) | Yes |
- **Response:**
    ```json
    {
        "error": null,
        "product": {
            "id": 1,
            "label": "Product Name",
            "price": 99.99,
            "description": "...",
            "categoryId": 1,
            "images": ["media/products/<filename>"]
        },
        "category": {
            "id": 1,
            "name": "Category Name",
            "slug": "category-slug"
        }
    }
    ```

### `GET /product/:id/related`

- **Description:** Get related products from the same category.
- **Auth:** None
- **Params:**
  | Name | Type | Required |
  | ---- | ---------------- | -------- |
  | id | string (numeric) | Yes |
- **Query:**
  | Name | Type | Required |
  | ----- | ---------------- | -------- |
  | limit | string (numeric) | No |
- **Response:**
    ```json
    {
      "error": null,
      "products": [ ... ]
    }
    ```

---

## Categories

### `GET /category/:slug/metadata`

- **Description:** Get category and its metadata by slug.
- **Auth:** None
- **Params:**
  | Name | Type | Required |
  | ---- | ------ | -------- |
  | slug | string | Yes |
- **Response:**
    ```json
    {
        "error": null,
        "category": {
            "id": 1,
            "name": "Category Name",
            "slug": "category-slug"
        },
        "metadata": [
            {
                "id": "meta_id",
                "name": "Meta Name",
                "values": [{ "id": "value_id", "label": "Value Label" }]
            }
        ]
    }
    ```

---

## Cart

### `POST /cart/mount`

- **Description:** Get product details for a list of product IDs.
- **Auth:** None
- **Body:**
    ```json
    { "ids": [1, 2, 3] }
    ```
- **Response:**
    ```json
    {
        "error": null,
        "products": [
            {
                "id": 1,
                "label": "Product Name",
                "price": 99.99,
                "image": "media/products/<filename>"
            }
        ]
    }
    ```

### `GET /cart/shipping`

- **Description:** Calculate shipping cost and days for a zipcode.
- **Auth:** None
- **Query:**
  | Name | Type | Required |
  | ------- | ------ | -------- |
  | zipcode | string | Yes |
- **Response:**
    ```json
    {
        "error": null,
        "zipcode": "12345-678",
        "cost": 7,
        "days": 3
    }
    ```

### `POST /cart/finish`

- **Description:** Finish the cart and create an order (returns Stripe checkout URL).
- **Auth:** Yes (Bearer token)
- **Body:**
    ```json
    {
        "cart": [{ "productId": 1, "quantity": 2 }],
        "addressId": 1
    }
    ```
- **Response:**
    ```json
    {
        "error": null,
        "url": "https://checkout.stripe.com/..."
    }
    ```

---

## User

### `POST /user/register`

- **Description:** Register a new user.
- **Auth:** None
- **Body:**
    ```json
    {
        "name": "User Name",
        "email": "user@email.com",
        "password": "password123"
    }
    ```
- **Response:**
    ```json
    {
        "error": null,
        "user": {
            "id": 1,
            "name": "User Name",
            "email": "user@email.com"
        }
    }
    ```

### `POST /user/login`

- **Description:** Login and receive a token.
- **Auth:** None
- **Body:**
    ```json
    {
        "email": "user@email.com",
        "password": "password123"
    }
    ```
- **Response:**
    ```json
    {
        "error": null,
        "token": "<uuid>"
    }
    ```

### `GET /user/addresses`

- **Description:** Get all addresses for the logged-in user.
- **Auth:** Yes (Bearer token)
- **Response:**
    ```json
    {
        "error": null,
        "addresses": [
            {
                "id": 1,
                "zipcode": "12345-678",
                "street": "Street Name",
                "number": "123",
                "city": "City",
                "state": "State",
                "country": "Country",
                "complement": "Apt 1"
            }
        ]
    }
    ```

### `POST /user/addresses`

- **Description:** Add a new address for the logged-in user.
- **Auth:** Yes (Bearer token)
- **Body:**
    ```json
    {
        "zipcode": "12345-678",
        "street": "Street Name",
        "number": "123",
        "city": "City",
        "state": "State",
        "country": "Country",
        "complement": "Apt 1"
    }
    ```
- **Response:**
    ```json
    {
        "error": null,
        "address": {
            "id": 1,
            "zipcode": "12345-678",
            "street": "Street Name",
            "number": "123",
            "city": "City",
            "state": "State",
            "country": "Country",
            "complement": "Apt 1"
        }
    }
    ```

---

## Orders

### `GET /orders`

- **Description:** List all orders for the logged-in user.
- **Auth:** Yes (Bearer token)
- **Response:**
    ```json
    {
        "error": null,
        "orders": [
            {
                "id": 1,
                "status": "pending",
                "total": 199.99,
                "createdAt": "2024-07-24T18:49:43.000Z"
            }
        ]
    }
    ```

### `GET /orders/:id`

- **Description:** Get details of a specific order by ID for the logged-in user.
- **Auth:** Yes (Bearer token)
- **Params:**
  | Name | Type | Required |
  | ---- | ---------------- | -------- |
  | id | string (numeric) | Yes |
- **Response:**
    ```json
    {
        "error": null,
        "order": {
            "id": 1,
            "status": "pending",
            "total": 199.99,
            "shippingCost": 7,
            "shippingDays": 3,
            "shippingZipcode": "12345-678",
            "shippingStreet": "Street Name",
            "shippingNumber": "123",
            "shippingCity": "City",
            "shippingState": "State",
            "shippingCountry": "Country",
            "shippingComplement": "Apt 1",
            "createdAt": "2024-07-24T18:49:43.000Z",
            "orderItems": [
                {
                    "id": 1,
                    "quantity": 2,
                    "price": 99.99,
                    "product": {
                        "id": 1,
                        "label": "Product Name",
                        "price": 99.99,
                        "image": "media/products/<filename>"
                    }
                }
            ]
        }
    }
    ```

### `GET /orders/session`

- **Description:** Get order ID by Stripe session ID.
- **Auth:** None
- **Query:**
  | Name | Type | Required | Description |
  | ---------- | ------ | -------- | -------------------------- |
  | session_id | string | Yes | Stripe checkout session ID |
- **Response:**
    ```json
    {
        "error": null,
        "orderId": 123
    }
    ```

---

## Webhooks

### `POST /webhook/stripe`

- **Description:** Handle Stripe payment events and update order statuses.
- **Auth:** None (verified via Stripe signature)
- **Purpose:** Processes Stripe webhook events to automatically update order statuses
- **Supported Events:**
    - `checkout.session.completed` - Marks order as `paid`
    - `checkout.session.expired` - Marks order as `expired`
    - `payment_intent.payment_failed` - Marks order as `failed`
- **Order Status Values:**
    - `pending` - Order created, waiting for payment
    - `paid` - Payment completed successfully
    - `expired` - Checkout session expired
    - `failed` - Payment failed

---

## Authentication

Some endpoints require authentication via a Bearer token. Pass the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Error Handling

All endpoints return an `error` field. If the request is successful, `error` is `null`. Otherwise, it contains an error message.

---

## Data Models

See `prisma/schema.prisma` for full database models.

---

## Stripe Webhook Setup

The application includes a Stripe webhook endpoint to handle payment events and automatically update order statuses.

### Environment Variables Required

Add these environment variables to your `.env` file:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Setting up the Webhook in Stripe Dashboard

1. Go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Click "Add endpoint"
4. Set the endpoint URL to: `https://your-domain.com/webhook/stripe`
5. Select the following events:
    - `checkout.session.completed`
    - `checkout.session.expired`
    - `payment_intent.payment_failed`
6. Copy the webhook signing secret and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### Security

The webhook endpoint verifies the Stripe signature to ensure requests are legitimate. Make sure to:

- Keep your `STRIPE_WEBHOOK_SECRET` secure
- Use HTTPS in production
- Never expose the webhook secret in client-side code

# Todo

- [x] Implement wishlist post
- [x] Implement wishlist get
- [x] Implement wishlist delete
- [x] Implement translations

- [ ] Implement price with card

- [ ] Implement shipping cost logic
- [ ] Implement shipping days logic

- [ ] Implement buy together post
- [ ] Implement buy together get
- [ ] Implement buy together delete
- [ ] Implement buy together delete all

- [ ] Implement order bump post
- [ ] Implement order bump get
- [ ] Implement order bump delete
- [ ] Implement order bump delete all

- [ ] Implement rating system
