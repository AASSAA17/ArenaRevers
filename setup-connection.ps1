# Setup connections script for ArenaReserve
Write-Host "=== ArenaReserve Connection Setup ===" -ForegroundColor Cyan
Write-Host ""

$backendEnv = "backend\.env"

# 1. Setup backend .env
Write-Host "1. Setting up backend..." -ForegroundColor Yellow

if (-not (Test-Path $backendEnv)) {
    Write-Host "   Creating .env file..." -ForegroundColor Green
    Copy-Item "backend\env.example" $backendEnv
}

# Update DATABASE_URL
$envContent = Get-Content $backendEnv -Raw -Encoding UTF8
$newDatabaseUrl = "DATABASE_URL=postgresql://postgres:1234@localhost:5433/arenareserve?schema=public"

if ($envContent -match "DATABASE_URL=.*") {
    $envContent = $envContent -replace "DATABASE_URL=.*", $newDatabaseUrl
    Write-Host "   Updated DATABASE_URL to port 5433" -ForegroundColor Green
}

# Update FRONTEND_URL
if ($envContent -notmatch "FRONTEND_URL=http://localhost:3001") {
    $envContent = $envContent -replace "FRONTEND_URL=.*", "FRONTEND_URL=http://localhost:3001"
    Write-Host "   Updated FRONTEND_URL" -ForegroundColor Green
}

Set-Content $backendEnv $envContent -Encoding UTF8

# 2. Check database connection
Write-Host ""
Write-Host "2. Checking database..." -ForegroundColor Yellow

$env:PGPASSWORD = "1234"
$dbCheck = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d arenareserve -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Database connection OK" -ForegroundColor Green
} else {
    Write-Host "   Database connection failed" -ForegroundColor Red
}

# 3. Apply migrations
Write-Host ""
Write-Host "3. Applying database migrations..." -ForegroundColor Yellow
cd backend
npx prisma db push
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Migrations applied successfully" -ForegroundColor Green
} else {
    Write-Host "   Migration error" -ForegroundColor Red
}
cd ..

# 4. Summary
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the project:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "Check:" -ForegroundColor Yellow
Write-Host "   Backend: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   API: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""
