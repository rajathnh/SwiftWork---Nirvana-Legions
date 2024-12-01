require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// Packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const { Server } = require('socket.io');
const http = require('http');

// Middleware imports
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// Create server
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true
};

// Middleware Configuration
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// Rate limiting
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// Socket.IO Configuration
const io = new Server(server, {
  cors: corsOptions
});

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Static file serving
app.use(express.static("./public"));

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  abortOnLimit: true,
  debug: process.env.NODE_ENV === 'development'
}));

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
const routes = [
  { path: '/api/v1/auth', router: require('./routes/authRoutes') },
  { path: '/api/v1/freelancer', router: require('./routes/freelancerRoutes') },
  { path: '/api/v1/client', router: require('./routes/clientRoutes') },
  { path: '/api/v1/review', router: require('./routes/reviewRoutes') },
  { path: '/api/v1/gigs', router: require('./routes/gigRoutes') },
  { path: '/api/v1/proposal', router: require('./routes/proposalRoutes') },
  { path: '/api/v1/messages', router: require('./routes/messageRoutes') }
];

routes.forEach(route => app.use(route.path, route.router));

// Middleware for handling not found and errors
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Database and Server Initialization
const connectDB = require('./db/connect');
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

start();