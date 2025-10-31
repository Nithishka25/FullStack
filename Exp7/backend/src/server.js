import express from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Static uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch {}
app.use('/uploads', express.static(uploadsDir));

const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/microblog';

async function startHttpServer(basePort) {
  const maxAttempts = 10;
  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    const portToTry = basePort + attempt;
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(portToTry, () => {
          console.log(`Server running on port ${portToTry}`);
          resolve();
        });
        server.on('error', (err) => {
          if (err && err.code === 'EADDRINUSE') {
            console.warn(`Port ${portToTry} is in use, trying ${portToTry + 1}...`);
            try { server.close(); } catch {}
            reject(err);
          } else {
            reject(err);
          }
        });
      });
      // success, break loop
      break;
    } catch (err) {
      if (!(err && err.code === 'EADDRINUSE')) {
        throw err;
      }
      if (attempt === maxAttempts) {
        throw new Error(`Unable to bind to any port from ${basePort} to ${basePort + maxAttempts}`);
      }
      // otherwise continue loop to try next port
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log('MongoDB connected');
      await startHttpServer(PORT);
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

export default app;
