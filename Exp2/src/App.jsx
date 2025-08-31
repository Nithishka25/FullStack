import React from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './sections/Home.jsx'
import About from './sections/About.jsx'
import Projects from './sections/Projects.jsx'
import Skills from './sections/Skills.jsx'
import Certificates from './sections/Certificates.jsx'
import Contact from './sections/Contact.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Home />
        <About />
        <Projects />
        <Skills />
        <Certificates />
        <Contact />
      </main>
    </>
  )
}
