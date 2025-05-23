import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';

dotenv.config(); //configure the env 

//initialize express app
const app = express();

//connect database
connectDB();

//middleware
app.use(cors());
app.use(express.json());

//routes
app.get('/', (req,res) => {
    res.send('Server is running successfully!');
});

// const PORT = process.env.PORT || 5000;
// dotenv.config(); //configure the env 
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
