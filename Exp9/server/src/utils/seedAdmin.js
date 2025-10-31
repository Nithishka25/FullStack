import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('ADMIN_EMAIL/ADMIN_PASSWORD not set');
    process.exit(1);
  }
  let admin = await User.findOne({ email });
  if (!admin) {
    const passwordHash = await bcrypt.hash(password, 10);
    admin = await User.create({ email, passwordHash, role: 'admin' });
    console.log('Admin created:', email);
  } else {
    console.log('Admin already exists:', email);
  }
  process.exit(0);
};

run();
