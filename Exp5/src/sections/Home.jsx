import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Home() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-6xl mx-auto"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold leading-tight"
      >
        Hi, I’m{" "}
        <span className="text-indigo-600 dark:text-indigo-400">
          Nithishka T K
        </span>{" "}
        👋
      </motion.h1>
      <p className="mt-4 text-lg text-black max-w-2xl">
        Aspiring developer passionate about building fast, accessible web apps.
      </p>
      <div className="mt-6 flex gap-4">
        <a
          href="https://github.com/Nithishka25"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-indigo-50 dark:hover:bg-neutral-800"
        >
          <FaGithub /> GitHub
        </a>
        <a
          href="https://linkedin.com/in/nithishkatk25"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-indigo-50 dark:hover:bg-neutral-800"
        >
          <FaLinkedin /> LinkedIn
        </a>
        <a
          href="#projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          View Projects
        </a>
      </div>
    </section>
  );
}
