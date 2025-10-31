import React, { useEffect, useState } from "react";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section id="projects" className="min-h-screen px-6 py-20">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600">Projects</h2>

      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p._id}
              className="p-4 border rounded shadow hover:shadow-md transition"
            >
              <h3 className="font-bold text-xl">
                {p.title || "Untitled Project"}
              </h3>
              <p className="mt-2">
                {p.description || "No description provided."}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Tech:{" "}
                {Array.isArray(p.techStack) ? p.techStack.join(", ") : "N/A"}
              </p>
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline mt-2 inline-block"
                >
                  View Project
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
