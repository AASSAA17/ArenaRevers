# Check if backend is running
Write-Host "=== Checking Backend Status ===" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend is running on http://localhost:3000" -ForegroundColor Green
        Write-Host "  Status: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start backend:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Or start everything:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Testing API endpoint..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/arenas" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✓ API endpoint is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ API endpoint returned: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

