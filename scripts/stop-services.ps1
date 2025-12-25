# Script to stop all AutoApply services on Windows
# Usage: .\stop-services.ps1

$ErrorActionPreference = "Continue"

Write-Host "🛑 Stopping AutoApply Services..." -ForegroundColor Yellow
Write-Host ""

$stoppedCount = 0
$failedCount = 0

# Function to stop a process gracefully
function Stop-ProcessGracefully {
    param([int]$Pid)
    
    try {
        $process = Get-Process -Id $Pid -ErrorAction Stop
        Write-Host "  Stopping PID $Pid ($($process.ProcessName))..." -ForegroundColor Cyan
        
        # Try graceful shutdown first
        $process.CloseMainWindow() | Out-Null
        Start-Sleep -Seconds 2
        
        # If still running, force stop
        if (-not $process.HasExited) {
            Stop-Process -Id $Pid -Force -ErrorAction SilentlyContinue
        }
        
        $script:stoppedCount++
        return $true
    } catch {
        Write-Host "  ⚠️  Process $Pid not found (may have already stopped)" -ForegroundColor Yellow
        $script:failedCount++
        return $false
    }
}

# Stop Java processes (services)
if (Test-Path .pids) {
    Write-Host "Stopping Java processes..." -ForegroundColor Cyan
    $pids = Get-Content .pids | Where-Object { $_ -match '^\d+$' }
    
    foreach ($pid in $pids) {
        Stop-ProcessGracefully -Pid ([int]$pid) | Out-Null
    }
    
    Remove-Item .pids -Force -ErrorAction SilentlyContinue
}

# Stop PowerShell jobs
if (Test-Path .job_ids) {
    Write-Host "Stopping PowerShell jobs..." -ForegroundColor Cyan
    $jobIds = Get-Content .job_ids | Where-Object { $_ -match '^\d+$' }
    
    foreach ($jobId in $jobIds) {
        try {
            $job = Get-Job -Id ([int]$jobId) -ErrorAction Stop
            Write-Host "  Stopping job $jobId..." -ForegroundColor Cyan
            Stop-Job -Job $job -ErrorAction SilentlyContinue
            Remove-Job -Job $job -ErrorAction SilentlyContinue
            $stoppedCount++
        } catch {
            # Job may have already completed
        }
    }
    
    Remove-Item .job_ids -Force -ErrorAction SilentlyContinue
}

# Fallback: Try to find processes by port
if (-Not (Test-Path .pids) -and -Not (Test-Path .job_ids)) {
    Write-Host "No PID files found. Searching for processes by port..." -ForegroundColor Cyan
    Write-Host ""
    
    $ports = @(8080, 8081, 8082, 8083, 8084, 8085)
    $found = $false
    
    foreach ($port in $ports) {
        try {
            $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($connections) {
                $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
                
                foreach ($pid in $pids) {
                    try {
                        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($process -and $process.ProcessName -like "*java*") {
                            Write-Host "  Found Java process on port $port (PID: $pid)" -ForegroundColor Cyan
                            if (Stop-ProcessGracefully -Pid $pid) {
                                $found = $true
                            }
                        }
                    } catch {
                        # Process may have already stopped
                    }
                }
            }
        } catch {
            # Port may not be in use
        }
    }
    
    if (-not $found) {
        Write-Host "  No running services found on ports 8080-8085" -ForegroundColor Gray
    }
}

Write-Host ""
if ($stoppedCount -gt 0) {
    Write-Host "✅ Stopped $stoppedCount process(es)" -ForegroundColor Green
}
if ($failedCount -gt 0) {
    Write-Host "⚠️  $failedCount process(es) were not running" -ForegroundColor Yellow
}
if ($stoppedCount -eq 0 -and $failedCount -eq 0) {
    Write-Host "ℹ️  No services were running" -ForegroundColor Gray
}
Write-Host ""

