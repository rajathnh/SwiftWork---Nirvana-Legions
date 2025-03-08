require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

// Packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");
const Message = require("./models/Message");
// Middleware imports
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

// Create server
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  credentials: true,
};
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware Configuration
app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow Google Fonts stylesheets
        fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow Google Fonts files
        imgSrc: ["'self'", "https://res.cloudinary.com", "data:"],
        connectSrc: ["'self'", "http://localhost:5000"], // Allow API calls to your backend
      },
    },
  })
);


app.use(xss());
app.use(mongoSanitize());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// Rate limiting
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
  })
);

// Socket.IO Configuration
const io = new Server(server, {
  cors: corsOptions,
});

const offers= [];
const connectedSockets = []

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Static file serving
app.use(express.static(path.join(__dirname, "public")));

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    abortOnLimit: true,
    debug: process.env.NODE_ENV === "development",
  })
);

// Logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/v1/auth/register/freelancer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Adjust the path as necessary
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serving index.html as the landing page
});

// Routes
const routes = [
  { path: '/api/v1/auth', router: require('./routes/authRoutes') },
  { path: '/api/v1/freelancer', router: require('./routes/freelancerRoutes') },
  { path: '/api/v1/client', router: require('./routes/clientRoutes') },
  { path: '/api/v1/review', router: require('./routes/reviewRoutes') },
  { path: '/api/v1/gigs', router: require('./routes/gigRoutes') },
  { path: '/api/v1/proposal', router: require('./routes/proposalRoutes') },
  { path: '/api/v1/chat', router: require('./routes/messageRoutes') },
  { path: '/api/v1/payment',router:require('./routes/paymentRoutes')},
  { path: '/api/v1/admin', router:require('./routes/adminRoutes')},
  { path: '/api/v1/test', router:require('./routes/quizRoutes')},
  { path: '/api/v1/notification', router:require('./routes/notificationRoutes')},
  { path: '/api/v1/predict', router:require('./routes/predict')},
  { path: '/api/v1/escrow', router:require('./routes/escrowRoutes')}
];

routes.forEach((route) => app.use(route.path, route.router));

// Middleware for handling not found and errors
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Socket.IO Connection Handling

// ✅ Messaging Feature
const handleMessaging = (socket, io) => {
    console.log("A user connected for messaging");

    socket.on("joinRoom", async (gigId) => {
        socket.join(gigId);
        console.log(`User joined room ${gigId}`);

        const messages = await Message.find({ gigId }).sort({ timestamp: 1 }).limit(50);
        socket.emit("chatHistory", messages);
    });

    socket.on("sendMessage", async (messageData) => {
        if (!messageData.senderId) {
            console.error("Sender ID is required.");
            return;
        }

        const message = new Message({
            text: messageData.text,
            sender: messageData.senderId,
            senderType: messageData.senderType,
            timestamp: new Date().toISOString(),
            gigId: messageData.gigId,
            attachments: messageData.attachments || [],
        });

        try {
            await message.save();
            io.to(messageData.gigId).emit("receiveMessage", message);
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });
};
const activeRooms = {};

// ✅ WebRTC Feature
const handleWebRTC = (socket, io) => {
  console.log("A user connected to WebRTC");

  socket.on("join-room", async (gigId) => {
      const usersInRoom = activeRooms[gigId] || [];

      if (usersInRoom.length === 0) {
          // ✅ First user → Offerer
          activeRooms[gigId] = [socket.id];
          console.log(`User ${socket.id} is the offerer for room ${gigId}`);
          socket.emit("offerer-ready");
      } else if (usersInRoom.length === 1) {
          // ✅ Second user → Answerer
          activeRooms[gigId].push(socket.id);
          console.log(`User ${socket.id} is the answerer for room ${gigId}`);

          // Notify the offerer to send the offer
          io.to(activeRooms[gigId][0]).emit("start-offer");
      } else {
          console.log(`Room ${gigId} is full!`);
          socket.emit("room-full");
      }
  });

  socket.on("offer", ({ gigId, offer }) => {
      const room = activeRooms[gigId];
      if (room && room.length > 1) {
          io.to(room[1]).emit("offer", { offer });
      }
  });

  socket.on("answer", ({ gigId, answer }) => {
      const room = activeRooms[gigId];
      if (room && room.length > 1) {
          io.to(room[0]).emit("answer", { answer });
      }
  });

  socket.on("ice-candidate", ({ gigId, candidate }) => {
      const room = activeRooms[gigId];
      if (room) {
          io.to(room[0]).emit("ice-candidate", { candidate });
          io.to(room[1]).emit("ice-candidate", { candidate });
      }
  });
};

// ✅ Main Socket.IO Connection
io.on("connection", (socket) => {
    handleMessaging(socket, io);  
    handleWebRTC(socket, io);     

    socket.on("disconnect", () => {
        console.log("A user disconnected");

        // ✅ Remove from connectedSockets
        const index = connectedSockets.findIndex(s => s.socketId === socket.id);
        if (index !== -1) {
            connectedSockets.splice(index, 1);
        }

        // ✅ Remove from activeRooms
        for (const gigId in activeRooms) {
            activeRooms[gigId] = activeRooms[gigId].filter(id => id !== socket.id);

            // Delete room if empty
            if (activeRooms[gigId].length === 0) {
                delete activeRooms[gigId];
            }
        }
    });
});


// Database and Server Initialization
const connectDB = require("./db/connect");
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

start();
