@echo off
echo === Запуск ArenaReserve ===
echo.

REM Проверка установки зависимостей
if not exist "backend\node_modules" (
    echo Установка зависимостей бэкенда...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Установка зависимостей фронтенда...
    cd frontend
    call npm install
    cd ..
)

REM Проверка .env файла
if not exist "backend\.env" (
    echo Создание .env файла из примера...
    copy "backend\env.example" "backend\.env"
    echo.
    echo ВАЖНО: Проверьте настройки в backend\.env
    echo Особенно DATABASE_URL (порт 5433, пароль 1234)
    echo.
    pause
)

REM Запуск обоих серверов
echo Запуск бэкенда и фронтенда...
echo.
echo Бэкенд: http://localhost:3000
echo Фронтенд: http://localhost:3001
echo.
echo Для остановки нажмите Ctrl+C
echo.

call npm run dev

