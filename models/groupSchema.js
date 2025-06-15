import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalAmount: { type: Number, required: false, default: 0 },
  upiLink: { type: String },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      amount: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
