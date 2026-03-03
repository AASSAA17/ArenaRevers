# Инструкция по настройке проекта

## Копирование файлов

После создания структуры Backend/ и Frontend/, необходимо скопировать оставшиеся файлы:

### Backend

Скопируйте следующие файлы/папки из корня в `Backend/`:

```bash
# Из корня проекта в Backend/
- src/ → Backend/src/ (все файлы)
- prisma/ → Backend/prisma/ (все файлы)
```

Все файлы из `src/` должны быть скопированы в `Backend/src/`:
- config/
- controllers/
- middleware/
- routes/
- services/
- utils/
- workers/
- jobs/
- server.js

### Frontend

Скопируйте все файлы из `C:\Users\ajtka\Downloads\Brand Identity and Components` в `Frontend/`:

```bash
# Скопируйте все файлы из Downloads в Frontend/
- index.html
- package.json
- src/
- vite.config.ts (уже обновлен)
- и все остальные файлы
```

## После копирования

1. Установите зависимости:
   ```bash
   cd Backend && npm install
   cd ../Frontend && npm install
   ```

2. Настройте .env файлы (см. README.md)

3. Запустите миграции:
   ```bash
   cd Backend
   npm run db:migrate
   ```

4. Запустите серверы (в разных терминалах):
   ```bash
   # Терминал 1: Backend
   cd Backend && npm run dev
   
   # Терминал 2: Frontend
   cd Frontend && npm run dev
   ```

