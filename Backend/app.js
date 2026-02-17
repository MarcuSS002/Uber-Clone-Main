const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const adminRoutes = require('./routes/admin.routes');

connectToDb();

app.use(express.json());

// CORS Configuration: Allow requests from the frontend URL specified in environment variables
// This prevents browsers from blocking cross-origin requests from the Vercel frontend
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(url => url.trim());
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and credentials to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Log CORS configuration for debugging
console.log('CORS enabled for origins:', (process.env.FRONTEND_URL || 'http://localhost:3000').split(','));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);
app.use('/admin', adminRoutes);




module.exports = app;

