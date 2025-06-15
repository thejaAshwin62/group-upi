import mongoose from "mongoose";

const Member = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: false },
  upiLink: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

export default Member;
