@echo off
echo === Генерация 50 арен ===
echo.

cd backend

echo Запускаю скрипт генерации...
call npm run db:generate-arenas

echo.
echo === Готово! ===
echo.
echo Создано 50 арен в базе данных!
echo.
pause

