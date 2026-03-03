# ArenaReserve - Sports Arena Booking Platform

Полнофункциональная платформа для бронирования спортивных арен с интеграцией платежных систем.

## Структура проекта

```
ArenaReserve/
├── Backend/          # Node.js + Express API сервер
│   ├── src/          # Исходный код бэкенда
│   ├── prisma/       # Prisma схема и миграции
│   └── package.json  # Зависимости бэкенда
├── Frontend/         # React + TypeScript фронтенд
│   ├── src/          # Исходный код фронтенда
│   └── package.json  # Зависимости фронтенда
└── README.md         # Этот файл
```

## Быстрый старт

### Предварительные требования

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm или yarn

### Установка и запуск

#### 1. Бэкенд

```bash
cd Backend
npm install
cp .env.example .env
# Отредактируйте .env и укажите ваши настройки

# Настройте базу данных
npm run db:migrate
npm run db:seed  # Опционально: заполнить тестовыми данными

# Запустите сервер
npm run dev      # Development режим
# или
npm start        # Production режим
```

Бэкенд будет доступен на `http://localhost:3000`

#### 2. Фронтенд

```bash
cd Frontend
npm install
cp .env.example .env
# Убедитесь что VITE_API_URL=http://localhost:3000/api

# Запустите dev сервер
npm run dev
```

Фронтенд будет доступен на `http://localhost:3001`

#### 3. Фоновые задачи (опционально)

В отдельном терминале:

```bash
cd Backend
npm run workers
```

## Основные функции

### Double Booking Prevention
- PostgreSQL EXCLUDE constraint предотвращает перекрывающиеся бронирования
- Автоматическая обработка race conditions на уровне БД

### Booking HOLD System
- Временная резервация на 5-10 минут при создании бронирования с онлайн оплатой
- Автоматическая отмена expired holds через cron job
- Конвертация hold → confirmed при успешной оплате

### Платежи
- Интеграция Stripe
- Интеграция Kaspi Pay
- Поддержка полной и частичной оплаты (deposit)

### API Endpoints

Основные эндпоинты:
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/arenas` - Список арен
- `POST /api/bookings` - Создать бронирование
- `POST /api/payments/create` - Создать платеж
- `POST /api/payments/webhook/:provider` - Webhook для платежей

Полная документация: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Переменные окружения

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/arenareserve
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:3001
BOOKING_HOLD_DURATION_MINUTES=10
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## Разработка

### Структура бэкенда

```
Backend/
├── src/
│   ├── config/       # Конфигурация (DB, Redis, Stripe)
│   ├── controllers/  # Контроллеры
│   ├── middleware/   # Middleware (auth, validation)
│   ├── routes/       # API маршруты
│   ├── services/     # Бизнес-логика
│   ├── jobs/         # Cron задачи
│   ├── workers/      # Фоновые задачи (BullMQ)
│   └── utils/        # Утилиты
└── prisma/
    ├── schema.prisma # Схема БД
    └── migrations/   # Миграции
```

### Тестирование

```bash
cd Backend
npm test
```

## Production Deployment

См. [DEPLOYMENT.md](./DEPLOYMENT.md) для детальных инструкций по развертыванию.

## Лицензия

ISC
