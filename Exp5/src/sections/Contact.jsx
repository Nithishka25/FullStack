import React, { useState, useEffect } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(""); // for validation error

  // Fetch existing messages
  useEffect(() => {
    fetch("http://localhost:5000/api/contacts")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Simple email validation function
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(""); // reset error

    fetch("http://localhost:5000/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((newMessage) => {
        setMessages([...messages, newMessage]); // update messages
        setForm({ name: "", email: "", message: "" }); // reset form
      })
      .catch((err) => console.error(err));
  };

  return (
    <section id="contact" className="min-h-screen px-6 py-20 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600">Contact Me</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 shadow rounded-xl"
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>

        {/* Messages Section */}
        <div className="bg-gray-100 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Messages</h3>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((msg, i) => (
                <li key={i} className="bg-white p-3 rounded shadow">
                  <p>
                    <strong>{msg.name}</strong> ({msg.email})
                  </p>
                  <p className="text-gray-700">{msg.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
