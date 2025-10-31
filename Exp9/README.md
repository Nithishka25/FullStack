# Online Survey Application (MERN)

Minimal MERN app with admin-managed question pool and user survey submissions.

## Features
- **Admin Panel**: Add/Edit/Delete questions. View all responses.
- **User**: Login/Register. Get 5 random questions. Submit answers. View confirmation.
- **Auth**: JWT-based, roles (user/admin). Seed default admin.

## Project Structure
- `server/` Express API, MongoDB (Mongoose)
- `client/` React (Vite), React Router, Axios

## Prerequisites
- Node 18+
- MongoDB running locally (default `mongodb://localhost:27017`)

## Setup

### 1) Server
```bash
# in server/
cp .env.example .env
# edit .env if needed (JWT_SECRET, MONGO_URI, CLIENT_URL)
npm install
# seed default admin
npm run seed
# start API
npm run dev
```
Default admin credentials come from `.env`:
- `ADMIN_EMAIL=admin@example.com`
- `ADMIN_PASSWORD=Admin@12345`

### 2) Client
```bash
# in client/
cp .env.example .env
# edit VITE_API_URL if your API runs on a different URL
npm install
npm run dev
```
Vite dev server runs at `http://localhost:5173`.

## API Summary
- `POST /api/auth/register` { email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/auth/me` Bearer token
- `GET /api/questions` admin only
- `POST /api/questions` admin only
- `PUT /api/questions/:id` admin only
- `DELETE /api/questions/:id` admin only
- `GET /api/questions/random?count=5` user
- `POST /api/responses` user, body: `{ answers: [{ question, answer }] }`
- `GET /api/responses` admin only

## Notes
- Question types: `text`, `single`, `multi`.
- For `single`/`multi`, provide `options` array (admin UI uses one-option-per-line input).

## Scripts
- `server:npm run seed` Create default admin if missing.
- `server:npm run dev` Start Express with nodemon.
- `client:npm run dev` Start Vite dev server.

## Production
- Build client: `npm run build` in `client/`, then serve `client/dist` behind a static host and point it to API URL via env.
