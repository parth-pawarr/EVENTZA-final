const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  club_name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  faculty_in_charge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // FK to Users
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Who created the club (e.g., student leader)
    required: true
  }
});

module.exports = mongoose.model('Club', clubSchema);
