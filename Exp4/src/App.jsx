import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./sections/Home.jsx";
import About from "./sections/About.jsx";
import Projects from "./sections/Projects.jsx";
import Skills from "./sections/Skills.jsx";
import Certificates from "./sections/Certificates.jsx";
import Contact from "./sections/Contact.jsx";

import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

export default function App() {
  const { pathname } = useLocation();
  const showNavbar = ![ "/login", "/signup" ].includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Optional standalone section routes (public viewing) */}
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/contact" element={<Contact />} />
          {/* Portfolio dashboard (protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </>
  );
}
