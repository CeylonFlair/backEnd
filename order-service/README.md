# Order Service

The Order Service is a core microservice responsible for managing the lifecycle of orders or bookings within your application.

## Features
- Create bookings/orders for service listings
- Fetch orders for customers and providers
- Update order status (provider only)
- Statuses: pending, confirmed, in_progress, completed, cancelled
- Integrates with Service Listing service to get listing details
- JWT authentication required

## How to Run

1. Create `.env` (see `.env.example`)
2. `npm install`
3. `npm start` or `npm run dev`

## Endpoints

- `POST /api/orders` — Create new order (customer, JWT required)
- `GET /api/orders/my` — Get my orders (customer, JWT required)
- `GET /api/orders/provider` — Get orders for provider (provider, JWT required)
- `GET /api/orders/:id` — Get order details (customer or provider, JWT required)
- `PATCH /api/orders/:id/status` — Update order status (provider, JWT required)