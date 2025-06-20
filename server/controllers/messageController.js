const Messages = require("../models/messageModel");
const mongoose = require("mongoose");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
      isAnonymous: false, // Ensure we only get regular messages
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

// This function is for the SENDER.
// It gets the anonymous messages sent BY the current user TO a specific recipient.
// Each person has their own separate anonymous chat history.
module.exports.getAnonymousChatForSender = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    
    // Only get messages sent BY the current user TO the recipient
    const messages = await Messages.find({
      sender: from, // Messages sent by the current user
      users: { $all: [from, to] }, // Between these two users
      isAnonymous: true,
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: true, // Since we're only getting messages sent by the current user
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

// This function is for the RECEIVER.
// It gets all anonymous messages sent TO the current user,
// but it does not reveal who the sender is.
module.exports.getAnonymousInboxForReceiver = async (req, res, next) => {
  try {
    // We get the user's ID from the request parameters
    const userId = req.params.id;
    const messages = await Messages.find({
      users: userId, // Messages involving this user
      sender: { $ne: userId }, // But NOT sent by this user (only received)
      isAnonymous: true,
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      // Note: We are intentionally NOT including sender info.
      return {
        message: msg.message.text,
        timestamp: msg.createdAt, // It's useful to know when it was sent
        id: msg._id,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, isAnonymous } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      isAnonymous: isAnonymous || false,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getTopFriends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    console.log(`[getTopFriends] Received request for userId: "${userId}"`);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`[getTopFriends] Invalid userId format: ${userId}`);
      return res.status(400).json({ msg: "Invalid user ID format" });
    }
    const objectId = mongoose.Types.ObjectId(userId.trim());
    console.log(`[getTopFriends] Converted to ObjectId:`, objectId);

    // --- Deep Dive Debugging ---
    
    // Stage 1: Find all messages involving the current user
    const stage1_match = { $match: { users: objectId } };
    const messagesInvolvingUser = await Messages.aggregate([stage1_match]);
    console.log(`[getTopFriends] Stage 1 Result (messages involving user): Found ${messagesInvolvingUser.length} messages.`);
    if (messagesInvolvingUser.length === 0) {
        console.log(`[getTopFriends] NOTE: No messages found for this user. If you recently fixed the message schema, you may need to send new messages for them to be counted.`);
        return res.json([]);
    }

    // Stage 2 & 3: Unwind and filter out the current user
    const stage2_unwind = { $unwind: "$users" };
    const stage3_match_other_users = { $match: { users: { $ne: objectId } } };
    const otherUsersInvolved = await Messages.aggregate([stage1_match, stage2_unwind, stage3_match_other_users]);
    console.log(`[getTopFriends] Stage 3 Result (other users in conversations): Found ${otherUsersInvolved.length} instances.`);
    if (otherUsersInvolved.length === 0) {
        console.log(`[getTopFriends] NOTE: Found messages for the user, but could not isolate other users in the conversations.`);
        return res.json([]);
    }

    // Stage 4: Group by other users and count messages
    const stage4_group = { $group: { _id: "$users", messageCount: { $sum: 1 } } };
    const groupedByUser = await Messages.aggregate([stage1_match, stage2_unwind, stage3_match_other_users, stage4_group]);
    console.log(`[getTopFriends] Stage 4 Result (grouped by friend): Found ${groupedByUser.length} unique friends.`);
    console.log(`[getTopFriends] Grouped data:`, JSON.stringify(groupedByUser, null, 2));

    // --- Original Full Pipeline (for final result) ---
    const fullPipeline = [
      stage1_match, stage2_unwind, stage3_match_other_users, stage4_group,
      { $sort: { messageCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "friendInfo" } },
      { $unwind: "$friendInfo" },
      { $project: { _id: 1, username: "$friendInfo.username", avatarImage: "$friendInfo.avatarImage", messageCount: 1 } },
    ];

    const messageCounts = await Messages.aggregate(fullPipeline);

    console.log(`[getTopFriends] Final Aggregation Result for ${userId}:`, JSON.stringify(messageCounts, null, 2));
    res.json(messageCounts);

  } catch (ex) {
    console.error("[getTopFriends] Error:", ex);
    next(ex);
  }
};
