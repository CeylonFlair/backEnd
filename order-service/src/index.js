import app from './app.js';

// const PORT = process.env.PORT || 5003;
const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});