const {
  getMessages,
  addMessage,
  getTopFriends,
  getAnonymousChatForSender,
  getAnonymousInboxForReceiver,
} = require("../controllers/messageController");
const router = require("express").Router();

router.post("/getmsg/", getMessages);
router.post("/addmsg/", addMessage);
router.get("/top-friends/:userId", getTopFriends);

// Route for the sender to get their anonymous chat history with a specific user
router.post("/get-anonymous-chat/", getAnonymousChatForSender);

// Route for the receiver to get their entire anonymous inbox
router.get("/anonymous-inbox/:id", getAnonymousInboxForReceiver);

module.exports = router;
