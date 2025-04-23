const express = require("express");
const router = express.Router();
const Club = require("../models/club");
const Fund = require("../models/fund");
const Expense = require("../models/expense");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

//only admins can create a club
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const club = new Club(req.body);
    await club.save();
    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public info about clubs
router.get("/", async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single club by ID (protected)
router.get("/:clubId", verifyToken, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get club financial data (protected)
router.get("/:clubId/financial", verifyToken, async (req, res) => {
  try {
    const clubId = req.params.clubId;
    
    // Get funds
    const funds = await Fund.find({ club_id: clubId })
      .populate("approved_by", "name");
    
    // Get expenses
    const expenses = await Expense.find({ club_id: clubId })
      .populate("approved_by", "name");
    
    // Calculate totals
    const totalFunds = funds.reduce((sum, fund) => sum + fund.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalFunds - totalExpenses;
    
    res.json({
      funds,
      expenses,
      summary: {
        totalFunds,
        totalExpenses,
        balance
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
