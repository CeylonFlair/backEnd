# Review & Rating Service Backend

This is the backend for the Review & Rating Service of the CeylonFlair project. It is built with Node.js, Express, and MongoDB, and is responsible for handling product reviews and ratings from users.

## Features
- Submit new product reviews and ratings
- Retrieve all reviews for a product
- Store and update review records in MongoDB

## How to Run
1. Clone the repository and navigate to the `Review_Rating_Service` folder.
2. Install dependencies:
   ```
   npm install
   ```
3. Make sure you have Node.js and MongoDB Atlas (or a MongoDB instance) set up.
4. Set up your `.env` file with the required environment variables (follow .env file format).
5. Start the server:
   ```
   node index.js
   ```
   Or, if you have a dev script (with nodemon) in your package.json:
   ```
   npm run dev
   ```

## API Endpoints
- `GET /api/reviews/:productId` — Get all reviews for a product
- `POST /api/reviews` — Submit a new review


