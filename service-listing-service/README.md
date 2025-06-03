# Service Listing Service

Microservice for managing artisan service/product listings in a MERN microservices architecture.

## Features

- Create, read, update, delete listings (CRUD)
- Search/filter by keyword, category, price, provider, and rating
- JWT auth-protected provider endpoints
- Inter-service communication: fetch provider details from User Service
- Extensible for image uploads/reviews

## How to Run

1. Create `.env` (see `.env.example`)
2. `npm install`
3. `npm start` or `npm run dev`

## Endpoints

- `GET /api/listings` — List/search/filter all listings (public)
- `POST /api/listings` — Create new listing (provider only, JWT required)
  - Accepts multipart/form-data with:
    - `coverImage` (file, optional): Cover image for the listing
    - `images` (file[], optional): Up to 5 additional images
    - `deliveryTime` (integer, required): Delivery time in days
    - `numberOfRevisions` (integer, required): Number of allowed revisions (-1 for unlimited)
    - `features` (string[], optional): List of features
    - Other fields as form fields
- `GET /api/listings/:id` — Get listing by ID
- `GET /api/listings/:id/with-provider` — Get listing with provider details (calls User Service)
- `PUT /api/listings/:id` — Update own listing (JWT required)
  - Accepts multipart/form-data with:
    - `coverImage` (file, optional): Replaces the cover image
    - `images` (file[], optional): Adds new images
    - `removeImages` (stringified array, optional): URLs to remove
    - `deliveryTime` (integer, optional): Delivery time in days
    - `numberOfRevisions` (integer, optional): Number of allowed revisions (-1 for unlimited)
    - `features` (string[], optional): List of features
    - Other fields as form fields
- `DELETE /api/listings/:id` — Delete own listing (JWT required)

## Pagination

Most listing endpoints support pagination via query parameters:

- `page` (default: 1): The page number to retrieve.
- `limit` (default: 10): The number of listings per page.

**Example usage:**

```
GET /api/listings?page=2&limit=5
GET /api/listings/123456/with-provider?page=1&limit=20
```

The response will include a `pagination` object:

```json
{
  "listings": [ ... ],
  "pagination": {
    "total": 42,
    "page": 2,
    "limit": 5,
    "totalPages": 9
  }
}
```
