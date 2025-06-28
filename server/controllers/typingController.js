const User = require("../models/userModel");

// Middleware to validate user authentication
const validateUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware to validate recipient
const validateRecipient = async (req, res, next) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }
    
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }
    
    req.recipient = recipient;
    next();
  } catch (error) {
    console.error("Error validating recipient:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Rate limiting for typing events
const typingRateLimit = new Map();

const checkRateLimit = (userId, eventType) => {
  const key = `${userId}-${eventType}`;
  const now = Date.now();
  const lastEvent = typingRateLimit.get(key);
  
  // Allow max 10 typing events per minute
  if (lastEvent && (now - lastEvent) < 6000) {
    return false;
  }
  
  typingRateLimit.set(key, now);
  return true;
};

module.exports.typingStart = [
  validateUser,
  validateRecipient,
  async (req, res) => {
    try {
      const { userId, to } = req.body;
      
      // Check rate limiting
      if (!checkRateLimit(userId, 'typing-start')) {
        return res.status(429).json({ error: "Too many typing events" });
      }
      
      // Get socket instance from global scope
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      const typingUsers = req.app.get('typingUsers');
      
      if (!io || !onlineUsers || !typingUsers) {
        return res.status(500).json({ error: "Socket server not available" });
      }
      
      const recipientSocket = onlineUsers.get(to);
      
      if (recipientSocket) {
        // Store typing state with timeout
        const typingKey = `${userId}-${to}`;
        const timeoutId = setTimeout(() => {
          // Auto-clear typing indicator after 3 seconds
          io.to(recipientSocket).emit("typing-stop", { from: userId });
          typingUsers.delete(typingKey);
        }, 3000);
        
        typingUsers.set(typingKey, timeoutId);
        
        // Send typing indicator to recipient
        io.to(recipientSocket).emit("typing-start", { from: userId });
        
        console.log(`User ${userId} started typing to ${to}`);
      }
      
      res.json({ success: true, message: "Typing indicator sent" });
      
    } catch (error) {
      console.error("Error in typingStart:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
];

module.exports.typingStop = [
  validateUser,
  validateRecipient,
  async (req, res) => {
    try {
      const { userId, to } = req.body;
      
      // Check rate limiting
      if (!checkRateLimit(userId, 'typing-stop')) {
        return res.status(429).json({ error: "Too many typing events" });
      }
      
      // Get socket instance from global scope
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      const typingUsers = req.app.get('typingUsers');
      
      if (!io || !onlineUsers || !typingUsers) {
        return res.status(500).json({ error: "Socket server not available" });
      }
      
      const recipientSocket = onlineUsers.get(to);
      
      if (recipientSocket) {
        // Clear typing timeout
        const typingKey = `${userId}-${to}`;
        const timeoutId = typingUsers.get(typingKey);
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          typingUsers.delete(typingKey);
        }
        
        // Send stop typing indicator to recipient
        io.to(recipientSocket).emit("typing-stop", { from: userId });
        
        console.log(`User ${userId} stopped typing to ${to}`);
      }
      
      res.json({ success: true, message: "Typing indicator stopped" });
      
    } catch (error) {
      console.error("Error in typingStop:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
]; 