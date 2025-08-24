import React from 'react'

const skills = ['React','Node.js','MongoDB','Docker','Java','Python','Tailwind','Spark']

export default function Skills() {
  return (
    <section id="skills" className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Skills</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {skills.map(s => (
          <div key={s} className="bg-indigo-50 dark:bg-neutral-800/60 p-3 rounded-lg text-center font-medium">
            {s}
          </div>
        ))}
      </div>
    </section>
  )
}
