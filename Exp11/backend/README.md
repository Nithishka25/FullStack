# Leave Management System - Backend

A minimal Express + MongoDB backend implementing authentication and leave workflows.

## Setup

- Copy `.env.example` to `.env` and update values.
- Install dependencies:

```bash
npm install
```

- Start dev server:

```bash
npm run dev
```

- Health check: `GET http://localhost:5000/api/health`

## API Overview

- `POST /api/auth/register` name, email, password, department, role?
- `POST /api/auth/login` email, password
- `GET /api/auth/me` (Bearer token)
- `PUT /api/auth/password` currentPassword, newPassword

- `GET /api/leaves` (employees: own, managers: team, admins: all)
- `POST /api/leaves` leaveType, startDate, endDate, reason
- `PUT /api/leaves/:id/status` (manager/admin) status=approved|rejected, reason?
- `PUT /api/leaves/:id/cancel` (owner/admin)

## Notes

- Roles: employee, team_lead, manager, admin
- Balances stored on user: casual, medical, earned, unpaid
- Balance deducted on approval (except unpaid)
