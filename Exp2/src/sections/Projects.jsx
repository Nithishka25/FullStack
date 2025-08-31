import React from 'react'
import { motion } from 'framer-motion'

const projects = [
  {
    title: "The Contact Manager",
    description:
      "The Contact Manager is a simple web-based application that allows users to add, view, and search contact information. Each contact includes a name, phone number, image and email address. The data is stored locally using the browser’s LocalStorage, so it persists even after refreshing the page.",
    github: "https://github.com/Nithishka25/Projects.git",
    live: "#",
  },
  {
    title: "Countdown timer",
    description:
      "Built a simple countdown timer similar to stopwatch allowing users to start,pause and reset the timer. Implemented a user friendly interface,enhancing real-time event handling and UI responsiveness  ",
    github: "https://github.com/Nithishka25/Projects.git",
    live: "#",
  },
  {
    title: "Calculator",
    description:
      "The Calculator is a simple web application that allows users to perform basic arithmetic operations like addition, subtraction, multiplication, and division. It features a  responsive interface with clickable buttons, and all calculations are handled using JavaScript. ",
    github: "https://github.com/Nithishka25/Projects.git",
    live: "#",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Projects</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map((p, idx) => (
          <motion.article key={p.title}
            initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{duration:0.4, delay: idx*0.1}}
            className="p-5 border rounded-2xl shadow-sm hover:shadow-md dark:border-neutral-800">
            <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
            <p className="text-gray-600 dark:text-neutral-300 mb-3">{p.description}</p>
            <div className="flex gap-4">
              <a href={p.github} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">GitHub</a>
              {p.live !== '#' && <a href={p.live} className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">Live</a>}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
