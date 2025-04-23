const express = require("express");
const router = express.Router();
const Fund = require("../models/fund");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

// Create fund (protected, admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const fund = new Fund(req.body);
    await fund.save();
    res.status(201).json(fund);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update fund (protected, admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Fund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all funds (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const funds = await Fund.find().populate("club_id", "club_name").populate("approved_by", "name");
    res.json(funds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
