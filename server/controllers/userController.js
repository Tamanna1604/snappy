const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    
    // Get the onlineUsers map from the app
    const onlineUsers = req.app.get('onlineUsers') || new Map();
    
    
    
    // Update the isOnline status based on actual socket connections
    const usersWithOnlineStatus = users.map(user => {
      const isOnline = onlineUsers.has(user._id.toString());
      
      return {
        ...user.toObject(),
        isOnline: isOnline
      };
    });
    
    return res.json(usersWithOnlineStatus);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    
    
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    if (!avatarImage) {
      return res.status(400).json({ error: "Avatar image is required" });
    }
    
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("Avatar set successfully for user:", userId);
    
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    console.error("Error in setAvatar:", ex);
    next(ex);
  }
};

module.exports.logOut = async (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    
    // Get the onlineUsers map from the app
    const onlineUsers = req.app.get('onlineUsers') || new Map();
    
    // Remove from online users map
    onlineUsers.delete(req.params.id);
    
    // Update user's offline status in database
    try {
      await User.findByIdAndUpdate(req.params.id, {
        isOnline: false
      });
    } catch (error) {
      console.error("Error updating user offline status:", error);
    }
    
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};

module.exports.getUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select([
      "username",
      "isOnline",
      "_id",
    ]);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    return res.json({
      userId: user._id,
      username: user.username,
      isOnline: user.isOnline,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getContacts = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Find all messages where the current user is involved (either as sender or receiver)
    const Messages = require("../models/messageModel");
    const messages = await Messages.find({
      users: userId
    });
    
    // Extract unique user IDs from messages (excluding the current user)
    const contactIds = new Set();
    messages.forEach(message => {
      message.users.forEach(userIdInMessage => {
        if (userIdInMessage.toString() !== userId) {
          contactIds.add(userIdInMessage.toString());
        }
      });
    });
    
    // Get user details for contacts
    const contacts = await User.find({
      _id: { $in: Array.from(contactIds) }
    }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    
    // Get the onlineUsers map from the app
    const onlineUsers = req.app.get('onlineUsers') || new Map();
    
    // Update the isOnline status based on actual socket connections
    const contactsWithOnlineStatus = contacts.map(user => ({
      ...user.toObject(),
      isOnline: onlineUsers.has(user._id.toString())
    }));
    
    return res.json(contactsWithOnlineStatus);
  } catch (ex) {
    next(ex);
  }
};
