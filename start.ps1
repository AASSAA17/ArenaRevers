# Скрипт для запуска всего проекта
Write-Host "=== Запуск ArenaReserve ===" -ForegroundColor Cyan
Write-Host ""

# Проверка установки зависимостей
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Установка зависимостей бэкенда..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Установка зависимостей фронтенда..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Проверка .env файла
if (-not (Test-Path "backend/.env")) {
    Write-Host "Создание .env файла из примера..." -ForegroundColor Yellow
    Copy-Item "backend/env.example" "backend/.env"
    Write-Host ""
    Write-Host "ВАЖНО: Проверьте настройки в backend/.env" -ForegroundColor Red
    Write-Host "Особенно DATABASE_URL (порт 5433, пароль 1234)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Нажмите Enter для продолжения"
}

# Проверка бэкенда перед запуском
Write-Host "Проверка бэкенда..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 1 -ErrorAction Stop
    Write-Host "⚠ Бэкенд уже запущен на порту 3000" -ForegroundColor Yellow
    Write-Host "  Закройте его или используйте другой порт" -ForegroundColor Gray
} catch {
    Write-Host "✓ Порт 3000 свободен" -ForegroundColor Green
}

Write-Host ""
Write-Host "Запуск бэкенда и фронтенда..." -ForegroundColor Green
Write-Host ""
Write-Host "Бэкенд: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Фронтенд: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm run dev

