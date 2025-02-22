
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const socket = require("socket.io");
const http = require("http");
const axios = require("axios");

// Import Routes
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

dotenv.config(); 

// Initialize Express App
const app = express();
const server = http.createServer(app); 

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, 
  })
);

// Database Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.error("Database Connection Error:", err.message));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Proxy Route for Avatars (Fixes 403 Error)
app.get("/api/avatar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const avatarUrl = `https://api.multiavatar.com/${id}.svg`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(response.data);
  } catch (error) {
    console.error("Avatar Fetch Error:", error.message);
    res.status(500).json({ error: "Failed to fetch avatar" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Socket.io Setup
const io = socket(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

// Store Online Users
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Add User to Online Users
  socket.on("add-user", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} added to online users.`);
    }
  });

  // Handle Sending Messages
  socket.on("send-msg", ({ from, to, msg }) => {
    const sendUserSocket = onlineUsers.get(to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", { from, msg });
      console.log(`Message sent from ${from} to ${to}`);
    } else {
      console.log(`User ${to} is offline, message not delivered.`);
    }
  });

  // Handle Disconnection
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);

    // Remove user from onlineUsers map
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} removed from online users.`);
        break; // Exit loop early for efficiency
      }
    }
  });
});

// Global Error Handling (Prevents Crashes)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:", reason);
});
