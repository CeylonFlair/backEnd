import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import threadRoutes from './routes/threadRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/threads', threadRoutes);
app.use('/api/messages', messageRoutes);

app.use(errorHandler);

export default app;