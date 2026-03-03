# Test all connections
Write-Host "=== Testing ArenaReserve Connections ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Database
Write-Host "1. Testing Database Connection..." -ForegroundColor Yellow
$env:PGPASSWORD = "1234"
$dbTest = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d arenareserve -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Database: OK" -ForegroundColor Green
} else {
    Write-Host "   Database: FAILED" -ForegroundColor Red
}

# Test 2: Backend API
Write-Host ""
Write-Host "2. Testing Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   Backend API: OK (http://localhost:3000)" -ForegroundColor Green
    }
} catch {
    Write-Host "   Backend API: NOT RUNNING (start with: cd backend && npm run dev)" -ForegroundColor Red
}

# Test 3: Frontend
Write-Host ""
Write-Host "3. Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   Frontend: OK (http://localhost:3001)" -ForegroundColor Green
    }
} catch {
    Write-Host "   Frontend: NOT RUNNING (start with: cd frontend && npm run dev)" -ForegroundColor Red
}

# Test 4: API Endpoint
Write-Host ""
Write-Host "4. Testing API Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/arenas" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   API Endpoint: OK (http://localhost:3000/api)" -ForegroundColor Green
    }
} catch {
    Write-Host "   API Endpoint: NOT ACCESSIBLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start everything:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""

