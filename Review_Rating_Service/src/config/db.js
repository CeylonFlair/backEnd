const mongoose = require('mongoose');
const dotenv = require('dotenv');

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         process.exit(1);
//     }
// };
// connectDB();
// module.exports = mongoose;

dotenv.config(); // to load environment variables

const uri = process.env.MONGO_URI; 

if (!uri) {
    console.error("MongoDB URI is not defined. Check your .env file.");
    process.exit(1);
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

module.exports = mongoose;
