@echo off
echo === Пересборка и перезапуск Backend ===
echo.

echo Остановка backend...
docker-compose -f docker-compose.dev.yml stop backend

echo.
echo Пересборка backend с новыми изменениями...
docker-compose -f docker-compose.dev.yml build --no-cache backend

echo.
echo Запуск backend...
docker-compose -f docker-compose.dev.yml up -d backend

echo.
echo Проверка переменных окружения Stripe...
docker-compose -f docker-compose.dev.yml exec backend sh -c "echo STRIPE_SECRET_KEY: $STRIPE_SECRET_KEY"

echo.
echo Просмотр логов (Ctrl+C для выхода)...
docker-compose -f docker-compose.dev.yml logs -f backend

