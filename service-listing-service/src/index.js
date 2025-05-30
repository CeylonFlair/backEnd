import app from './app.js';

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Service Listing Service running on port ${PORT}`);
});