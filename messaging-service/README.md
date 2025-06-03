# Messaging/Chat Service

The Messaging/Chat Service enables users to send and receive messages in real time within your application. It provides both REST APIs and WebSocket (Socket.IO) endpoints for messaging, supporting text, images, and files. All files are securely uploaded to Cloudinary. The service manages chat threads and message history in MongoDB, and all operations require JWT authentication for security. This allows users to chat, share files, and see message updates instantly, similar to modern chat apps.

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