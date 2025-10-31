require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const leaveRoutes = require('./src/routes/leaves');
const userRoutes = require('./src/routes/users');
const errorHandler = require('./src/middleware/error');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// DB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave_management';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  });

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
