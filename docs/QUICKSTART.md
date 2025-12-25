# AutoApply Quick Start Guide

## Prerequisites

Before starting, ensure you have installed:
- **Java 17+** (check with `java -version`)
- **Gradle 8.5+** (check with `gradle -v`) - or use the included Gradle wrapper
- **Node.js 18+** (check with `node -v`)
- **PostgreSQL 14+** (check with `psql --version`)
- **Redis 7+** (optional, for caching)

## Quick Setup (Automated)

### Windows (PowerShell)
```powershell
# Run the setup script
.\setup.ps1

# Set up database
.\database\setup-database.ps1
```

### Linux/Mac (Bash)
```bash
# Make scripts executable
chmod +x setup.sh start-services.sh stop-services.sh database/setup-database.sh

# Run the setup script
./setup.sh

# Set up database
./database/setup-database.sh
```

## Manual Setup

### 1. Backend Setup

**Using Gradle Wrapper (Recommended):**
```bash
cd backend
chmod +x gradlew  # Linux/Mac only
./gradlew build -x test
```

**Using Installed Gradle:**
```bash
cd backend
gradle build -x test
```

**Note:** If you don't have Gradle installed, the wrapper will download it automatically on first use.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE autoapply;"

# Run migrations
psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production-min-256-bits
```

### 5. Browser Extension Icons

Create icon files in `browser-extension/icons/`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editor or online icon generator.

## Starting the Application

### Option 1: Start All Services (Automated)

**Windows:**
```powershell
.\start-services.ps1
```

**Linux/Mac:**
```bash
./start-services.sh
```

### Option 2: Start Services Manually

**Backend Services** (run each in a separate terminal):

**Using Gradle Wrapper:**
```bash
# Terminal 1 - Gateway Service
cd backend
./gradlew :gateway-service:bootRun

# Terminal 2 - Auth Service
cd backend
./gradlew :auth-service:bootRun

# Terminal 3 - Profile Service
cd backend
./gradlew :profile-service:bootRun

# Terminal 4 - Job Parser Service
cd backend
./gradlew :job-parser-service:bootRun

# Terminal 5 - Resume Tailor Service
cd backend
./gradlew :resume-tailor-service:bootRun

# Terminal 6 - Application Tracker Service
cd backend
./gradlew :application-tracker-service:bootRun
```

**Using Installed Gradle:**
```bash
# Terminal 1 - Gateway Service
cd backend
gradle :gateway-service:bootRun

# Terminal 2 - Auth Service
cd backend
gradle :auth-service:bootRun

# Terminal 3 - Profile Service
cd backend
gradle :profile-service:bootRun

# Terminal 4 - Job Parser Service
cd backend
gradle :job-parser-service:bootRun

# Terminal 5 - Resume Tailor Service
cd backend
gradle :resume-tailor-service:bootRun

# Terminal 6 - Application Tracker Service
cd backend
gradle :application-tracker-service:bootRun
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Service Ports

- Gateway Service: `http://localhost:8080`
- Auth Service: `http://localhost:8081`
- Profile Service: `http://localhost:8082`
- Job Parser Service: `http://localhost:8083`
- Resume Tailor Service: `http://localhost:8084`
- Application Tracker Service: `http://localhost:8085`
- Frontend: `http://localhost:3000`

## Browser Extension Setup

1. Open Chrome/Edge and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. Enable "Developer mode" (toggle in top right)

3. Click "Load unpacked"

4. Select the `browser-extension` folder

5. Click the extension icon and enter your JWT token (get it from login)

## Testing the Application

1. **Start all services** (see above)

2. **Access the frontend**: Open `http://localhost:3000`

3. **Register a new user**:
   - Click "Sign up"
   - Enter email and password
   - Click "Sign up"

4. **Create your profile**:
   - Navigate to Profile page
   - Fill in your information
   - Click "Save Profile"

5. **Test job parsing**:
   - Go to Job Analyzer page
   - Paste a job description
   - Click "Analyze Job Description"

6. **Test resume tailoring**:
   - Go to Resume Tailor page
   - Enter job description
   - Click "Tailor Resume"

7. **Track applications**:
   - Go to Applications page
   - Click "Add Application"
   - Fill in job details
   - Track status updates

## Troubleshooting

### Port Already in Use
If a port is already in use, either:
- Stop the service using that port
- Change the port in the service's `application.yml`

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Frontend Can't Connect to Backend
- Ensure all backend services are running
- Check CORS configuration in gateway-service
- Verify API proxy in `frontend/vite.config.js`

### Browser Extension Not Working
- Ensure backend is running on `http://localhost:8080`
- Check browser console for errors
- Verify JWT token is valid

## Next Steps

- Read [ROADMAP.md](./ROADMAP.md) for development plan
- Check [README.md](./README.md) for architecture details
- Review API documentation in each service

## Getting Help

- Check service logs in `logs/` directory
- Review error messages in browser console
- Verify all prerequisites are installed correctly

