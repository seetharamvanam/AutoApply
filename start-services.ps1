# Script to start the unified AutoApply service on Windows (Background Mode - No Windows)
# Usage: .\start-services.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting AutoApply Unified Service (Background Mode)..." -ForegroundColor Blue
Write-Host ""

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
        return -not $connection
    } catch {
        # Fallback method
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        try {
            $listener.Start()
            $listener.Stop()
            return $true
        } catch {
            return $false
        }
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [int]$Port,
        [string]$ServiceName,
        [int]$MaxAttempts = 60
    )
    
    Write-Host "  Waiting for $ServiceName to be ready" -NoNewline -ForegroundColor Gray
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $MaxAttempts -and -not $ready) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port/actuator/health" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $ready = $true
                Write-Host ""
                Write-Host "  ✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        } catch {
            # Service not ready yet
        }
        
        $attempt++
        if ($attempt % 5 -eq 0) {
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
        Start-Sleep -Seconds 1
    }
    
    Write-Host ""
    Write-Host "  ❌ $ServiceName failed to start within $MaxAttempts seconds" -ForegroundColor Red
    return $false
}

# Check if .env exists
if (-Not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Please create it from .env.example" -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)\s*$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}
Write-Host "✅ Environment variables loaded from .env" -ForegroundColor Green

# Check for Gradle wrapper
if (-Not (Test-Path "backend\gradlew.bat")) {
    Write-Host "❌ Gradle wrapper not found. Please run: cd backend && gradle wrapper" -ForegroundColor Red
    exit 1
}

# Create logs directory
if (-Not (Test-Path logs)) {
    New-Item -ItemType Directory -Path logs | Out-Null
}

# Clear previous PID files
@() | Out-File -FilePath ".pids" -Encoding ASCII
@() | Out-File -FilePath ".gradle_pids" -Encoding ASCII
@() | Out-File -FilePath ".job_ids" -Encoding ASCII

# Check port before starting
Write-Host "Checking port 8080..." -ForegroundColor Blue
if (-not (Test-Port -Port 8080)) {
    Write-Host "  ❌ Port 8080 is already in use" -ForegroundColor Red
    Write-Host "  Run: .\stop-services.ps1" -ForegroundColor Cyan
    exit 1
fi

Write-Host "✅ Port 8080 is available" -ForegroundColor Green
Write-Host ""

# Start unified service
Write-Host "Starting Unified Service (port 8080)..." -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$logPath = Join-Path $PSScriptRoot "logs\unified-service.log"

# Prepare environment variables
$envVars = @{}
if ($env:DB_USERNAME) { $envVars['DB_USERNAME'] = $env:DB_USERNAME }
if ($env:DB_PASSWORD) { $envVars['DB_PASSWORD'] = $env:DB_PASSWORD }
if ($env:JWT_SECRET) { $envVars['JWT_SECRET'] = $env:JWT_SECRET }

# Create a script block that will run in background
$scriptBlock = {
    param($BackendPath, $LogPath, $EnvVars)
    
    # Set environment variables
    foreach ($key in $EnvVars.Keys) {
        [Environment]::SetEnvironmentVariable($key, $EnvVars[$key], "Process")
    }
    
    # Change to backend directory and run gradle
    Push-Location $BackendPath
    try {
        & ".\gradlew.bat" ":unified-service:bootRun" *> $LogPath 2>&1
    } finally {
        Pop-Location
    }
}

# Start the job in background (no window)
$job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $backendPath, $logPath, $envVars

# Wait a moment for the process to start
Start-Sleep -Seconds 3

# Find the actual Java process listening on the port
$javaPid = $null
$maxWait = 10
$waitCount = 0

while ($null -eq $javaPid -and $waitCount -lt $maxWait) {
    try {
        $connections = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
        if ($connections) {
            $javaPid = $connections[0].OwningProcess
        }
    } catch {
        # Port not ready yet
    }
    
    if ($null -eq $javaPid) {
        Start-Sleep -Seconds 1
        $waitCount++
    }
}

# Fallback: use job ID if we can't find Java PID
if ($null -eq $javaPid) {
    $javaPid = $job.Id
    Write-Host "  ⚠️  Could not find Java PID, using job ID: $javaPid" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Started (Java PID: $javaPid, Job ID: $($job.Id), Log: logs\unified-service.log)" -ForegroundColor Green
}

# Save PIDs to files
$javaPid | Out-File -FilePath ".pids" -Encoding ASCII -Append
$job.Id | Out-File -FilePath ".job_ids" -Encoding ASCII -Append

# Wait for service to be ready
if (Wait-ForService -Port 8080 -ServiceName "Unified Service") {
    Write-Host ""
    Write-Host "✅ Unified Service started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service Status:" -ForegroundColor Cyan
    Write-Host "  Unified Service:  http://localhost:8080" -ForegroundColor Gray
    Write-Host ""
    Write-Host "API Endpoints:" -ForegroundColor Cyan
    Write-Host "  Auth:            http://localhost:8080/api/auth/**" -ForegroundColor Gray
    Write-Host "  Profile:          http://localhost:8080/api/profile/**" -ForegroundColor Gray
    Write-Host "  Job Parser:       http://localhost:8080/api/jobs/**" -ForegroundColor Gray
    Write-Host "  Resume Tailor:    http://localhost:8080/api/resumes/**" -ForegroundColor Gray
    Write-Host "  App Tracker:      http://localhost:8080/api/applications/**" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Logs are in the logs/ directory:" -ForegroundColor Yellow
    Write-Host "  - logs/unified-service.log" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To stop the service, run: .\stop-services.ps1" -ForegroundColor Cyan
    Write-Host "To view logs, use: Get-Content logs\unified-service.log -Tail 50 -Wait" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to start Unified Service. Check logs\unified-service.log" -ForegroundColor Red
    Stop-Job -Job $job -ErrorAction SilentlyContinue
    Remove-Job -Job $job -ErrorAction SilentlyContinue
    exit 1
}
Write-Host ""
