const { addMessage, getMessages, getTopFriends } = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.get("/top-friends/:userId", getTopFriends);

module.exports = router;
