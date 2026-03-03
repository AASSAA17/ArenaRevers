# Скрипт для генерации 50 футзальных арен
Write-Host "=== 50 футзал алаңы генерациялау ===" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "Қате: backend папкасы табылмады!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

Write-Host "Prisma клиентін генерациялау..." -ForegroundColor Yellow
npx prisma generate
Write-Host ""

Write-Host "Скриптті іске қосып жатырмын..." -ForegroundColor Yellow
node prisma/generate-futsal-arenas.js

Write-Host ""
Write-Host "=== Дайын! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Базада 50 футзал алаңы жасалды!" -ForegroundColor Green
Write-Host ""

Set-Location $scriptPath

