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

const normalizeOrigin = (value) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return value.trim().replace(/\/+$/, '');
  }
};

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => normalizeOrigin(url.trim()))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
];

const allowedOrigins = new Set([ ...defaultOrigins, ...configuredOrigins ]);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  // Allow local dev servers on localhost/127.0.0.1 regardless of port.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin)) {
    return true;
  }

  // Allow Vercel production/preview deployments like *.vercel.app
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS for origin:', origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true, // Allow cookies and credentials to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Log CORS configuration for debugging
console.log('CORS enabled for origins:', Array.from(allowedOrigins));

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

app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      message: error.message,
      path: error.path,
    }));

    return res.status(400).json({ errors });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'A record with this value already exists' });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});




module.exports = app;
