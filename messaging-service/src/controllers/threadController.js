import Thread from "../models/Thread.js";
import Message from "../models/Message.js";
import { checkParticipantsExist } from "../utils/userService.js";

// Get all threads for a user
export const getThreads = async (req, res, next) => {
  try {
    const threads = await Thread.find({ participants: req.user.id })
      .populate("participants", "id name profilePicture")
      .populate({
        path: "lastMessage",
        select: "content type fileUrl createdAt",
      })
      .sort("-updatedAt");
    res.json(threads);
  } catch (err) {
    next(err);
  }
};

// Get a specific thread's messages
export const getThreadMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const thread = await Thread.findById(id);
    if (!thread || !thread.participants.includes(req.user.id)) {
      return res.status(404).json({ message: "Thread not found" });
    }
    const messages = await Message.find({ thread: id }).sort("createdAt");
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const createThread = async (req, res, next) => {
  try {
    const { participantIds } = req.body;
    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length < 2
    ) {
      return res
        .status(400)
        .json({ message: "At least two participants required" });
    }

    const token = req.headers.authorization?.split(" ")[1];

    const allExist = await checkParticipantsExist(participantIds, token,);
    if (!allExist) {
      return res
        .status(400)
        .json({ message: "One or more participants do not exist" });
    }

    const thread = await Thread.create({ participants: participantIds });
    res.status(201).json(thread);
  } catch (err) {
    next(err);
  }
};
