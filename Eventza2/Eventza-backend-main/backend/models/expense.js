const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  fund_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fund",
    //required: true,
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  spent_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Expense", ExpenseSchema);
