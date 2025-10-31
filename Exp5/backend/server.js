import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import skillsRoute from "./routes/skills.js";
import projectsRoute from "./routes/projects.js";
import certificatesRoute from "./routes/certificates.js";
import contactsRoute from "./routes/contacts.js";
import authRoute from "./routes/auth.js";
import portfolioRoute from "./routes/portfolio.js";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Use routes from separate files
app.use("/api/skills", skillsRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/certificates", certificatesRoute);
app.use("/api/contacts", contactsRoute);
app.use("/api/auth", authRoute);
app.use("/api/portfolio", portfolioRoute);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/portfolio";

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("Mongo connected");
    // Seed default admin if not exists
    seedDefaultAdmin()
      .then(() => console.log("Admin seeding complete"))
      .catch((e) => console.error("Admin seeding error:", e.message));
    app.listen(PORT, () => console.log("Server running on port", PORT));
  })
  .catch((err) => console.error(err));

async function seedDefaultAdmin() {
  const email = "admin@portfolio.com";
  const password = "admin123";

  const exists = await Admin.findOne({ email });
  if (exists) return;

  const hash = await bcrypt.hash(password, 12);
  await Admin.create({ email, password: hash, name: "Default Admin" });
}
