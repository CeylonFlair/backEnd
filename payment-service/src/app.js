import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
// PayHere IPN requires urlencoded form
app.use('/api/payments/ipn', express.urlencoded({ extended: false }));

app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

export default app;