# AutoApply

A minimal job application tracking system built with Spring Boot and a Chrome extension.

## Overview

AutoApply helps you organize and manage your job applications. Track applications, store job details, and manage your job search from a simple browser extension.

## Tech Stack

- **Backend**: Spring Boot 3.2 (Java 17) with Gradle
- **Database**: PostgreSQL
- **Authentication**: JWT + OAuth2 (Google & GitHub)
- **Browser Extension**: Chrome/Edge extension (Manifest V3)

## Features

### Authentication
- JWT-based password authentication
- OAuth2 login with Google & GitHub
- Secure password hashing (BCrypt)
- Stateless sessions

### Job Tracking
- Create and manage job applications
- Track application status (SAVED, APPLIED, SCREENING, INTERVIEW, etc.)
- Store job details (title, company, URL, description, notes)
- View all your applications in one place

### Browser Extension
- Simple login interface
- View your job applications
- Token-based authentication

## Project Structure

```
AutoApply/
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/autoapply/
│   │   │   │   ├── auth/        # Authentication (JWT + OAuth2)
│   │   │   │   │   ├── config/  # Security configuration
│   │   │   │   │   ├── controller/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entity/
│   │   │   │   │   ├── filter/
│   │   │   │   │   ├── handler/
│   │   │   │   │   ├── repository/
│   │   │   │   │   └── service/
│   │   │   │   ├── job/         # Job application tracking
│   │   │   │   │   ├── controller/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entity/
│   │   │   │   │   ├── repository/
│   │   │   │   │   └── service/
│   │   │   │   ├── common/      # Exception handling
│   │   │   │   │   └── exception/
│   │   │   │   └── AutoApplyApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── build.gradle
│   └── settings.gradle
├── browser-extension/          # Chrome extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   └── icons/
├── database/
│   └── migrations/             # SQL migration files
└── README.md
```

## Prerequisites

- Java 17 or higher
- PostgreSQL 14 or higher
- Gradle (wrapper included, no installation needed)
- Chrome or Edge browser (for extension)

## Setup

### Database Setup

1. Create the database:
```sql
CREATE DATABASE autoapply;
```

2. Run migrations in order (from repository root):
```bash
psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql
psql -U postgres -d autoapply -f database/migrations/002_add_password_reset_tokens.sql
psql -U postgres -d autoapply -f database/migrations/003_update_job_application_statuses.sql
```

### Running the Backend

**Windows:**
```powershell
cd backend
.\gradlew.bat bootRun
```

**macOS/Linux:**
```bash
cd backend
./gradlew bootRun
```

The backend will start on `http://localhost:8080`.

### Browser Extension Setup

1. Open Chrome/Edge and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. Enable "Developer mode" (toggle in top right)

3. Click "Load unpacked"

4. Select the `browser-extension` folder

5. Click the extension icon and login with your credentials

## API Endpoints

Base URL: `http://localhost:8080/api`

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- `POST /api/auth/login` - Login and get JWT token
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  Returns: `{ "accessToken": "...", "userId": 1, "email": "...", ... }`

- OAuth2 endpoints (browser redirects):
  - `/login/oauth2/code/google` - Google OAuth2 login
  - `/login/oauth2/code/github` - GitHub OAuth2 login

### Jobs

All job endpoints require authentication via `Authorization: Bearer <token>` header.

- `POST /api/jobs` - Create a new job application
  ```json
  {
    "title": "Software Engineer",
    "company": "Tech Corp",
    "url": "https://example.com/job/123",
    "description": "Job description here",
    "status": "SAVED",
    "notes": "Optional notes"
  }
  ```

- `GET /api/jobs` - List all job applications for the authenticated user

- `GET /api/jobs/{id}` - Get a specific job application by ID

- `PUT /api/jobs/{id}` - Update a job application
  ```json
  {
    "title": "Updated Title",
    "status": "APPLIED",
    "notes": "Updated notes"
  }
  ```

- `DELETE /api/jobs/{id}` - Delete a job application

## Development

### Build

```bash
cd backend
./gradlew build
```

### Run Tests

```bash
cd backend
./gradlew test
```

## Configuration

Configuration is managed via `application.properties` and environment variables. Key properties:

- Database connection: `spring.datasource.*` (reads from environment variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`)
- JWT: `jwt.secret`, `jwt.expiration-ms`
- OAuth2: `spring.security.oauth2.client.registration.*` (Google & GitHub client IDs and secrets)
- Server port: `server.port` (default: 8080)
- CORS: Configured for localhost:3000 and browser extensions

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the project structure guidelines
3. Test your changes
4. Commit with clear messages
5. Push and create a pull request
