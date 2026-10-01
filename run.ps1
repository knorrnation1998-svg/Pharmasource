$ErrorActionPreference = "Stop"
$maxRetries = 5
$retryCount = 0

Write-Host "=== Starting PharmaSource Automation & Recovery Agent ===" -ForegroundColor Cyan

# 1. Kill any stray Node processes holding locks
Write-Host "Cleaning up existing Node processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 2. Force clean locked node_modules if it exists
if (Test-Path "node_modules") {
    Write-Host "Removing locked node_modules directory..." -ForegroundColor Yellow
    # Windows-safe force removal
    cmd /c rmdir /s /q "node_modules" 2>$null
    Start-Sleep -Seconds 1
}

# 3. Robust Install Loop with Network Retry
while ($retryCount -lt $maxRetries) {
    try {
        Write-Host "Attempting package installation (Attempt $($retryCount + 1)/$maxRetries)..." -ForegroundColor Green
        npm install --fetch-retry-mins 2 --fetch-timeout 60000
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Dependencies installed successfully!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Warning "Network connection reset or error caught: $_"
    }

    $retryCount++
    if ($retryCount -ge $maxRetries) {
        Write-Error "Max installation retries reached. Check your network connection."
        exit 1
    }
    
    Write-Host "Network dropped or failed. Retrying in 5 seconds..." -ForegroundColor Magenta
    Start-Sleep -Seconds 5
}

# 4. Start Development Server with Auto-Restart on Crash
Write-Host "=== Launching Next.js Development Server ===" -ForegroundColor Cyan
while ($true) {
    try {
        npm run dev
    } catch {
        Write-Warning "Development server crashed or stopped. Restarting in 3 seconds..."
        Start-Sleep -Seconds 3
    }
}