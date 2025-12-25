# Database setup script for AutoApply (Windows PowerShell)
# Usage: .\database\setup-database.ps1

Write-Host "🗄️  Setting up AutoApply Database..." -ForegroundColor Blue
Write-Host ""

# Default values
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "autoapply" }
$MIGRATION_FILE = "database\migrations\001_initial_schema.sql"

# Check if PostgreSQL is available
try {
    $null = psql --version
} catch {
    Write-Host "❌ PostgreSQL client (psql) not found" -ForegroundColor Red
    Write-Host "Please install PostgreSQL and ensure psql is in your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "Using database: $DB_NAME" -ForegroundColor Cyan
Write-Host "Using user: $DB_USER" -ForegroundColor Cyan
Write-Host ""

# Prompt for password
$securePassword = Read-Host "Enter PostgreSQL password for user $DB_USER" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Create database
Write-Host "Creating database '$DB_NAME'..." -ForegroundColor Cyan
$env:PGPASSWORD = $DB_PASSWORD
psql -U $DB_USER -h localhost -c "CREATE DATABASE $DB_NAME;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database '$DB_NAME' may already exist, continuing..." -ForegroundColor Yellow
}

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Cyan
psql -U $DB_USER -h localhost -d $DB_NAME -f $MIGRATION_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database '$DB_NAME' is ready to use." -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}

$env:PGPASSWORD = $null

