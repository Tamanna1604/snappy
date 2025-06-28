const {
  login,
  register,
  getAllUsers,
  getContacts,
  setAvatar,
  logOut,
  getUserStatus,
} = require("../controllers/userController");

const express = require("express");
const router = express.Router();

// ✅ Logging middleware (helps debug API calls)
router.use((req, res, next) => {
  next();
});

// ✅ Login Route
router.post("/login", login);

// ✅ Register Route
router.post("/register", register);

// ✅ Get All Users
router.get("/allusers/:id", getAllUsers);

// ✅ Get Contacts (users the current user has messaged)
router.get("/contacts/:id", getContacts);

// ✅ Get User Status
router.get("/status/:userId", getUserStatus);

// ✅ Set Avatar (POST)
router.post("/setavatar/:id", setAvatar);

// ✅ Logout Route
router.get("/logout/:id", logOut);

module.exports = router;
