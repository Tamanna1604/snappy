const express = require("express");
const router = express.Router();
const {
  getMessages,
  addMessage,
  getTopFriends,
  getAnonymousChatForSender,
  getAnonymousInboxForReceiver,
  revealIdentity,
  requestIdentityRevelation,
  stopReceivingMessages,
  getRevealedSenderInfo,
} = require("../controllers/messageController");
const { typingStart, typingStop } = require("../controllers/typingController");

// ✅ Logging middleware
router.use((req, res, next) => {
  console.log(`Messages API: ${req.method} ${req.url}`);
  next();
});

// ✅ Add Message
router.post("/addmsg", addMessage);

// ✅ Get Messages
router.post("/getmsg", getMessages);

// ✅ Typing Indicators
router.post("/typing-start", typingStart);
router.post("/typing-stop", typingStop);

router.get("/top-friends/:userId", getTopFriends);

// Route for the sender to get their anonymous chat history with a specific user
router.post("/get-anonymous-chat/", getAnonymousChatForSender);

// Route for the receiver to get their entire anonymous inbox
router.get("/anonymous-inbox/:id", getAnonymousInboxForReceiver);

// Routes for anonymous message control
router.post("/request-identity-revelation/", requestIdentityRevelation);
router.post("/reveal-identity/", revealIdentity);
router.post("/stop-receiving/", stopReceivingMessages);
router.get("/revealed-sender-info/:messageId", getRevealedSenderInfo);

module.exports = router;
