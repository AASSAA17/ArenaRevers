@echo off
echo === Создание базы данных arenareserve ===
echo.

echo Подключение к PostgreSQL на localhost:5433...
echo Пользователь: postgres
echo.

REM Создание базы данных
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE arenareserve;" 2>nul

if errorlevel 1 (
    echo.
    echo Проверка существования базы данных...
    psql -h localhost -p 5433 -U postgres -lqt | findstr /C:"arenareserve" >nul
    if errorlevel 1 (
        echo.
        echo ОШИБКА: Не удалось создать базу данных!
        echo Убедитесь, что:
        echo 1. PostgreSQL запущен на порту 5433
        echo 2. Пароль пользователя postgres: 1234
        echo 3. psql доступен в PATH
        echo.
        echo Попробуйте создать базу вручную:
        echo psql -h localhost -p 5433 -U postgres
        echo CREATE DATABASE arenareserve;
        pause
        exit /b 1
    ) else (
        echo База данных arenareserve уже существует.
    )
) else (
    echo База данных arenareserve успешно создана!
)

echo.
echo Готово!
pause

