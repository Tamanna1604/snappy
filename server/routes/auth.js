const {
  login,
  register,
  getAllUsers,
  setAvatar,
  logOut,
} = require("../controllers/userController");

const express = require("express");
const router = express.Router();

// ✅ Logging middleware (helps debug API calls)
router.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// ✅ Login Route
router.post("/login", login);

// ✅ Register Route
router.post("/register", register);

// ✅ Get All Users
router.get("/allusers/:id", getAllUsers);

// ✅ Set Avatar (POST)
router.post("/setavatar/:id", setAvatar);

// ✅ Logout Route
router.get("/logout/:id", logOut);

module.exports = router;
