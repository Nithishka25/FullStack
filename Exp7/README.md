# Micro-Blogging Application (MERN)

This is a minimal micro-blogging app with user authentication, posting, following, and a personalized feed.

## Features
- User registration/login (JWT)
- Create, edit, delete posts (tweets)
- Follow/unfollow users
- View posts from followed users in a feed
- User profiles
- Responsive UI (React to be added)

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Frontend: React + Vite (to be added)

## Getting Started - Backend

1. Navigate to `backend/` and install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set values:

```bash
cp .env.example .env
```

3. Start the dev server:

```bash
npm run dev
```

The server will run on `http://localhost:5000` by default.

### API Endpoints
- `POST /api/auth/register` { username, email, name, password }
- `POST /api/auth/login` { usernameOrEmail, password }
- `GET /api/users/:username` Get profile
- `PUT /api/users/me` Update profile (auth)
- `POST /api/users/:username/follow` (auth)
- `POST /api/users/:username/unfollow` (auth)
- `POST /api/posts` Create post (auth)
- `PUT /api/posts/:id` Update own post (auth)
- `DELETE /api/posts/:id` Delete own post (auth)
- `GET /api/posts/user/:username` List user's posts
- `GET /api/posts/feed` Personalized feed (auth)

## Frontend
The React app with responsive UI will be scaffolded next.
