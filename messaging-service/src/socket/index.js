import { Server } from "socket.io";
import Thread from "../models/Thread.js";
import Message from "../models/Message.js";
import { socketAuth } from "../middlewares/authMiddleware.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://ceylonflair-frontend-56c8eda4af29.herokuapp.com",
      ],
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    
    const userId = socket.user.id;
    console.log(`User connected: ${userId}`);

    // Join all user's threads
    Thread.find({ participants: userId }).then((threads) => {
      threads.forEach((thread) => {
        socket.join(thread._id.toString());
      });
    });

    // Send message
    socket.on("send-message", async (data, cb) => {
      try {
        const { threadId, content, type, file } = data;
        let fileUrl, fileName;
        if (type === "image" || type === "file") {
          if (!file || !file.buffer || !file.fileName)
            return cb({ error: "No file data" });
          const buf = Buffer.from(file.buffer, "base64");
          const result = await uploadToCloudinary(buf, file.fileName);
          fileUrl = result.secure_url;
          fileName = file.fileName;
        }
        const message = await Message.create({
          thread: threadId,
          sender: userId,
          content: type === "text" ? content : undefined,
          type,
          fileUrl,
          fileName,
          readBy: [userId],
        });
        await Thread.findByIdAndUpdate(threadId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });
        io.to(threadId).emit("new-message", message);
        cb && cb({ success: true, message });
      } catch (err) {
        cb && cb({ error: err.message });
      }
    });

    // Mark as read
    socket.on("mark-read", async ({ threadId }) => {
      await Message.updateMany(
        { thread: threadId, readBy: { $ne: userId } },
        { $push: { readBy: userId } }
      );
    });

    // Typing indicator (optional)
    socket.on("typing", ({ threadId }) => {
      socket.to(threadId).emit("typing", { userId });
    });
  });

  return io;
};

export default setupSocket;
