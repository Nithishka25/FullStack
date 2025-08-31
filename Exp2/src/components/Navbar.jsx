import React, { useEffect, useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'

const links = ['Home','About','Projects','Skills','Certificates','Contact']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-neutral-900/70 backdrop-blur shadow z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#home" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">MyPortfolio</a>
        <button className="md:hidden p-2 rounded-lg border" onClick={() => setOpen(v=>!v)} aria-label="Toggle Menu">☰</button>
        <ul className="hidden md:flex items-center gap-6 font-medium">
          {links.map(item => (
            <li key={item}>
              <a href={`#${item.toLowerCase()}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{item}</a>
            </li>
          ))}
          <li>
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg border hover:bg-indigo-50 dark:hover:bg-neutral-800"
              aria-label="Toggle Theme"
            >
              {dark ? <FaSun /> : <FaMoon />}
            </button>
          </li>
        </ul>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col gap-3">
            {links.map(item => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} onClick={()=>setOpen(false)} className="block py-2 border-b">
                  {item}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => setDark(d => !d)}
                className="mt-2 w-full p-2 rounded-lg border"
                aria-label="Toggle Theme"
              >
                {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
