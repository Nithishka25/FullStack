// src/auth/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear auth token
    navigate("/login"); // go back to login
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Your Portfolio Dashboard 🎉</h1>
      <p>You are successfully logged in!</p>
      <button
        onClick={handleLogout}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Logout
      </button>
    </div>
  );
}
