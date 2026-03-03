# Docker Setup для ArenaReserve

Этот проект настроен для работы с Docker и Docker Compose.

## Требования

- Docker Desktop (Windows/Mac) или Docker Engine + Docker Compose (Linux)
- Минимум 4GB свободной RAM
- PostgreSQL 18+ установленный и запущенный на localhost:5433
  - Пользователь: postgres
  - Пароль: 1234
  - База данных: arenareserve (будет создана автоматически при миграциях)

## Быстрый старт

### Шаг 1: Создание базы данных

Перед запуском убедитесь, что база данных `arenareserve` создана:

**Вариант А: Через скрипт**
```bash
create-database.bat
```

**Вариант Б: Вручную через psql**
```bash
psql -h localhost -p 5433 -U postgres
CREATE DATABASE arenareserve;
```

**Вариант В: Через SQL файл**
```bash
psql -h localhost -p 5433 -U postgres -f create-database.sql
```

### Production режим

```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes (удалит данные БД!)
docker-compose down -v
```

### Development режим

```bash
# Запуск в режиме разработки с hot reload
docker-compose -f docker-compose.dev.yml up -d --build

# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Остановка
docker-compose -f docker-compose.dev.yml down
```

## Сервисы

После запуска будут доступны:

- **Frontend**: http://localhost:80 (production) или http://localhost:3001 (development)
- **Backend API**: http://localhost:3000/api
- **PostgreSQL**: localhost:5433 (внешняя база данных)
- **Redis**: localhost:6379

**Примечание**: База данных PostgreSQL должна быть запущена отдельно на вашем компьютере. Docker контейнеры подключаются к ней через `host.docker.internal`.

## Переменные окружения

Создайте файл `.env` в корне проекта для настройки секретных ключей:

```env
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
# и другие переменные из backend/env.example
```

## Миграции базы данных

Миграции применяются автоматически при первом запуске. Для ручного применения:

```bash
# Production
docker-compose exec backend npx prisma migrate deploy

# Development
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
```

## Сидирование базы данных

```bash
# Production
docker-compose exec backend npm run db:seed

# Development
docker-compose -f docker-compose.dev.yml exec backend npm run db:seed
```

## Полезные команды

```bash
# Просмотр статуса контейнеров
docker-compose ps

# Перезапуск конкретного сервиса
docker-compose restart backend

# Выполнение команд в контейнере
docker-compose exec backend sh
docker-compose exec database psql -U arenaserve_user -d arenareserve

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

## Устранение проблем

### Проблемы с портами

Если порты заняты, измените их в `docker-compose.yml`:

```yaml
ports:
  - "3000:3000"  # измените первый номер на свободный порт
```

### Очистка данных

```bash
# Удалить все контейнеры, сети и volumes
docker-compose down -v
docker system prune -a
```

### Пересборка без кэша

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Структура

- `docker-compose.yml` - Production конфигурация
- `docker-compose.dev.yml` - Development конфигурация с hot reload
- `backend/Dockerfile` - Production образ бэкенда
- `backend/Dockerfile.dev` - Development образ бэкенда
- `frontend/Dockerfile` - Production образ фронтенда (nginx)
- `frontend/Dockerfile.dev` - Development образ фронтенда (vite dev server)

