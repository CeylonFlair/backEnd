# API Gateway

This service acts as the API Gateway for the Seyy backend microservices architecture. It proxies requests to the appropriate backend services and handles JWT authentication for protected routes.
## Services Proxied

- **Auth Service:** `http://localhost:5001`
- **Listings Service:** `http://localhost:5002`
- **Orders Service:** `http://localhost:5003`
- **Messaging Service:** `http://localhost:5004`
- **Reviews Service:** `http://localhost:5005`
- **Payments Service:** `http://localhost:5006`

## Endpoints

| Endpoint                  | Service    | Auth Required | Description                       |
|---------------------------|------------|--------------|-----------------------------------|
| `/api/auth/*`             | Auth       | No           | Authentication (login, signup, etc.) |
| `/api/users/*`            | Auth       | No           | User-related public endpoints     |
| `/api/listings/*`         | Listings   | Yes (JWT)    | Listings management               |
| `/api/orders/*`           | Orders     | Yes (JWT)    | Order management                  |
| `/api/threads/*`          | Messaging  | Yes (JWT)    | Messaging threads                 |
| `/api/messages/*`         | Messaging  | Yes (JWT)    | Individual messages               |
| `/api/reviews/*`          | Reviews    | Yes (JWT)    | Review and rating management      |
| `/api/payments/ipn*`      | Payments   | No           | Payment IPN (Instant Payment Notification) |
| `/api/payments/*`         | Payments   | Yes (JWT)    | Payment operations                |
| `/health`                 | Gateway    | No           | Health check endpoint             |

## Running

```bash
npm install
npm start
```

The gateway will listen on port `8000` by default (or as set in the `PORT` environment variable).