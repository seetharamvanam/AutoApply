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
.\scripts\setup.ps1

# Set up database
.\database\setup-database.ps1
```

### Linux/Mac (Bash)
```bash
# Make scripts executable
chmod +x scripts/setup.sh scripts/start-services.sh scripts/stop-services.sh database/setup-database.sh

# Run the setup script
./scripts/setup.sh

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

Copy `env.example` to `.env` and update with your values:

```bash
cp env.example .env
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
.\scripts\start-services.ps1
```

**Linux/Mac:**
```bash
./scripts/start-services.sh
```

### Option 2: Start Services Manually

**Backend** (unified Spring Boot service):

```bash
cd backend
./gradlew :unified-service:bootRun
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Service Ports

- Unified Service: `http://localhost:8080`
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
- Ensure the unified backend service is running
- Check CORS configuration (`cors.*`) in `backend/unified-service/src/main/resources/application.yml`
- Verify API proxy in `frontend/vite.config.js`

### Browser Extension Not Working
- Ensure backend is running on `http://localhost:8080`
- Check browser console for errors
- Verify JWT token is valid

## Next Steps

- Read [ROADMAP.md](./ROADMAP.md) for development plan
- Check [README.md](../README.md) for architecture details
- Review API endpoints in the unified service (`/api/**`)

## Getting Help

- Check service logs in `logs/` directory
- Review error messages in browser console
- Verify all prerequisites are installed correctly

