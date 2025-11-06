const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  password: { type: String, required: true }, // hashed same as User uses pre-save
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // auto-clean after 1 hour
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);


