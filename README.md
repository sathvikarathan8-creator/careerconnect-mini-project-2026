# CareerConnect API

CareerConnect is a REST API for a simple job marketplace. It connects job seekers, employers and administrators through authenticated APIs.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication with httpOnly cookies
- bcryptjs for password hashing

## User Roles

- **USER** – browse jobs, maintain a profile and submit applications
- **EMPLOYER** – publish jobs and manage received applications
- **ADMIN** – monitor users, jobs and platform statistics

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file using `.env.example` and provide your MongoDB connection string and JWT secret.

3. Start the API:

```bash
npm start
```

The default server runs on `http://localhost:4000`.

## API Routes

- `/health` – service status
- `/user-api` – registration, login, logout and profiles
- `/job-api` – job browsing and employer job management
- `/application-api` – applications and application status
- `/admin-api` – administrative operations and statistics

### Job Search

The public jobs endpoint supports optional filters:

```text
GET /job-api/jobs?keyword=node&location=hyderabad&employmentType=full_time
```

`keyword` searches the job title, company name and required skills. Results are ordered by most recently posted jobs.

## Notes

Admin creation is intentionally restricted from the public registration endpoint. For local development, create an account and assign the required role through your database administration workflow.

Do not commit `.env` or real credentials to the repository.
