const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const verifyToken = require("../middleware/verifyToken");
const isFacultyOrAdmin = require("../middleware/isFacultyOrAdmin");

// Create event (protected, faculty/admin only)
router.post("/", verifyToken, isFacultyOrAdmin, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all events (public)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("club_id", "club_name");
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
