# Messaging/Chat Service

Microservice for real-time chat between users (customers and providers) with file/image upload support via Cloudinary.

## Features

- Real-time messaging (Socket.IO)
- RESTful endpoints for inbox and message history
- File/image upload to Cloudinary (via REST or Socket.IO)
- JWT-protected HTTP and WebSocket
- MongoDB for threads and messages

## REST Endpoints

- `GET /api/threads` — Get all my threads/conversations
- `GET /api/threads/:id/messages` — Get messages in a thread
- `POST /api/messages` — Send a message (multipart/form-data for files)

## WebSocket Events

- Connect with `{ auth: { token: <JWT> } }`
- `send-message` — Send message (supports file/image as base64)
- `new-message` — Receive new message in real time
- `mark-read` — Mark all messages in a thread as read
- `typing` — Typing indicator

## File Upload

- Images/files are uploaded directly to Cloudinary.
- For HTTP: send `file` as multipart field.
- For Socket.IO: send `{ file: { buffer: <base64>, fileName: "..." } }`.

## .env Example

```
PORT=5004
MONGO_URI=mongodb://localhost:27017/messaging-service
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```