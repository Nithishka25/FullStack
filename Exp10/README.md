# Food Delivery (MERN)

## Setup

- **Server**
  - Copy `server/.env.example` to `server/.env` and adjust values.
  - Install deps: `npm install` (in `server/`)
  - Run dev API: `npm run dev`
  - API runs at `http://localhost:5000`

- **Client**
  - Copy `client/.env.example` to `client/.env` if needed.
  - Install deps: `npm install` (in `client/`)
  - Run dev client: `npm run dev`
  - App at `http://localhost:5173`

## Features (MVP)

- **Auth**: JWT login/register for users and restaurant owners.
- **Browse**: List restaurants, search by name.
- **Menu**: View items by restaurant.
- **Cart**: Add items and place order (demo requires entering restaurant id on cart).
- **Orders**: User order history with real-time status updates (Socket.io).
- **Dashboard**: Owner can upsert profile, view orders, update status.

## Notes

- This is a minimal scaffold. Extend validations, error handling, and UI/UX.
- Ensure MongoDB is running locally or use a cloud URI.
