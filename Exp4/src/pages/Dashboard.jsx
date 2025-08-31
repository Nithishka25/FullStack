// src/pages/Dashboard.jsx
import React from "react";
import Navbar from "../components/Navbar"; // ✅ Navbar with logout
import Home from "../sections/Home.jsx";
import About from "../sections/About.jsx";
import Projects from "../sections/Projects.jsx";
import Skills from "../sections/Skills.jsx";
import Certificates from "../sections/Certificates.jsx";
import Contact from "../sections/Contact.jsx";

export default function Dashboard() {
  return (
    <div>
      {/* Navbar at the top */}
      <Navbar />

      {/* Portfolio Sections */}
      <div className="pt-20">
        <Home />
        <About />
        <Projects />
        <Skills />
        <Certificates />
        <Contact />
      </div>
    </div>
  );
}
