const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

// Updated CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://snappy-frontend-1.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(null, true); // Temporarily allow all origins
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log(err.message);
  });

// Root route handler
app.get("/", (_req, res) => {
  res.json({ 
    message: "Welcome to Snappy Chat API",
    status: "active",
    endpoints: {
      auth: "/api/auth",
      messages: "/api/messages",
      health: "/ping"
    }
  });
});

// Health check route
app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} Not Found` });
});

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Create HTTP server with proper timeout settings
const server = require('http').createServer(app);

// Configure server timeouts
server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds

// Start server listening on all network interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO configuration
const io = socket(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      if (data.isAnonymous) {
        // For anonymous messages, send the whole data object
        // This includes 'from' so the recipient client can manage notifications
        socket.to(sendUserSocket).emit("msg-recieve", data);
      } else {
        // For regular messages, send only the message text to maintain original functionality
        socket.to(sendUserSocket).emit("msg-recieve", {
          msg: data.msg,
          from: data.from,
        });
      }
    }
  });
});
