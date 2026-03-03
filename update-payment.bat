@echo off
echo ========================================
echo Обновление системы оплаты (без Stripe API)
echo ========================================
echo.

echo Остановка backend...
docker-compose -f docker-compose.dev.yml stop backend

echo.
echo Пересборка backend с новым mock сервисом оплаты...
docker-compose -f docker-compose.dev.yml build --no-cache backend

echo.
echo Запуск backend...
docker-compose -f docker-compose.dev.yml up -d backend

echo.
echo ========================================
echo Готово! Система оплаты обновлена.
echo.
echo Теперь оплата работает БЕЗ Stripe API:
echo - Любые данные карты принимаются
echo - Оплата всегда успешна
echo - Предупреждение Stripe исчезнет
echo ========================================
echo.
echo Просмотр логов (Ctrl+C для выхода)...
docker-compose -f docker-compose.dev.yml logs -f backend

