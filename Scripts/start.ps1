# Get the directory where this script lives
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Project root (one level up from scripts)
$ProjectRoot = Join-Path $ScriptDir ".."

$BackendPath  = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

Write-Host "Starting backend..."
if (Test-Path $BackendPath) {
    Start-Process powershell -ArgumentList "cd `"$BackendPath`"; python app.py"
} else {
    Write-Error "Backend folder not found: $BackendPath"
}

Write-Host "Starting frontend..."
if (Test-Path $FrontendPath) {
    Start-Process powershell -ArgumentList "cd `"$FrontendPath`"; npm start"
} else {
    Write-Error "Frontend folder not found: $FrontendPath"
}
