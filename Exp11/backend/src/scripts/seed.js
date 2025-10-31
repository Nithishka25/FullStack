require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave_management';

(async () => {
  try {
    await mongoose.connect(mongoUri);

    const ensureUser = async ({ name, email, password, role, department, managerEmail }) => {
      let managerId = undefined;
      if (managerEmail) {
        const manager = await User.findOne({ email: managerEmail });
        managerId = manager ? manager._id : undefined;
      }
      let u = await User.findOne({ email });
      if (!u) {
        u = await User.create({ name, email, password, role, department, manager: managerId });
        console.log(`Created ${role}: ${email}`);
      } else {
        console.log(`Exists ${role}: ${email}`);
      }
      return u;
    };

    const admin = await ensureUser({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
    });

    const manager = await ensureUser({
      name: 'Team Manager',
      email: 'manager@example.com',
      password: 'Manager@123',
      role: 'manager',
      department: 'Engineering',
    });

    await ensureUser({
      name: 'Employee One',
      email: 'employee1@example.com',
      password: 'Employee@123',
      role: 'employee',
      department: 'Engineering',
      managerEmail: 'manager@example.com',
    });

    await ensureUser({
      name: 'Employee Two',
      email: 'employee2@example.com',
      password: 'Employee@123',
      role: 'employee',
      department: 'Engineering',
      managerEmail: 'manager@example.com',
    });

    console.log('Seeding complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();
