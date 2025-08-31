import React, { useEffect, useState } from "react";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/certificates")
      .then((res) => res.json())
      .then((data) => setCertificates(data))
      .catch((err) => console.error("Error fetching certificates:", err));
  }, []);

  return (
    <section
      id="certificates"
      className="min-h-screen px-6 py-20 max-w-6xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-indigo-600">Certificates</h2>

      {certificates.length === 0 ? (
        <p>No certificates available.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="p-4 border rounded shadow hover:shadow-md transition"
            >
              <h3 className="font-bold text-xl">{cert.title}</h3>
              {cert.issuer && (
                <p className="text-sm text-gray-600">Issuer: {cert.issuer}</p>
              )}
              {cert.date && (
                <p className="text-sm text-gray-600">Date: {cert.date}</p>
              )}

              {/* Open PDF in a new tab */}
              <img className="text-indigo-600 hover:underline mt-2 inline-block height:100px width:300px" src={cert.image} alt={cert.title} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
