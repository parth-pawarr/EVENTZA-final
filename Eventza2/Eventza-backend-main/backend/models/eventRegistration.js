const mongoose = require("mongoose");

const EventRegistrationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  registered_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EventRegistration", EventRegistrationSchema);
