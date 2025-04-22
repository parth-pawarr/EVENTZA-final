const mongoose = require("mongoose");

const PenaltySchema = new mongoose.Schema({
  club_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  penalized_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Likely admin/faculty
    required: true,
  },
  penalized_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Penalty", PenaltySchema);
