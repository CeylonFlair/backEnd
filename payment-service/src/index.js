import app from './app.js';

const PORT = 5006;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});