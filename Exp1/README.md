# Portfolio Website (React + Vite + Tailwind)

## Features
- Responsive single-page portfolio with sections: Home, About, Projects, Skills, Certificates, Contact
- Sticky Navbar with smooth anchor scrolling
- Dark/Light mode toggle (persists in localStorage)
- Framer Motion animations
- React Icons for social links
- TailwindCSS styling
- Contact form uses `mailto:` (no backend required)

## Quick Start
```bash
# 1) Extract the zip
# 2) Open a terminal in the project folder
npm install
npm run dev
# Open the shown localhost URL
```

### Windows PowerShell tips
If a doc says `rm -rf`, in PowerShell use:
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
```

## Customize
- Edit text and links in `src/sections/*` files.
- Replace `your.email@example.com` in `src/sections/Contact.jsx`.
- Update certificates in `src/sections/Certificates.jsx`.
- Add more projects in `src/sections/Projects.jsx`.
- Change site title in `index.html` and brand in `Navbar.jsx`.

## Build & Deploy
```bash
npm run build
# Deploy the generated 'dist' folder to Netlify, Vercel, or GitHub Pages.
```
