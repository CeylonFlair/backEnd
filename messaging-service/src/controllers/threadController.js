import Thread from "../models/Thread.js";
import Message from "../models/Message.js";
import { checkParticipantsExist, getUserById } from "../utils/userService.js";

// Get all threads for a user
export const getThreads = async (req, res, next) => {
  try {
    const threads = await Thread.find({ participants: req.user.id })
      .populate({
        path: "lastMessage",
        select: "content type fileUrl createdAt",
      })
      .sort("-updatedAt");

    // Collect all unique participant IDs
    const userIds = new Set();
    threads.forEach((thread) => {
      thread.participants.forEach((id) => userIds.add(id.toString()));
    });

    // Fetch user info from user service
    const token = req.headers.authorization?.split(" ")[1];
    const userMap = {};
    await Promise.all(
      Array.from(userIds).map(async (userId) => {
        try {
          const user = await getUserById(userId, token);
          userMap[userId] = {
            id: userId,
            name: user.name,
            profilePicture: user.profilePicture || null,
          };
        } catch {
          userMap[userId] = {
            id: userId,
            name: null,
            profilePicture: null,
          };
        }
      })
    );

    // Attach user info to each thread's participants
    const threadsWithUserInfo = threads.map((thread) => ({
      ...thread.toObject(),
      participants: thread.participants.map(
        (id) =>
          userMap[id.toString()] || {
            id: id.toString(),
            name: null,
            profilePicture: null,
          }
      ),
    }));

    res.json(threadsWithUserInfo);
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

    const allExist = await checkParticipantsExist(participantIds, token);
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
