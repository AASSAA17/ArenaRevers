@echo off
echo === Создание админ аккаунта ===
echo.

cd backend

echo Запускаю seed скрипт...
call npm run db:seed

echo.
echo === Данные для входа ===
echo.
echo Email: admin@arenareserve.kz
echo Password: Admin123
echo.
echo Админ аккаунт создан!
echo.
echo Теперь вы можете войти в админ-панель!
pause

