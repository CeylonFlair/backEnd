import express from "express";
import proxy from "express-http-proxy";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
  auth: "http://localhost:5001",
  listings: "http://localhost:5002",
  orders: "http://localhost:5003",
  messaging: "http://localhost:5004",
  reviews: "http://localhost:5005",
  payments: "http://localhost:5006",
};

// Public routes (login, signup, etc.)
app.use("/api/auth", proxy(SERVICES.auth));

// JWT-protected routes
app.use("/api/listings", authenticateJWT, proxy(SERVICES.listings));
app.use("/api/orders", authenticateJWT, proxy(SERVICES.orders));
app.use("/api/messaging", authenticateJWT, proxy(SERVICES.messaging));
app.use("/api/reviews", authenticateJWT, proxy(SERVICES.reviews));
app.use("/api/payments", authenticateJWT, proxy(SERVICES.payments));

// Health check
app.get("/health", (req, res) => res.send("API Gateway running"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));