# AutoApply Setup Guide

## ✅ Completed Steps

- ✅ Backend: Gradle setup complete
- ✅ Frontend: npm install complete  
- ✅ Environment: .env file created

## 📋 Remaining Setup Steps

### 1. Update Environment Configuration

Edit the `.env` file and update with your actual values:

```env
DB_USERNAME=postgres
DB_PASSWORD=your_actual_postgres_password  # ← Update this!
JWT_SECRET=your-secret-key-change-in-production-min-256-bits  # ← Update this!
```

### 2. Set Up Database

Choose one of these options:

#### Option A: PowerShell Script (if PostgreSQL is in PATH)
```powershell
.\database\setup-database.ps1
```

#### Option B: Manual psql Commands
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE autoapply;"

# Run migrations
psql -U postgres -d autoapply -f database\migrations\001_initial_schema.sql
```

#### Option C: Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click **Databases** → **Create** → **Database**
3. Name: `autoapply`
4. Right-click `autoapply` → **Query Tool**
5. Open file: `database\migrations\001_initial_schema.sql`
6. Click **Execute** (F5)

### 3. Generate Browser Extension Icons

**Option A: Using the HTML Generator**
1. Open `browser-extension\create-icons.html` in your browser
2. Click **"Download All Icons"**
3. Save the downloaded files to `browser-extension\icons\`

**Option B: Create Manually**
Create three PNG files in `browser-extension\icons\`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editor or online icon generator.

## 🚀 Starting the Application

### Start Backend Services

**Option 1: Automated (All services)**
```powershell
.\start-services.ps1
```

**Option 2: Manual (One service at a time)**
```powershell
cd backend

# Terminal 1 - Gateway Service
.\gradlew.bat :gateway-service:bootRun

# Terminal 2 - Auth Service  
.\gradlew.bat :auth-service:bootRun

# Terminal 3 - Profile Service
.\gradlew.bat :profile-service:bootRun

# Terminal 4 - Job Parser Service
.\gradlew.bat :job-parser-service:bootRun

# Terminal 5 - Resume Tailor Service
.\gradlew.bat :resume-tailor-service:bootRun

# Terminal 6 - Application Tracker Service
.\gradlew.bat :application-tracker-service:bootRun
```

### Start Frontend

```powershell
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:3000

## 🔍 Verify Setup

1. **Check Database Connection**
   - Ensure PostgreSQL is running
   - Verify database `autoapply` exists
   - Check tables were created

2. **Check Backend Services**
   - Gateway: http://localhost:8080
   - Auth: http://localhost:8081
   - Profile: http://localhost:8082
   - Job Parser: http://localhost:8083
   - Resume Tailor: http://localhost:8084
   - Application Tracker: http://localhost:8085

3. **Check Frontend**
   - Open http://localhost:3000
   - Should see login page

## 🐛 Troubleshooting

### PostgreSQL Not Found
- Ensure PostgreSQL is installed
- Add PostgreSQL bin directory to PATH:
  - Usually: `C:\Program Files\PostgreSQL\<version>\bin`
- Or use pgAdmin for database setup

### Port Already in Use
- Stop the service using that port
- Or change port in service's `application.yml`

### Database Connection Error
- Check `.env` file has correct password
- Ensure PostgreSQL service is running
- Verify database exists: `psql -U postgres -l`

### Frontend Can't Connect to Backend
- Ensure all backend services are running
- Check CORS configuration
- Verify API proxy in `frontend/vite.config.js`

## 📚 Next Steps

After setup is complete:
1. Register a new user at http://localhost:3000
2. Create your profile
3. Test job parsing
4. Try resume tailoring
5. Track applications

For more details, see:
- [QUICKSTART.md](./QUICKSTART.md)
- [README.md](./README.md)

