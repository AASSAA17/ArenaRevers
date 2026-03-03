# Скрипт для создания админ аккаунта
Write-Host "=== Создание админ аккаунта ===" -ForegroundColor Cyan
Write-Host ""

cd backend

Write-Host "Запускаю seed скрипт..." -ForegroundColor Yellow
npm run db:seed

Write-Host ""
Write-Host "=== Данные для входа ===" -ForegroundColor Green
Write-Host ""
Write-Host "📧 Email: admin@arenareserve.kz" -ForegroundColor White
Write-Host "🔑 Password: Admin123" -ForegroundColor White
Write-Host ""
Write-Host "✅ Админ аккаунт создан!" -ForegroundColor Green
Write-Host ""
Write-Host "Теперь вы можете войти в админ-панель!" -ForegroundColor Cyan

