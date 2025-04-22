const express = require("express");
const router = express.Router();
const EventRegistration = require("../models/eventRegistration");
//const verifyToken = require("../middleware/verifyToken"); // ✅

router.post("/", async (req, res) => {
  try {
    const registration = new EventRegistration(req.body);
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const registrations = await EventRegistration.find()
      .populate("user_id", "name")
      .populate("event_id", "event_name");
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
