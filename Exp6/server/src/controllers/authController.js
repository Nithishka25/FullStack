import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export async function register(req, res) {
  try {
    console.log('Register req.body:', req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      console.log('Register: Missing required fields');
      return res.status(400).json({ message: 'username, email and password are required' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('Register: User already exists');
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashed });
    console.log('Register: User created successfully');
    return res.status(201).json({ message: 'Registered successfully. Please login.' });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    console.log('Login req.body:', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Login: Missing required fields');
      return res.status(400).json({ message: 'username and password are required' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      console.log('Login: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login: Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    res.cookie('token', token, cookieOptions);
    console.log('Login: Successful');
    return res.json({
      message: 'Logged in successfully',
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user._id, username: user.username, email: user.email });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
    return res.json({ message: 'Logged out' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}
