const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('./src/config/db'); // Connect to MongoDB
const reviewRoutes = require('./src/routes/reviewRoutes'); // Import routes

dotenv.config(); // Load environment variables

const app = express();

app.use(express.json()); // Allows JSON data in requests
//app.use(cors()); // Enable CORS for frontend
app.use(cors({ origin: "http://localhost:5173" }));

// Routes
app.use('/api/reviews', reviewRoutes); // Base URL for reviews API

// Start Server
const PORT = process.env.PORT || 5040;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
