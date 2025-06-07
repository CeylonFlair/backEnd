import http from "http";
import app from "./app.js"; // Adjust the path as necessary
import setupSocket from "./messaging-service/src/socket/index.js";

// Create HTTP server
const server = http.createServer(app);
const io = setupSocket(server);

// Attach io to app for access in controllers
app.set("io", io);

// ...existing code for your server (like middleware, routes, etc.)...

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
