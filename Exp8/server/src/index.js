import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.route.js';
import productRouter from './routes/product.route.js';
import chatRouter from './routes/chat.route.js';
import ordersRouter from './routes/orders.route.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Basic Socket.io setup
io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
  });

  socket.on('chat:message', ({ roomId, message }) => {
    io.to(roomId).emit('chat:message', { message, at: new Date().toISOString() });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
  });
});

// Expose io to routes/controllers
app.set('io', io);

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
// JSON parser
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/chat', chatRouter);
app.use('/api/orders', ordersRouter);

// Root
app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'Classifieds API', version: '0.1.0' });
});

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    await connectDB();
    await new Promise((resolve, reject) => {
      server.once('error', (err) => reject(err));
      server.once('listening', () => resolve());
      server.listen(PORT);
    });
    console.log(`Server listening on http://localhost:${PORT}`);
    // Graceful shutdown
    const shutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      // Force exit if not closed in 5s
      setTimeout(() => process.exit(0), 5000).unref();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception', err);
      shutdown();
    });
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection', err);
      shutdown();
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
