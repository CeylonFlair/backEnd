# Payment Service (PayHere Sandbox)

A microservice for payment initiation and tracking using PayHere (Sri Lankan payment gateway), with sandbox support for safe testing.

## Features

- Initiate payments for orders (returns PayHere payment URL)
- Handles IPN/webhook from PayHere to update payment status
- Tracks payment status for each order
- JWT-protected endpoints
- MongoDB for payment persistence

## Endpoints

- `POST /api/payments/initiate` — Initiate payment for an order (returns PayHere payment URL)
- `POST /api/payments/ipn` — PayHere IPN webhook (PayHere calls this after payment)
- `GET /api/payments/status/:orderId` — Get payment status for an order

## Environment Variables

See `.env` for all required variables, including PayHere sandbox credentials and URLs.

## Usage

1. Set up `.env` with your PayHere sandbox merchant details and URLs.
2. `npm install`
3. `npm start` or `npm run dev`
4. Expose your IPN endpoint publicly (e.g., with [ngrok](https://ngrok.com/)) when testing with PayHere sandbox.

## Notes

- The payment service expects an Order Service for order validation.
- On successful payment, you may wish to notify the Order Service to mark the order as paid.
