import React, { useEffect, useState } from "react";

export default function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/skills")
      .then((res) => res.json())
      .then((data) => setSkills(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section id="skills" className="min-h-screen px-6 py-20">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600">Skills</h2>
      {skills.length === 0 ? (
        <p>No skills available.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {skills.map((s) => (
            <span
              key={s._id}
              className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
            >
              {s.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
