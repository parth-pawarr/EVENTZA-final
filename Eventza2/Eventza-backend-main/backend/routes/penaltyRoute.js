const express = require("express");
const router = express.Router();
const Penalty = require("../models/penalty");
// const verifyToken = require("../middleware/verifyToken"); 
// const isAdmin = require("../middleware/isAdmin");

router.post("/", async (req, res) => {
  try {
    const penalty = new Penalty(req.body);
    await penalty.save();
    res.status(201).json(penalty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const penalties = await Penalty.find().populate("club_id", "club_name").populate("penalized_by", "name");
    res.json(penalties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
