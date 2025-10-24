# VolunteerEngine

A comprehensive volunteer management system built with Next.js, Prisma, and PostgreSQL.

## Prerequisites

- **Node.js 18+**
- **Docker Desktop** - [Download and Install Docker](https://docs.docker.com/get-docker/)
  - **IMPORTANT:** Docker Desktop must be running before starting the database
  - On Windows/Mac: Open Docker Desktop application
  - On Linux: Ensure Docker service is running (`sudo systemctl start docker`)

## Setup Instructions for TAs

### 1. Start Docker
**CRITICAL FIRST STEP:** Make sure Docker is running!
- **Windows/Mac:** Open Docker Desktop application and wait for it to start
- **Linux:** `sudo systemctl start docker`
- **Verify Docker is running:** `docker --version` should return version info

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd VolunteerEngine
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Database connection (pre-configured for our Docker setup)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/volunteerEngine_dev"

# Authentication secret (generate new one below)
AUTH_SECRET="your-generated-secret-key-here"
```

**Generate AUTH_SECRET:**
- **macOS/Linux:** `openssl rand -base64 32`
- **Windows:** Use [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

### 4. Database Setup
Run these commands in order:
```bash
# Start PostgreSQL database with Docker (requires Docker to be running!)
npm run db:up

# Push database schema to create tables
npm run db:push

# Seed database with test data (users, events, etc.)
npm run db:seed
```

### 5. Start the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Troubleshooting

### "Cannot connect to the Docker daemon"
- **Solution:** Start Docker Desktop application or `sudo systemctl start docker` on Linux

### "Database connection failed"
- **Check:** Is Docker running? `docker ps` should show the volunteer_engine container
- **Fix:** Run `npm run db:up` to start the database

### "Port 5432 already in use"
- **Cause:** Another PostgreSQL instance is running
- **Fix:** Stop other PostgreSQL instances or change port in `docker-compose.yml`

## Database Management

```bash
npm run db:up       # Start PostgreSQL with Docker
npm run db:down     # Stop PostgreSQL container  
npm run db:push     # Update database schema
npm run db:seed     # Add test data
npm run db:studio   # Open database viewer (http://localhost:5555)
```

## Docker Details

Our `docker-compose.yml` creates:
- **PostgreSQL 16** database server
- **Database:** `volunteerEngine_dev`
- **Username/Password:** `postgres/postgres`
- **Port:** `5432`
- **Data persistence:** Survives container restarts

## Testing Credentials

For testing purposes, use these pre-configured accounts:

### Admin Account
- **Email:** `admin@test.com`
- **Password:** `admin-pass`
- **Access:** Full admin dashboard and user management features

### Volunteer Account
- **Email:** `volunteer@test.com`
- **Password:** `vol-pass`
- **Access:** Volunteer dashboard and profile management features

## Testing

Run the test suite:
```bash
npm test                # Run all tests
npm run test:coverage   # Run tests with coverage report
```

## Sources used for this project:

For authentication/registration setup: https://nextjs.org/learn/dashboard-app/adding-authentication

