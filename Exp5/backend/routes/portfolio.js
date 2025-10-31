import express from 'express';
import auth from '../middleware/auth.js';
import Home from '../models/Home.js';
import About from '../models/About.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Certificate from '../models/Certificate.js';
import ContactInfo from '../models/ContactInfo.js';

const router = express.Router();

// Helpers for singleton docs
async function getSingleton(Model) {
  let doc = await Model.findOne();
  if (!doc) {
    doc = await Model.create({});
  }
  return doc;
}

// Public GET endpoints
router.get('/home', async (req, res) => {
  try {
    const data = await getSingleton(Home);
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/about', async (req, res) => {
  try {
    const data = await getSingleton(About);
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const data = await Project.find();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const data = await Skill.find();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/certificates', async (req, res) => {
  try {
    const data = await Certificate.find();
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/contact', async (req, res) => {
  try {
    const data = await getSingleton(ContactInfo);
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// Admin-protected PUT endpoints
router.put('/home', auth, async (req, res) => {
  try {
    const existing = await getSingleton(Home);
    await Home.updateOne({ _id: existing._id }, { $set: req.body });
    const updated = await Home.findById(existing._id);
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/about', auth, async (req, res) => {
  try {
    const existing = await getSingleton(About);
    await About.updateOne({ _id: existing._id }, { $set: req.body });
    const updated = await About.findById(existing._id);
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/projects', auth, async (req, res) => {
  try {
    const { projects } = req.body;
    if (!Array.isArray(projects)) {
      return res.status(400).json({ success: false, message: 'projects must be an array' });
    }
    await Project.deleteMany({});
    const created = await Project.insertMany(projects);
    return res.json({ success: true, data: created });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/skills', auth, async (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'skills must be an array' });
    }
    await Skill.deleteMany({});
    const created = await Skill.insertMany(skills);
    return res.json({ success: true, data: created });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/certificates', auth, async (req, res) => {
  try {
    const { certificates } = req.body;
    if (!Array.isArray(certificates)) {
      return res.status(400).json({ success: false, message: 'certificates must be an array' });
    }
    await Certificate.deleteMany({});
    const created = await Certificate.insertMany(certificates);
    return res.json({ success: true, data: created });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/contact', auth, async (req, res) => {
  try {
    const existing = await getSingleton(ContactInfo);
    await ContactInfo.updateOne({ _id: existing._id }, { $set: req.body });
    const updated = await ContactInfo.findById(existing._id);
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
