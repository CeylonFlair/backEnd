import express from "express";
import proxy from "express-http-proxy";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();



// JWT middleware for protected routes
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

// Service URLs (change as needed)
const SERVICES = {
  auth: "https://localhost:5001",
  listings: "https://localhost:5002",
  orders: "https://localhost:5003",
  messaging: "https://localhost:5004",
  reviews: "https://localhost:5005",
  payments: "https://localhost:5006",
};

app.use(cors({ origin: "https://localhost:5173", credentials: true }));

app.options("*", cors({ origin: "https://localhost:5173", credentials: true }));

// Public routes (login, signup, etc.)
app.use(
  "/api/auth",
  proxy(SERVICES.auth, {
    proxyReqPathResolver: (req) => `/api/auth${req.url}`,
  })
);

app.use(
  "/api/users",
  proxy(SERVICES.auth, {
    proxyReqPathResolver: (req) => `/api/users${req.url}`,
  })
);

// JWT-protected routes

//Listing
app.use(
  "/api/listings",
  authenticateJWT,
  proxy(SERVICES.listings, {
    proxyReqPathResolver: (req) => `/api/listings${req.url}`,
  })
);

//Orders
app.use(
  "/api/orders",
  authenticateJWT,
  proxy(SERVICES.orders, {
    proxyReqPathResolver: (req) => `/api/orders${req.url}`,
  })
);

//Messaging
app.use(
  "/api/threads",
  authenticateJWT,
  proxy(SERVICES.messaging, {
    proxyReqPathResolver: (req) => `/api/threads${req.url}`,
  })
);
app.use(
  "/api/messages",
  authenticateJWT,
  proxy(SERVICES.messaging, {
    proxyReqPathResolver: (req) => `/api/messages${req.url}`,
  })
);

// Review rating
app.use(
  "/api/reviews",
  authenticateJWT,
  proxy(SERVICES.reviews, {
    proxyReqPathResolver: (req) => `/api/reviews${req.url}`,
  })
);

// Payments IPN (public, no JWT)
app.use(
  "/api/payments/ipn",
  proxy(SERVICES.payments, {
    proxyReqPathResolver: (req) => `/api/payments/ipn${req.url}`,
  })
);

// Payments (protected)
app.use(
  "/api/payments",
  authenticateJWT,
  proxy(SERVICES.payments, {
    proxyReqPathResolver: (req) => `/api/payments${req.url}`,
  })
);

// Health check
app.get("/", (req, res) => res.send("API Gateway running"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));
