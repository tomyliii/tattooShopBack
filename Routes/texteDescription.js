const express = require("express");
const router = express.Router();
const TextDescription = require("../Models/TextDescription");
const isAuthentificated = require("../Middleware/isAuthentificated");

router.post("/text/create", isAuthentificated, async (req, res) => {
  try {
    const { description } = req.body;

    const newText = new TextDescription({ description: description });

    await newText.save();
    return res.status(200).json({ message: "Texte mis à jour." });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.get("/text", async (req, res) => {
  try {
    const tatoos = await TextDescription.find();
    return res.status(200).json(tatoos);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.put("/text/edit", isAuthentificated, async (req, res) => {
  try {
    const { description, id } = req.body;
    await TextDescription.findByIdAndUpdate(id, description);

    return res.status(200).json({ message: "Texte mis à jour." });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
