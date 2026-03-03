# Скрипт для генерации 50 арен
Write-Host "=== Генерация 50 арен ===" -ForegroundColor Cyan
Write-Host ""

cd backend

Write-Host "Запускаю скрипт генерации..." -ForegroundColor Yellow
npm run db:generate-arenas

Write-Host ""
Write-Host "=== Готово! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Создано 50 арен в базе данных!" -ForegroundColor Green
Write-Host ""

