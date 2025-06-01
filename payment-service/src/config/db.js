import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.PAYMENT_MONGO_URI || process.env.MONGO_URI;


const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
    });
    console.log('MongoDB connected (Payment Service)');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;