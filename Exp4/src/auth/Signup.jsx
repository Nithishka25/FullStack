import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const nav = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.msg || "Signup failed");
      setSuccess("Registered! Redirecting to login…");
      setTimeout(() => nav("/login"), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="max-w-md w-full p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Sign up</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}
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
          Create account
        </button>
        <p className="mt-3 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600">Login</Link>
        </p>
      </form>
    </section>
  );
}
