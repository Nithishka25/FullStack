// src/auth/Login.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Clear fields when component mounts (extra safety)
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setAuth(res.data.user);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="p-6 bg-white shadow rounded"
        autoComplete="off" // 🚫 disables autofill for the whole form
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}

        {/* Email input */}
        <input
          type="text" // 👈 using text instead of email prevents autofill
          name="user_field" // 👈 unique name so browser won’t match it
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 w-full"
          autoComplete="off" // 🚫 disables browser suggestions
        />

        {/* Password input */}
        <input
          type="password"
          name="pass_field" // 👈 unique name
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 w-full"
          autoComplete="new-password" // 🚫 blocks saved password autofill
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}
