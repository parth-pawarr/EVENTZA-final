const mongoose = require("mongoose");

const FundSchema = new mongoose.Schema({
  club_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },
  requested_amount: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  approved_amount: Number,
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Usually Admin or Faculty
  },
  approval_remarks: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Fund", FundSchema);
