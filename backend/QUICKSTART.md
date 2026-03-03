# Быстрый старт ArenaReserve Backend

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка базы данных

1. Создайте PostgreSQL базу данных:
```sql
CREATE DATABASE arenareserve;
```

2. Настройте `.env` файл:
```bash
cp .env.example .env
# Отредактируйте .env и укажите DATABASE_URL
```

3. Запустите миграции:
```bash
npm run db:migrate
```

4. (Опционально) Заполните тестовыми данными:
```bash
npm run db:seed
```

## Шаг 3: Настройка Redis

Убедитесь, что Redis запущен:
```bash
# Windows (если установлен)
redis-server

# Linux/Mac
sudo systemctl start redis
# или
redis-server
```

## Шаг 4: Запуск сервера

### Development режим:
```bash
npm run dev
```

### Production режим:
```bash
npm start
```

Сервер будет доступен на `http://localhost:3000`

## Шаг 5: Запуск воркеров (опционально)

В отдельном терминале:
```bash
npm run workers
```

## Тестирование API

### 1. Регистрация пользователя

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Тест Пользователь",
    "email": "test@example.com",
    "phone": "+77001234567",
    "password": "password123"
  }'
```

### 2. Вход

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Сохраните `accessToken` из ответа.

### 3. Получить список арен

```bash
curl -X GET http://localhost:3000/api/arenas \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Создать арену (требуется роль OWNER)

Используйте тестового пользователя из seed:
- Email: `owner@arenareserve.kz`
- Password: `owner123`

```bash
curl -X POST http://localhost:3000/api/arenas \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Тестовая арена",
    "sportType": "football",
    "address": "Алматы, ул. Тестовая, 1",
    "pricePerHour": 5000
  }'
```

## Тестовые пользователи (после seed)

После выполнения `npm run db:seed`:

- **Admin**: `admin@arenareserve.kz` / `admin123`
- **Owner**: `owner@arenareserve.kz` / `owner123`
- **User**: `user@arenareserve.kz` / `user123`

## Проверка работоспособности

```bash
curl http://localhost:3000/health
```

Должен вернуть:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Prisma Studio (GUI для БД)

```bash
npm run db:studio
```

Откроется веб-интерфейс на `http://localhost:5555`

## Структура проекта

```
ArenaReserve/
├── src/
│   ├── config/         # Конфигурация (DB, Redis, Stripe)
│   ├── controllers/     # Контроллеры
│   ├── middleware/      # Middleware
│   ├── routes/          # API маршруты
│   ├── services/        # Бизнес-логика
│   ├── utils/           # Утилиты
│   ├── workers/         # Фоновые задачи
│   └── server.js        # Точка входа
├── prisma/
│   ├── schema.prisma    # Схема БД
│   └── seed.js          # Тестовые данные
├── .env                 # Переменные окружения
└── package.json
```

## Следующие шаги

1. Настройте Stripe/Kaspi Pay для тестирования платежей
2. Настройте AWS S3 для загрузки файлов
3. Прочитайте [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) для полной документации API
4. Прочитайте [DEPLOYMENT.md](./DEPLOYMENT.md) для развертывания в production

## Проблемы?

### Ошибка подключения к БД
- Проверьте `DATABASE_URL` в `.env`
- Убедитесь, что PostgreSQL запущен

### Ошибка подключения к Redis
- Проверьте, что Redis запущен
- Проверьте `REDIS_HOST` и `REDIS_PORT` в `.env`

### Ошибки миграций
```bash
# Сбросить БД (ОСТОРОЖНО: удалит все данные!)
npx prisma migrate reset

# Затем снова запустите миграции
npm run db:migrate
```

