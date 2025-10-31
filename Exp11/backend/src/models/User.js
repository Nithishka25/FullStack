const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['team_member', 'team_leader', 'team_manager', 'general_manager'],
      default: 'team_member',
    },
    department: { type: String, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leaveBalance: {
      casual: { type: Number, default: 12 },
      medical: { type: Number, default: 12 },
      earned: { type: Number, default: 15 },
      unpaid: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: this._id, role: this.role }, secret, { expiresIn });
};

module.exports = mongoose.model('User', UserSchema);
