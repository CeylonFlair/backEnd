# Review & Rating Service

Microservice for managing customer reviews and ratings for listings and providers.

## Features

- Create, edit, and delete reviews (1 per order, only by customer who completed the order)
- List reviews for a listing, provider, or order
- Automatically updates average rating in Listing Service via API
- JWT authentication for all write operations
- MongoDB for review persistence

## Endpoints

- `POST /api/reviews` — Create a review (customer, JWT required)
- `PUT /api/reviews/:id` — Edit a review (customer, JWT required)
- `DELETE /api/reviews/:id` — Delete a review (customer, JWT required)
- `GET /api/reviews/listing/:listingId` — Get reviews for a listing
- `GET /api/reviews/provider/:providerId` — Get reviews for a provider
- `GET /api/reviews/order/:orderId` — Get review for a specific order

## Usage

1. Set up `.env` (see `.env` file)
2. `npm install`
3. `npm start` or `npm run dev`

## Environment

- Node 20+
- MongoDB
- Dockerfile included for containerization
