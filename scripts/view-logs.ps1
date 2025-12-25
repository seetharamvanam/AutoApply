# Script to view service logs
# Usage: .\view-logs.ps1 [service-name]
# Examples:
#   .\view-logs.ps1              # Show all logs
#   .\view-logs.ps1 gateway      # Show only gateway logs
#   .\view-logs.ps1 auth -Tail 20 # Show last 20 lines of auth logs

param(
    [string]$Service = "all",
    [int]$Tail = 50
)

Write-Host "📋 Viewing Service Logs" -ForegroundColor Cyan
Write-Host ""

$services = @{
    "gateway" = "Gateway Service"
    "auth" = "Auth Service"
    "profile" = "Profile Service"
    "job-parser" = "Job Parser Service"
    "resume-tailor" = "Resume Tailor Service"
    "application-tracker" = "Application Tracker Service"
}

if (-Not (Test-Path logs)) {
    Write-Host "❌ Logs directory not found. Services may not have been started yet." -ForegroundColor Red
    exit 1
}

if ($Service -eq "all") {
    Write-Host "Showing last $Tail lines of all service logs:" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($key in $services.Keys) {
        $logFile = "logs\$key.log"
        if (Test-Path $logFile) {
            Write-Host "=== $($services[$key]) ===" -ForegroundColor Green
            Get-Content $logFile -Tail $Tail -ErrorAction SilentlyContinue
            Write-Host ""
        } else {
            Write-Host "⚠️  Log file not found: $logFile" -ForegroundColor Yellow
            Write-Host ""
        }
    }
} else {
    $logFile = "logs\$Service.log"
    if (Test-Path $logFile) {
        Write-Host "=== $($services[$Service]) ===" -ForegroundColor Green
        Write-Host "Showing last $Tail lines:" -ForegroundColor Yellow
        Write-Host ""
        Get-Content $logFile -Tail $Tail
    } else {
        Write-Host "❌ Log file not found: $logFile" -ForegroundColor Red
        Write-Host ""
        Write-Host "Available services:" -ForegroundColor Yellow
        $services.Keys | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    }
}

Write-Host ""




