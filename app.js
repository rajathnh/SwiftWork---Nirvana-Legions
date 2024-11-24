require('dotenv').config();
require('express-async-errors');
// express

const express = require('express');
const app = express();
// rest of the packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// database
const connectDB = require('./db/connect');

//  routers
const authRoutes = require('./routes/authRoutes')
const freelancerRoutes = require('./routes/freelancerRoutes')
const clientRoutes = require('./routes/clientRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const gigRoutes = require('./routes/gigRoutes')
const proposalRoutes = require('./routes/proposalRoutes')

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const CustomError = require('./errors')


app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
// Modify your file upload middleware configuration
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/', // Ensure this directory exists
  createParentPath: true, // Automatically create upload directories
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  abortOnLimit: true,
  debug: true // Add debug logging
}));

app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/freelancer',freelancerRoutes)
app.use('/api/v1/client',clientRoutes)
app.use('/api/v1/review',reviewRoutes)
app.use('/api/v1/gigs',gigRoutes)
app.use('/api/v1/proposal',proposalRoutes)


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
