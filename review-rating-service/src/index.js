import app from "./app.js";

// const PORT = process.env.PORT || 5005;
const PORT = 5005;

app.listen(PORT, () => {
  console.log(`Review Rating Service running on port ${PORT}`);
});
