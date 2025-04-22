const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event_name: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  club_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Event", eventSchema);
