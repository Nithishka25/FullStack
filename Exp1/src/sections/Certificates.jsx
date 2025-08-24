import React from "react";

const certificates = [
  {
    name: "Introduction to Agile Methodology",
    link: "/cc.pdf",
  },
  { name: "Intern", link: "/intern.pdf" },
];

export default function Certificates() {
  return (
    <section
      id="certificates"
      className="min-h-screen flex flex-col justify-center px-6 py-20 max-w-6xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">
        Certificates
      </h2>
      <ul className="list-disc ml-6 text-gray-700 dark:text-neutral-300 space-y-2">
        {certificates.map((c) => (
          <li key={c.name}>
            <a
              href={c.link}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline"
            >
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
