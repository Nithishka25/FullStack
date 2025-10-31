# Todo List Backend (Express + MongoDB)

This is the backend API for the MERN Todo List app. It supports:

- User registration and login with JWT stored in httpOnly cookies
- CRUD operations on tasks per user
- Filtering tasks by status (all/active/completed) and text search (`q`)

## Endpoints

- `POST /api/auth/register` { username, email, password }
- `POST /api/auth/login` { username, password }
- `GET /api/auth/me` (auth)
- `POST /api/auth/logout` (auth)

- `GET /api/tasks?status=all|active|completed&q=...` (auth)
- `POST /api/tasks` { title, description? } (auth)
- `PUT /api/tasks/:id` { title?, description?, completed? } (auth)
- `DELETE /api/tasks/:id` (auth)

## Setup

1. Copy `.env.example` to `.env` and update values if needed.
2. Install dependencies:
   ```bash
   npm install
   npm install -D nodemon
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

By default it connects to `mongodb://127.0.0.1:27017/todo-list`.
