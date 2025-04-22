const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
// const verifyToken = require("../middleware/verifyToken"); 
// const isFacultyOrAdmin = require("../middleware/isFacultyOrAdmin");

router.post("/", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().populate("event_id", "event_name").populate("fund_id", "purpose");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
