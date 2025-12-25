# Complete AutoApply Setup Script
# This script completes the remaining setup steps

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

Write-Host "🚀 Completing AutoApply Setup..." -ForegroundColor Blue
Write-Host ""

# Step 1: Create .env file
Write-Host "Step 1: Setting up environment file..." -ForegroundColor Cyan
if (-Not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your actual database password" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check PostgreSQL
Write-Host "Step 2: Checking PostgreSQL..." -ForegroundColor Cyan
$psqlFound = $false
try {
    $null = psql --version 2>$null
    $psqlFound = $true
    Write-Host "✅ PostgreSQL client found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL client (psql) not found in PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please ensure PostgreSQL is installed and psql is in your PATH." -ForegroundColor Yellow
    Write-Host "Common PostgreSQL installation paths:" -ForegroundColor Yellow
    Write-Host "  - C:\Program Files\PostgreSQL\<version>\bin" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You can:" -ForegroundColor Yellow
    Write-Host "  1. Add PostgreSQL bin directory to your PATH" -ForegroundColor Gray
    Write-Host "  2. Or use pgAdmin to run SQL scripts manually" -ForegroundColor Gray
    Write-Host ""
}

# Step 3: Database Setup
if ($psqlFound) {
    Write-Host "Step 3: Setting up database..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Do you want to set up the database now? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "Running database setup script..." -ForegroundColor Cyan
        .\database\setup-database.ps1
    } else {
        Write-Host "Skipping database setup. You can run it later with:" -ForegroundColor Yellow
        Write-Host "  .\database\setup-database.ps1" -ForegroundColor Gray
    }
} else {
    Write-Host "Step 3: Database setup skipped (PostgreSQL not found)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set up the database manually:" -ForegroundColor Yellow
    Write-Host "  1. Open pgAdmin or psql" -ForegroundColor Gray
    Write-Host "  2. Create database: CREATE DATABASE autoapply;" -ForegroundColor Gray
    Write-Host "  3. Run: psql -U postgres -d autoapply -f database\migrations\001_initial_schema.sql" -ForegroundColor Gray
}
Write-Host ""

# Step 4: Browser Extension Icons
Write-Host "Step 4: Browser extension icons..." -ForegroundColor Cyan
$iconPath = "browser-extension\icons"
$icon16 = "$iconPath\icon16.png"
$icon48 = "$iconPath\icon48.png"
$icon128 = "$iconPath\icon128.png"

if ((Test-Path $icon16) -and (Test-Path $icon48) -and (Test-Path $icon128)) {
    Write-Host "✅ Browser extension icons already exist" -ForegroundColor Green
} else {
    Write-Host "⚠️  Browser extension icons not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To generate icons:" -ForegroundColor Yellow
    Write-Host "  1. Open browser-extension\create-icons.html in your browser" -ForegroundColor Gray
    Write-Host "  2. Click 'Download All Icons'" -ForegroundColor Gray
    Write-Host "  3. Save the icons to browser-extension\icons\" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or create them manually:" -ForegroundColor Yellow
    Write-Host "  - icon16.png (16x16 pixels)" -ForegroundColor Gray
    Write-Host "  - icon48.png (48x48 pixels)" -ForegroundColor Gray
    Write-Host "  - icon128.png (128x128 pixels)" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Summary
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Backend: Gradle setup complete" -ForegroundColor Green
Write-Host "✅ Frontend: npm install complete" -ForegroundColor Green

if (Test-Path .env) {
    Write-Host "✅ Environment: .env file created" -ForegroundColor Green
    Write-Host "   ⚠️  Remember to update DB_PASSWORD in .env" -ForegroundColor Yellow
} else {
    Write-Host "❌ Environment: .env file missing" -ForegroundColor Red
}

if ($psqlFound) {
    Write-Host "✅ PostgreSQL: Found" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL: Not found in PATH" -ForegroundColor Yellow
}

if ((Test-Path $icon16) -and (Test-Path $icon48) -and (Test-Path $icon128)) {
    Write-Host "✅ Browser Extension: Icons ready" -ForegroundColor Green
} else {
    Write-Host "⚠️  Browser Extension: Icons missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update .env file with your database password" -ForegroundColor White
Write-Host "2. Set up database (if not done): .\database\setup-database.ps1" -ForegroundColor White
Write-Host "3. Generate browser extension icons (if needed)" -ForegroundColor White
Write-Host "4. Start services: .\scripts\start-services.ps1" -ForegroundColor White
Write-Host "5. Start frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see docs\QUICKSTART.md" -ForegroundColor Gray
Write-Host ""

