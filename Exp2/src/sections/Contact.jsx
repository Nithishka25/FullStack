import React, { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailto = `mailto:your.email@example.com?subject=Portfolio%20Contact%20from%20${encodeURIComponent(
      form.name
    )}&body=${encodeURIComponent(
      form.message
    )}%0A%0AReply%20to:%20${encodeURIComponent(form.email)}`;
    window.location.href = mailto;
  };

  return (
    <div id="contact">
      <section className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-indigo-600 dark:text-indigo-400">
          Contact Me
        </h2>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Left Column - Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Your Name"
              className="w-full p-3 border rounded-lg dark:bg-neutral-900 dark:border-neutral-800"
              required
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border rounded-lg dark:bg-neutral-900 dark:border-neutral-800"
              required
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows="4"
              className="w-full p-3 border rounded-lg dark:bg-neutral-900 dark:border-neutral-800"
              required
            ></textarea>
            <button
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              type="submit"
            >
              Send
            </button>
          </form>

          {/* Right Column - Contact Info */}
          <div className="flex flex-col gap-3 justify-center space-y-4 text-left">
            <p className="text-lg text-gray-700 dark:text-neutral-300">
              <strong>Email:</strong> nithi2025@gmail.com
            </p>
            <p className="text-lg text-gray-700 dark:text-neutral-300">
              <strong>Contact:</strong> 9999999999
            </p>
            
          </div>
        </div>
      </section>
    </div>
  );
}
