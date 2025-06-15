import mongoose from "mongoose";

const User = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // For login attempt tracking
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date },
  lastLockoutDuration: { type: Number, default: 0 },
});

export default mongoose.model("User", User);
