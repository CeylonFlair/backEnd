import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/reviews', reviewRoutes);

app.use(errorHandler);

export default app;