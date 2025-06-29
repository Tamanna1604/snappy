const Messages = require("../models/messageModel");
const User = require("../models/userModel");
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
        id: msg._id.toString(),
        identityRevealed: Boolean(msg.identityRevealed),
        identityRevealRequested: Boolean(msg.identityRevealRequested),
        receivingStopped: Boolean(msg.receivingStopped),
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
    
    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID format" });
    }

    const messages = await Messages.find({
      users: userId, // Messages involving this user
      sender: { $ne: userId }, // But NOT sent by this user (only received)
      isAnonymous: true,
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        message: msg.message.text,
        timestamp: msg.createdAt,
        id: msg._id.toString(),
        identityRevealed: Boolean(msg.identityRevealed),
        identityRevealRequested: Boolean(msg.identityRevealRequested),
      };
    });
    
    res.json(projectedMessages);
  } catch (ex) {
    console.error("Error in getAnonymousInboxForReceiver:", ex);
    res.status(500).json({ msg: "Internal server error", error: ex.message });
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, isAnonymous } = req.body;
    
    // If this is an anonymous message, check if the receiver has stopped receiving messages from this sender
    if (isAnonymous) {
      const existingMessage = await Messages.findOne({
        sender: from,
        users: { $all: [from, to] },
        isAnonymous: true,
        receivingStopped: true
      });
      
      if (existingMessage) {
        return res.status(403).json({ 
          msg: "This user has stopped receiving anonymous messages from you.",
          error: "MESSAGES_BLOCKED"
        });
      }
    }
    
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
    

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      
      return res.status(400).json({ msg: "Invalid user ID format" });
    }
    const objectId = mongoose.Types.ObjectId(userId.trim());
    

    
    // Stage 1: Find all messages involving the current user (both regular and anonymous)
    const stage1_match = { $match: { users: objectId } };
    const messagesInvolvingUser = await Messages.aggregate([stage1_match]);
    
    if (messagesInvolvingUser.length === 0) {
       
        return res.json([]);
    }

    // Stage 2 & 3: Unwind and filter out the current user
    const stage2_unwind = { $unwind: "$users" };
    const stage3_match_other_users = { $match: { users: { $ne: objectId } } };
    const otherUsersInvolved = await Messages.aggregate([stage1_match, stage2_unwind, stage3_match_other_users]);
    
    if (otherUsersInvolved.length === 0) {
        console.log(`[getTopFriends] NOTE: Found messages for the user, but could not isolate other users in the conversations.`);
        return res.json([]);
    }

    // Stage 4: Group by other users and count messages
    const stage4_group = { $group: { _id: "$users", messageCount: { $sum: 1 } } };
    const groupedByUser = await Messages.aggregate([stage1_match, stage2_unwind, stage3_match_other_users, stage4_group]);
    
    // --- Original Full Pipeline (for final result) ---
    const fullPipeline = [
      stage1_match, stage2_unwind, stage3_match_other_users, stage4_group,
      { $sort: { messageCount: -1 } },
      { $limit: 3 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "friendInfo" } },
      { $unwind: "$friendInfo" },
      { $project: { _id: 1, username: "$friendInfo.username", avatarImage: "$friendInfo.avatarImage", messageCount: 1 } },
    ];

    const messageCounts = await Messages.aggregate(fullPipeline);

    res.json(messageCounts);

  } catch (ex) {
    console.error("[getTopFriends] Error:", ex);
    res.status(500).json({ msg: "Internal server error", error: ex.message });
  }
};

// Function to request identity revelation (called by receiver)
module.exports.requestIdentityRevelation = async (req, res, next) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ msg: "Message ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ msg: "Invalid message ID format" });
    }

    // Update the message to set the request flag
    const message = await Messages.findByIdAndUpdate(
      messageId,
      { identityRevealRequested: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    res.json({ msg: "Identity revelation requested successfully" });
  } catch (ex) {
    console.error("Error in requestIdentityRevelation:", ex);
    next(ex);
  }
};

// Function to reveal sender's identity (called by sender)
module.exports.revealIdentity = async (req, res, next) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ msg: "Message ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ msg: "Invalid message ID format" });
    }

    // Update the message to reveal identity
    const message = await Messages.findByIdAndUpdate(
      messageId,
      { identityRevealed: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // Get sender info separately to avoid populate issues
    const sender = await User.findById(message.sender).select('username avatarImage');
    
    if (!sender) {
      return res.status(404).json({ msg: "Sender not found" });
    }

    res.json({ 
      msg: "Identity revealed successfully",
      senderUsername: sender.username,
      senderAvatar: sender.avatarImage
    });
  } catch (ex) {
    console.error("Error in revealIdentity:", ex);
    res.status(500).json({ msg: "Internal server error", error: ex.message });
  }
};

// Function to stop receiving messages from a specific sender
module.exports.stopReceivingMessages = async (req, res, next) => {
  try {
    const { messageId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ msg: "Message ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ msg: "Invalid message ID format" });
    }
    
    // Find the message to get sender info
    const message = await Messages.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // Update all anonymous messages from this sender to this receiver
    const result = await Messages.updateMany(
      {
        sender: message.sender,
        users: { $all: [message.sender, message.users.find(u => u.toString() !== message.sender.toString())] },
        isAnonymous: true,
      },
      { receivingStopped: true }
    );

    // Emit socket event to notify the sender that messages have been blocked
    try {
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      const senderSocketId = onlineUsers.get(message.sender.toString());
      
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages-blocked', {
          receiverId: message.users.find(u => u.toString() !== message.sender.toString()),
          message: 'This user has stopped receiving anonymous messages from you.'
        });
      }
    } catch (socketError) {
      console.error('Error emitting socket event:', socketError);
    }

    res.json({ msg: "Messages stopped successfully" });
  } catch (ex) {
    console.error("Error in stopReceivingMessages:", ex);
    next(ex);
  }
};

// Function to get revealed sender information
module.exports.getRevealedSenderInfo = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    
    if (!messageId) {
      return res.status(400).json({ msg: "Message ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ msg: "Invalid message ID format" });
    }

    const message = await Messages.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (!message.identityRevealed) {
      return res.status(403).json({ msg: "Identity not revealed" });
    }

    // Get sender info separately to avoid populate issues
    const sender = await User.findById(message.sender).select('username avatarImage');

    if (!sender) {
      return res.status(404).json({ msg: "Sender not found" });
    }

    res.json({
      senderUsername: sender.username,
      senderAvatar: sender.avatarImage
    });
  } catch (ex) {
    console.error("Error in getRevealedSenderInfo:", ex);
    res.status(500).json({ msg: "Internal server error", error: ex.message });
  }
};
