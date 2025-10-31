# OLX-like Classifieds Platform (MERN)

This project is a MERN stack application for buying/selling used products, featuring:

- User authentication (JWT)
- Product listings CRUD
- Search and filters
- Real-time chat between buyers and sellers (Socket.io)
- Payment integration (Stripe)

## Structure

- `server/` — Node.js/Express API, MongoDB via Mongoose, Socket.io, Stripe
- `client/` — React app (Vite) for UI

## Quick Start

1. Create `.env` from examples in both `server/` and `client/` if needed
2. Install dependencies (see commands below)
3. Start server and client

## Dev Commands (after setup)

- Server: `npm run dev` (in `server/`)
- Client: `npm run dev` (in `client/`)

## Notes

- Replace placeholder values in `.env.example` with real secrets.
- For payments, you need Stripe keys and to configure webhooks.
