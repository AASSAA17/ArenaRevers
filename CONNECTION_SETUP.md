# Настройка подключений ArenaReserve

## Текущие настройки

### База данных (PostgreSQL)
- **Порт:** 5433
- **Пароль:** 1234
- **База данных:** arenareserve
- **Пользователь:** postgres
- **URL:** `postgresql://postgres:1234@localhost:5433/arenareserve?schema=public`

### Бэкенд (Node.js/Express)
- **Порт:** 3000
- **API:** `http://localhost:3000/api`
- **Health Check:** `http://localhost:3000/health`
- **CORS:** Разрешен для `http://localhost:3001`

### Фронтенд (React/Vite)
- **Порт:** 3001
- **URL:** `http://localhost:3001`
- **API Base URL:** `http://localhost:3000/api`

## Быстрая настройка

### Вариант 1: Автоматическая настройка
```powershell
.\setup-connection.ps1
```

### Вариант 2: Ручная настройка

1. **Настройка .env в бэкенде:**
   - Файл: `backend/.env`
   - Убедитесь, что `DATABASE_URL` указывает на порт 5433:
     ```
     DATABASE_URL=postgresql://postgres:1234@localhost:5433/arenareserve?schema=public
     ```
   - Убедитесь, что `FRONTEND_URL` правильный:
     ```
     FRONTEND_URL=http://localhost:3001
     ```

2. **Применение миграций:**
   ```bash
   cd backend
   npx prisma db push
   ```

3. **Проверка подключений:**
   ```powershell
   .\test-connections.ps1
   ```

## Запуск проекта

### Один командой:
```bash
npm run dev
```

### Или через скрипты:
- **PowerShell:** `.\start.ps1`
- **Batch:** `start.bat` (двойной клик)

## Проверка работы

После запуска проверьте:

1. **База данных:**
   ```powershell
   $env:PGPASSWORD="1234"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d arenareserve -c "SELECT COUNT(*) FROM information_schema.tables;"
   ```

2. **Бэкенд API:**
   - Откройте: http://localhost:3000/health
   - Должен вернуть: `{"status":"ok","timestamp":"..."}`

3. **Фронтенд:**
   - Откройте: http://localhost:3001
   - Должна открыться главная страница

4. **API Endpoint:**
   - Откройте: http://localhost:3000/api/arenas
   - Должен вернуть список арен (может быть пустым)

## Решение проблем

### База данных не подключается
1. Проверьте, что PostgreSQL запущен
2. Проверьте порт: `5433`
3. Проверьте пароль: `1234`
4. Проверьте, что база `arenareserve` создана

### Бэкенд не запускается
1. Проверьте `.env` файл в `backend/`
2. Убедитесь, что `DATABASE_URL` правильный
3. Проверьте логи в консоли

### Фронтенд не подключается к API
1. Убедитесь, что бэкенд запущен на порту 3000
2. Проверьте CORS настройки в `backend/src/server.js`
3. Проверьте `frontend/src/config/api.ts` - должен быть `http://localhost:3000/api`

### CORS ошибки
- Убедитесь, что в `backend/.env` указано: `FRONTEND_URL=http://localhost:3001`
- Перезапустите бэкенд после изменения `.env`

## Полезные команды

```bash
# Проверка подключений
.\test-connections.ps1

# Настройка подключений
.\setup-connection.ps1

# Запуск всего проекта
npm run dev

# Только бэкенд
cd backend && npm run dev

# Только фронтенд
cd frontend && npm run dev

# Применение миграций
cd backend && npx prisma db push

# Просмотр базы данных
cd backend && npm run db:studio
```

