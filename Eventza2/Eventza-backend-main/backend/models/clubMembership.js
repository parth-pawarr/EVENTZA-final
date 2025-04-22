const mongoose = require('mongoose');

const clubMembershipSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  club_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  joined_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ClubMembership', clubMembershipSchema);
