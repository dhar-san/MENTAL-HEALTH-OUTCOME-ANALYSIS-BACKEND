# Mental Health Outcome Analytics System

A full-stack MERN application for standardized mental health assessments (stress, anxiety, depression), outcome scoring, severity classification, and analytics dashboards.

> **Disclaimer:** This system is for awareness and analytics only, not medical diagnosis.

## Tech Stack

- **Frontend:** React.js (hooks, modern component structure)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT-based with role-based access
- **Charts:** React-Chart.js

## Project Structure

```
PROJECT PBL/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
├── server/                 # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── seeds/
└── README.md
```

## Features

### User Role
- Register and login
- View assigned assessments
- Complete assessments with automatic score calculation
- Severity classification: Low, Moderate, Severe
- Personal dashboard with progress charts over time

### Admin Role
- Create, update, delete mental health assessments
- Add questions with score values and scoring rules
- Assign assessments to users
- Aggregated analytics (severity distribution, trends, participation)
- Admin dashboard with charts

### Outcome Calculation
- Total score = sum of selected option scores
- Severity determined by configurable score ranges in each assessment

## Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd server
npm install
```

Create `server/.env` (or copy from `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mental_health_analytics
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

```bash
npm run dev
```

### 2. Seed Sample Data (Optional)

```bash
cd server
npm run seed
```

Creates:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`
- Sample assessments (Stress, Anxiety, Depression)

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs at `http://localhost:3000` and proxies API to `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |
| GET | /api/assessments | Private |
| GET | /api/assessments/:id | Private |
| POST | /api/assessments | Admin |
| PUT | /api/assessments/:id | Admin |
| DELETE | /api/assessments/:id | Admin |
| POST | /api/assessments/:id/assign | Admin |
| POST | /api/responses | Private |
| GET | /api/responses | Private |
| GET | /api/analytics/user | Private |
| GET | /api/analytics/admin | Admin |
| GET | /api/notifications | Private |
| GET | /api/users | Admin |

## Flow Overview

1. **Admin** creates assessments with questions and scoring rules.
2. **Admin** assigns assessments to users.
3. **Users** receive notifications and complete assessments.
4. **System** calculates total score and assigns severity (Low/Moderate/Severe).
5. **Users** view progress charts on their dashboard.
6. **Admin** views aggregated analytics and trends.

## Viva / Explanation Notes

- **Authentication:** JWT stored in localStorage; `protect` middleware validates token on protected routes.
- **Roles:** `authorize('admin')` restricts routes to admin users.
- **Score calculation:** Sum of selected option scores; severity from `scoringRules` array.
- **Notifications:** Stored in User model; pushed when assessments are assigned or completed.

## License

For educational / student project use.
