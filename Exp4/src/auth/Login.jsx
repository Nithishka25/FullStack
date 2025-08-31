import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.msg || "Invalid credentials");
      localStorage.setItem("token", data.token);
      nav("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="max-w-md w-full p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          name="username"
          value={form.username}
          onChange={handle}
          placeholder="Name"
          className="w-full p-2 border rounded mb-3"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handle}
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handle}
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded w-full">
          Login
        </button>
        <p className="mt-3 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600">Sign up</Link>
        </p>
      </form>
    </section>
  );
}
