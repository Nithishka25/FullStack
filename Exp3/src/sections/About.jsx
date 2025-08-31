import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-6xl mx-auto"
    >
      <motion.h2
        className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About Me
      </motion.h2>
      <p className="text-black leading-relaxed">
        I am a dedicated IT graduate with a strong interest in web development,
        AI, and scalable systems. I enjoy learning new technologies and applying
        them to solve real-world problems. I value clean code, great UX, and
        performance.
      </p>
    </section>
  );
}
