const express = require("express");
const router = express.Router();
const Fund = require("../models/fund");
// const verifyToken = require("../middleware/verifyToken"); 
// const isAdmin = require("../middleware/isAdmin");

router.post("/", async (req, res) => {
  try {
    const fund = new Fund(req.body);
    await fund.save();
    res.status(201).json(fund);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Fund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const funds = await Fund.find().populate("club_id", "club_name").populate("approved_by", "name");
    res.json(funds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
