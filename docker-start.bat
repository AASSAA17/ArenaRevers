@echo off
echo === Запуск ArenaReserve в Docker ===
echo.

REM Проверка наличия Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Docker не установлен или не запущен!
    echo Пожалуйста, установите Docker Desktop и запустите его.
    pause
    exit /b 1
)

echo Выберите режим запуска:
echo 1. Production (оптимизированный, без hot reload)
echo 2. Development (с hot reload для разработки)
echo.
set /p mode="Введите номер (1 или 2): "

if "%mode%"=="1" (
    echo.
    echo Запуск в Production режиме...
    docker-compose up -d --build
    if errorlevel 1 (
        echo ОШИБКА при запуске контейнеров!
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo Сервисы запущены!
    echo Frontend: http://localhost:80
    echo Backend API: http://localhost:3000/api
    echo ========================================
    echo.
    echo Для просмотра логов: docker-compose logs -f
    echo Для остановки: docker-compose down
    echo.
) else if "%mode%"=="2" (
    echo.
    echo Запуск в Development режиме...
    docker-compose -f docker-compose.dev.yml up -d --build
    if errorlevel 1 (
        echo ОШИБКА при запуске контейнеров!
        pause
        exit /b 1
    )
    echo.
    echo ========================================
    echo Сервисы запущены в режиме разработки!
    echo Frontend: http://localhost:3001
    echo Backend API: http://localhost:3000/api
    echo ========================================
    echo.
    echo Для просмотра логов: docker-compose -f docker-compose.dev.yml logs -f
    echo Для остановки: docker-compose -f docker-compose.dev.yml down
    echo.
) else (
    echo Неверный выбор!
    pause
    exit /b 1
)

pause

