# AutoApply - AI-Powered Job Application Automation System

## Overview
AutoApply automates job applications for users, reducing application time from 30-40 minutes to under 2 minutes.

## Architecture
- **Backend**: Spring Boot unified service (monolithic architecture)
- **Frontend**: React + TailwindCSS
- **Database**: PostgreSQL
- **Cache**: Redis (optional)
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
- Redis 7+ (optional)
- Gradle 8.5+ (or use the included Gradle wrapper)

### Automated Setup

**Windows (PowerShell):**
```powershell
.\setup.ps1
.\database\setup-database.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x setup.sh database/setup-database.sh
./setup.sh
./database/setup-database.sh
```

### Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   # Using Gradle wrapper (recommended)
   ./gradlew build -x test
   
   # Or using installed Gradle
   gradle build -x test
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Database Setup**
   ```bash
   psql -U postgres -c "CREATE DATABASE autoapply;"
   psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

5. **Browser Extension Icons**
   - Open `browser-extension/create-icons.html` in a browser
   - Click "Download All Icons"
   - Save the icons to `browser-extension/icons/`

## Running the Application

### Start All Services (Automated)

**Windows:**
```powershell
.\start-services.ps1
```

**Linux/Mac:**
```bash
./start-services.sh
```

### Start Services Manually

**Backend Service** (unified service):
```bash
# Using Gradle wrapper (recommended)
cd backend
./gradlew :unified-service:bootRun
```

Or using installed Gradle:
```bash
cd backend
gradle :unified-service:bootRun
```

Or use the startup script:
```bash
# Windows
.\start-services.ps1

# Linux/Mac
./start-services.sh
```

**Frontend:**
```bash
cd frontend
npm run dev
```

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

5. Click the extension icon and enter your JWT token (get it from login)

## Features

### ✅ Implemented
- User authentication (JWT)
- Profile management (experiences, education, skills)
- Job description parsing (AI stubbed, ready for integration)
- Resume tailoring (AI stubbed, ready for integration)
- Application tracking
- Browser extension for auto-fill
- API Gateway with routing

### 🚧 Ready for Integration
- AI-powered job parsing (NLP models)
- AI-powered resume tailoring
- ATS scoring algorithm
- Profile enhancement suggestions

## Development Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed development plan.

## Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [ROADMAP.md](./ROADMAP.md) - Development roadmap
- [database/README.md](./database/README.md) - Database setup
- [backend/GRADLE_SETUP.md](./backend/GRADLE_SETUP.md) - Gradle setup guide
- [MAVEN_TO_GRADLE_MIGRATION.md](./MAVEN_TO_GRADLE_MIGRATION.md) - Migration notes

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
