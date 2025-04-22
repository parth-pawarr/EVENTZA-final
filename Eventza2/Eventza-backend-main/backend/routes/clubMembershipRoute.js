const express = require("express");
const router = express.Router();
const ClubMembership = require("../models/clubMembership");
//const verifyToken = require("../middleware/verifyToken"); // ✅

router.post("/", async (req, res) => {
  try {
    const membership = new ClubMembership(req.body);
    await membership.save();
    res.status(201).json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const memberships = await ClubMembership.find()
      .populate("user_id", "name")
      .populate("club_id", "club_name");
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
