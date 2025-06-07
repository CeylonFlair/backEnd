import Thread from "../models/Thread.js";
import Message from "../models/Message.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Send a message (REST, not real-time)
export const sendMessage = async (req, res, next) => {
  try {
    const { threadId, content, type } = req.body;
    let fileUrl, fileName;
    if (type === "image" || type === "file") {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });
      let uploadName = req.file.originalname;
      if (type === "image") {
        // Remove extension for images to avoid double extension
        uploadName = req.file.originalname.replace(/\.[^/.]+$/, "");
      }
      const result = await uploadToCloudinary(req.file.buffer, uploadName);
      fileUrl = result.secure_url;
      fileName = req.file.originalname;
    }
    const message = await Message.create({
      thread: threadId,
      sender: req.user.id,
      content: type === "text" ? content : undefined,
      type,
      fileUrl,
      fileName,
      readBy: [req.user.id],
    });
    await Thread.findByIdAndUpdate(threadId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    // Emit socket event after message is stored
    const io = req.app.get("io");
    if (io) {
      io.to(threadId).emit("newMessage", {
        _id: message._id,
        thread: threadId,
        sender: req.user.id,
        content: message.content,
        type: message.type,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        createdAt: message.createdAt,
        readBy: message.readBy,
      });
    }

    res
      .status(201)
      .json({ message: "Message sent successfully", sender: req.user.id });
  } catch (err) {
    next(err);
  }
};
