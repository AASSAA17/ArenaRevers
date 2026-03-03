# Быстрый старт с Docker

## 🚀 Запуск проекта

### Шаг 0: Создание базы данных

Перед запуском создайте базу данных `arenareserve`:
```bash
create-database.bat
```

Или вручную:
```bash
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE arenareserve;"
```

### Вариант 1: Использование скрипта (Windows)
```bash
docker-start.bat
```

### Вариант 2: Ручной запуск

**Production режим:**
```bash
docker-compose up -d --build
```

**Development режим:**
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## 📍 Доступ к сервисам

После запуска:

- **Frontend**: http://localhost:80 (production) или http://localhost:3001 (development)
- **Backend API**: http://localhost:3000/api
- **PostgreSQL**: localhost:5433 (внешняя база данных)
- **Redis**: localhost:6379

## 🔧 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Выполнение команд в контейнере
docker-compose exec backend sh
docker-compose exec database psql -U arenaserve_user -d arenareserve
```

## ⚙️ Настройка переменных окружения

Создайте файл `.env` в корне проекта (см. `backend/env.example` для примера).

## 📝 Применение миграций

Миграции применяются автоматически при первом запуске. Для ручного применения:

```bash
docker-compose exec backend npx prisma migrate deploy
```

## 🌱 Сидирование базы данных

```bash
docker-compose exec backend npm run db:seed
```

Подробная документация: см. `README.Docker.md`

