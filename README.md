
# Sweety - Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking application that helps users record, monitor, and review their daily glucose readings through a simple dashboard.

## Features

### Authentication
- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes
- Users can access only their own readings

### Glucose Tracking
- Add, view, edit, and delete glucose readings
- Four daily reading slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Input validation:
  - Values must be integers between 40 and 600 mg/dL
  - Duplicate slots for the same date are not allowed
  - Maximum of four readings per day
  - Future dates are not allowed

### Reports and Dashboard
- Daily report for a selected date
- Month-to-date report
- Previous calendar month report
- Highest, lowest, and average glucose values
- Total reading count
- Reading history and chart visualization
- Empty states when no readings are available

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router
- Recharts
- Lucide React

**Backend**
- Node.js
- Express.js
- JavaScript (CommonJS)
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Zod

## Project Structure

```text
sweety/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── lib/
│   │   └── modules/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 22 or later
- npm
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/aniket1821-vk/Sweety.git
cd Sweety
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure the following variables:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5555/sweety?schema=public"
JWT_SECRET="your_long_random_secret"
JWT_EXPIRES_IN="1d"
CLIENT_URL="http://localhost:5173"
APP_TIME_ZONE="Asia/Kolkata"
```

Create a PostgreSQL database named `sweety` before running migrations.

Generate Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development, if creating a new migration:

```bash
npx prisma migrate dev
```

### 3. Seed Demo Data

```bash
npm run db:seed
```

Demo credentials:

- Email: `demo@sweety.test`
- Password: `StrongPass123`

The seed script creates or updates the demo account and its four daily readings. Running it again does not create duplicate readings.

### 4. Start Backend

```bash
npm run dev
```

Backend runs at `http://localhost:4000`.

Health checks:
- `GET /api/health`
- `GET /api/health/db`

### 5. Frontend Setup

Open a second terminal:

```bash
cd client
npm install
```

Create a `.env` file using `.env.example`:

```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |

### Glucose Readings

All reading endpoints require a valid JWT bearer token.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/readings` | Get user's readings |
| POST | `/api/readings` | Add a reading |
| GET | `/api/readings/:id` | Get a reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/api/reports/monthly?date=YYYY-MM-DD` | Previous calendar month report |

## Security and Data Integrity

- Passwords are stored as bcrypt hashes
- JWT authentication protects private endpoints
- Reading queries are scoped to the authenticated user
- Database constraints prevent duplicate readings for the same user, date, and slot
- Input validation is performed before database operations
- Environment files containing secrets are excluded from Git

## Validation Rules

| Rule | Expected behaviour |
|---|---|
| Missing glucose value | Rejected |
| Value below 40 | Rejected |
| Value above 600 | Rejected |
| Decimal value | Rejected |
| Duplicate date and slot | Rejected |
| More than four readings per day | Rejected |
| Future date | Rejected |

## Running Quality Checks

Frontend lint:

```bash
cd client
npm run lint
```

Frontend production build:

```bash
npm run build
```

Backend health checks:

```text
GET http://localhost:4000/api/health
GET http://localhost:4000/api/health/db
```

## Assumptions

- Glucose values are recorded in mg/dL
- Each user can record a maximum of one reading per slot per calendar date
- The four reading slots are Morning, After breakfast, After lunch, and After dinner
- Monthly reports cover the entire previous calendar month relative to the selected date
- Month-to-date reports cover the first day of the selected month through the selected date
- Dates are interpreted using the configured application timezone

## License

This project was developed as part of a full-stack developer assignment.
