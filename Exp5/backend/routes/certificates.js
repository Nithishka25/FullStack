import express from "express";
import Certificate from "../models/Certificate.js";

const router = express.Router();

// GET all certificates
router.get("/", async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new certificate
router.post("/", async (req, res) => {
  try {
    const newCert = new Certificate(req.body);
    await newCert.save();
    res.status(201).json(newCert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
