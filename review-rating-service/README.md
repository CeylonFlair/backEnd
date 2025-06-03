# Review & Rating Service

The Review & Rating Service manages customer feedback for both service listings and providers in your application. It allows customers who have completed an order to create, edit, or delete a review for that order. The service also provides endpoints to list reviews for a specific listing, provider, or order. Whenever a review is added, edited, or deleted, it automatically updates the average rating in the Listing Service via API. All write operations require JWT authentication, and all review data is stored in MongoDB. This service helps maintain transparent and up-to-date feedback for services and providers on your platform.

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
