# AutoApply - AI-Powered Job Application Automation System

## Overview
AutoApply automates job applications for users, reducing application time from 30-40 minutes to under 2 minutes.

## Architecture
- **Backend**: Spring Boot unified service (monolithic architecture)
- **Frontend**: React + TailwindCSS
- **Database**: PostgreSQL
- **Auth**: JWT
- **Browser Extension**: Chrome/Edge extension for auto-filling forms
- **Build Tool**: Gradle

## Project Structure
```
AutoApply/
├── backend/              # Spring Boot unified service
│   └── unified-service/  # Single service with all modules
│       ├── auth/         # Authentication module
│       ├── profile/      # User profile module
│       ├── jobparser/    # Job parsing module
│       ├── resumetailor/ # Resume tailoring module
│       └── applicationtracker/ # Application tracking module
├── frontend/             # React application
├── browser-extension/    # Chrome extension
├── database/            # SQL migrations
└── docs/                # Documentation
```

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Gradle (optional; the repo includes the Gradle wrapper so you do not need to install Gradle)

### 1) Configure environment (.env)

Create a `.env` file in the repo root:

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env
```

**macOS/Linux (Bash):**
```bash
cp env.example .env
```

Edit `.env` and set at minimum:
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

### 2) Create DB and run migrations

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE autoapply;"
```

Apply migrations in order (run from the repo root):

```bash
psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql
psql -U postgres -d autoapply -f database/migrations/002_add_password_reset_tokens.sql
psql -U postgres -d autoapply -f database/migrations/003_update_job_application_statuses.sql
```

## Running the Application

### Backend (Spring Boot unified service)

**Windows (PowerShell):**
```powershell
cd backend
.\gradlew.bat :unified-service:build -x test
.\gradlew.bat :unified-service:bootRun
```

**macOS/Linux (Bash):**
```bash
cd backend
./gradlew :unified-service:build -x test
./gradlew :unified-service:bootRun
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Browser Extension Icons (one-time)

- Open `browser-extension/create-icons.html` in a browser
- Click "Download All Icons"
- Save the icons to `browser-extension/icons/`

### Notes

- The backend reads variables from `.env` on startup (for local development).
- If the frontend can’t reach the backend, confirm the backend is running on `http://localhost:8080` and check the proxy in `frontend/vite.config.js`.

## Service Ports

- Unified Service: `http://localhost:8080`
  - Auth API: `/api/auth/**`
  - Profile API: `/api/profile/**`
  - Job Parser API: `/api/jobs/**`
  - Resume Tailor API: `/api/resumes/**`
  - Application Tracker API: `/api/applications/**`
- Frontend: `http://localhost:3000`

## Browser Extension Setup

1. Open Chrome/Edge and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. Enable "Developer mode" (toggle in top right)

3. Click "Load unpacked"

4. Select the `browser-extension` folder

5. Click the extension icon and login or enter your JWT token
6. Click "Auto Apply (Supervised)" to fill fields, review on-page, then proceed to Next/Submit

## Features

### ✅ Implemented
- User authentication (JWT)
- Profile management (experiences, education, skills)
- Job description parsing (AI stubbed, ready for integration)
- Resume tailoring (AI stubbed, ready for integration)
- Application tracking
- Browser extension for auto-fill
- **🤖 Intelligent Form Automation** - AI-powered page analysis and automated form filling

### 🚧 Ready for Integration
- AI-powered job parsing (NLP models)
- AI-powered resume tailoring
- **AI-powered page analysis** (OpenAI GPT-4 Vision, Claude, etc.)
- ATS scoring algorithm
- Profile enhancement suggestions

## Development Roadmap

See [ROADMAP.md](./docs/ROADMAP.md) for detailed development plan.

## Documentation

- [ROADMAP.md](./docs/ROADMAP.md) - Development roadmap
- [database/README.md](./database/README.md) - Database setup
- [backend/GRADLE_SETUP.md](./backend/GRADLE_SETUP.md) - Gradle setup guide
- [MAVEN_TO_GRADLE_MIGRATION.md](./docs/MAVEN_TO_GRADLE_MIGRATION.md) - Migration notes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile/{userId}` - Get user profile
- `POST /api/profile/{userId}` - Create/update profile
- `PUT /api/profile/{userId}` - Update profile

### Job Parser
- `POST /api/jobs/parse` - Parse job description

### Resume Tailor
- `POST /api/resumes/tailor` - Tailor resume to job

### Form Automation (NEW)
- `POST /api/automation/analyze` - Analyze page and generate automation plan

### Applications
- `GET /api/applications/user/{userId}` - Get user applications
- `POST /api/applications` - Create application
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
