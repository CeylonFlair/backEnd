import mongoose from 'mongoose'; 
import dotenv from 'dotenv';

dotenv.config(); // to load environment variables

const uri = process.env.MONGO_URI; 

if (!uri) {
    console.error("MongoDB URI is not defined. Check your .env file.");
    process.exit(1);
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

export default mongoose;
