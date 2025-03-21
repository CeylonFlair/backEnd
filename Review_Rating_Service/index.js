import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './src/config/db.js';
import reviewRoutes from './src/routes/reviewRoutes.js';

dotenv.config(); // load environment variables

const app = express();
app.use(express.json()); // allows JSON data in requests

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT ;

// Enable CORS for frontend //app.use(cors()); 
app.use(cors({ origin: FRONTEND_URL })); // app.use(cors({ origin: "http://localhost:5173" }));

// Routes
app.use('/api/reviews', reviewRoutes); // base URL for reviews API

// Start Server
// const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
