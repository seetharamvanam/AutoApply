# AutoApply Project Setup Script for Windows PowerShell
# This script sets up the complete AutoApply project

Write-Host "🚀 Starting AutoApply Project Setup..." -ForegroundColor Blue
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Java not found. Please install Java 17+" -ForegroundColor Yellow
    exit 1
}

# Check Gradle
$useWrapper = $false
try {
    $gradleVersion = gradle -v | Select-Object -First 1
    Write-Host "✅ Gradle found: $gradleVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Gradle not found. Checking for Gradle wrapper..." -ForegroundColor Yellow
    if (-Not (Test-Path "backend\gradlew.bat")) {
        Write-Host "⚠️  Gradle wrapper not found. Please install Gradle 8.5+ or use wrapper" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Gradle wrapper found" -ForegroundColor Green
    $useWrapper = $true
}

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Node.js not found. Please install Node.js 18+" -ForegroundColor Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  npm not found. Please install npm" -ForegroundColor Yellow
    exit 1
}

# Check PostgreSQL
$skipDb = $false
try {
    $psqlVersion = psql --version
    Write-Host "✅ PostgreSQL client found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL client not found. Database setup will be skipped." -ForegroundColor Yellow
    $skipDb = $true
}

Write-Host ""
Write-Host "Setting up backend..." -ForegroundColor Cyan
Set-Location backend

# Build backend with Gradle
Write-Host "Building Spring Boot services..." -ForegroundColor Yellow
if ($useWrapper) {
    .\gradlew.bat build -x test
} else {
    gradle build -x test
}

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "Setting up frontend..." -ForegroundColor Cyan
Set-Location frontend

# Install frontend dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Cyan

# Create .env file if it doesn't exist
if (-Not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please update .env with your actual configuration" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
if (-Not $skipDb) {
    Write-Host "Database setup..." -ForegroundColor Cyan
    Write-Host "To set up the database, run:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -c 'CREATE DATABASE autoapply;'"
    Write-Host "  psql -U postgres -d autoapply -f database\migrations\001_initial_schema.sql"
    Write-Host ""
    $response = Read-Host "Do you want to set up the database now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Creating database..."
        psql -U postgres -c "CREATE DATABASE autoapply;" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Database may already exist, continuing..." -ForegroundColor Yellow
        }
        Write-Host "Running migrations..."
        psql -U postgres -d autoapply -f database\migrations\001_initial_schema.sql
        Write-Host "✅ Database setup complete!" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Database setup skipped (PostgreSQL client not found)" -ForegroundColor Yellow
    Write-Host "   To set up manually:" -ForegroundColor Yellow
    Write-Host "   psql -U postgres -c 'CREATE DATABASE autoapply;'"
    Write-Host "   psql -U postgres -d autoapply -f database\migrations\001_initial_schema.sql"
}

Write-Host ""
Write-Host "Creating browser extension icons..." -ForegroundColor Cyan
Set-Location browser-extension\icons

Write-Host "⚠️  Please create icon files manually:" -ForegroundColor Yellow
Write-Host "   - icon16.png (16x16 pixels)" -ForegroundColor Yellow
Write-Host "   - icon48.png (48x48 pixels)" -ForegroundColor Yellow
Write-Host "   - icon128.png (128x128 pixels)" -ForegroundColor Yellow
Write-Host "   You can use any image editor or online icon generator." -ForegroundColor Yellow

Set-Location ..\..

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your database credentials and JWT secret"
Write-Host "2. Start PostgreSQL and Redis services"
Write-Host "3. Start backend services (run each service separately)"
Write-Host "4. Start frontend: cd frontend; npm run dev"
Write-Host "5. Load browser extension from browser-extension folder"
Write-Host ""
Write-Host "To start services:" -ForegroundColor Cyan
if ($useWrapper) {
    Write-Host "  Backend: cd backend; .\gradlew.bat :<service-name>:bootRun"
} else {
    Write-Host "  Backend: cd backend; gradle :<service-name>:bootRun"
}
Write-Host "  Frontend: cd frontend; npm run dev"
Write-Host ""

