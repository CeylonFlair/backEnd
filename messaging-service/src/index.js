import app from './app.js';
import http from 'http';
import setupSocket from './socket/index.js';

// const PORT = process.env.PORT || 5004;
const PORT =  5004;

const server = http.createServer(app);

setupSocket(server);

server.listen(PORT, () => {
  console.log(`Messaging Service running on port ${PORT}`);
});