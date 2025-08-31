import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import skillsRoute from "./routes/skills.js";
import projectsRoute from "./routes/projects.js";
import certificatesRoute from "./routes/certificates.js";
import contactsRoute from "./routes/contacts.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Use routes from separate files
app.use("/api/skills", skillsRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/certificates", certificatesRoute);
app.use("/api/contacts", contactsRoute);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/portfolio";

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log("Server running on port", PORT));
  })
  .catch((err) => console.error(err));
