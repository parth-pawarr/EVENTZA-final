const express = require("express");
const router = express.Router();
const ClubMembership = require("../models/clubMembership");
const verifyToken = require("../middleware/verifyToken");

// Create membership (protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const membership = new ClubMembership(req.body);
    await membership.save();
    res.status(201).json(membership);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all memberships (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const memberships = await ClubMembership.find()
      .populate("user_id", "name")
      .populate("club_id", "club_name");
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get club data for a specific user (protected)
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const memberships = await ClubMembership.find({ user_id: req.params.userId })
      .populate("club_id", "club_name description")
      .populate("user_id", "name email role");
    
    if (!memberships || memberships.length === 0) {
      return res.status(404).json({ message: "No club memberships found for this user" });
    }
    
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
