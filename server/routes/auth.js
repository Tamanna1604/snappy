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
router.post("/setavatar/:id", async (req, res, next) => {
  console.log("Set Avatar API called for User ID:", req.params.id);
  console.log("Request Body:", req.body);

  if (!req.body.image) {
    return res.status(400).json({ error: "Image is required" });
  }
  next();
}, setAvatar);

// ✅ Logout Route
router.get("/logout/:id", logOut);

module.exports = router;
