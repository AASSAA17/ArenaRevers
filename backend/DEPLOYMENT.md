# Руководство по развертыванию ArenaReserve Backend

## Подготовка к production

### 1. Переменные окружения

Убедитесь, что все переменные окружения настроены в production:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
REDIS_URL=redis://host:6379
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
KASPI_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
FRONTEND_URL=https://yourdomain.com
```

### 2. База данных

#### Миграции

```bash
# В production используйте migrate deploy (без интерактивности)
npx prisma migrate deploy
```

#### Индексы для производительности

Добавьте индексы в Prisma schema:

```prisma
model Booking {
  @@index([arenaId, startDatetime, endDatetime])
  @@index([userId, status])
}

model Arena {
  @@index([status, sportType])
  @@index([latitude, longitude])
}
```

### 3. Redis

Настройте Redis для production:

```bash
# Используйте managed Redis (Redis Cloud, AWS ElastiCache)
# Или настройте персистентность
```

### 4. Фоновые задачи

Запустите воркеры отдельно:

```bash
# Отдельный процесс для воркеров
node src/workers/index.js
```

Или используйте PM2:

```bash
pm2 start src/workers/index.js --name arenareserve-workers
```

### 5. Мониторинг

#### Winston логирование

Логи автоматически пишутся в:
- `logs/error.log` - только ошибки
- `logs/combined.log` - все логи

#### Health check

```bash
curl https://api.arenareserve.com/health
```

### 6. Rate Limiting

Настройте Redis для rate limiting:

```javascript
// В production используйте Redis для распределенного rate limiting
```

### 7. HTTPS

Обязательно используйте HTTPS в production:

```bash
# Используйте reverse proxy (Nginx) с Let's Encrypt
# Или managed SSL (Cloudflare, AWS)
```

---

## Варианты развертывания

### Вариант 1: Render.com

1. Подключите GitHub репозиторий
2. Выберите Node.js
3. Укажите команду запуска: `npm start`
4. Добавьте переменные окружения
5. Подключите PostgreSQL (managed)
6. Подключите Redis (managed)

### Вариант 2: Heroku

```bash
heroku create arenareserve-api
heroku addons:create heroku-postgresql
heroku addons:create heroku-redis
heroku config:set NODE_ENV=production
git push heroku main
```

### Вариант 3: DigitalOcean App Platform

1. Создайте App
2. Подключите GitHub
3. Добавьте Database (PostgreSQL)
4. Добавьте Redis
5. Настройте переменные окружения

### Вариант 4: AWS (EC2 + RDS + ElastiCache)

1. Запустите EC2 instance
2. Создайте RDS PostgreSQL
3. Создайте ElastiCache Redis
4. Настройте Security Groups
5. Используйте PM2 для управления процессами

### Вариант 5: Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/arenareserve
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  workers:
    build: .
    command: node src/workers/index.js
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/arenareserve
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=arenareserve
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## CI/CD с GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to production
        run: |
          # Ваша команда развертывания
```

---

## Масштабирование

### Горизонтальное масштабирование

1. Запустите несколько инстансов API
2. Используйте load balancer (Nginx, AWS ALB)
3. Убедитесь, что JWT токены работают stateless
4. Используйте Redis для сессий/кэша

### Вертикальное масштабирование

1. Увеличьте ресурсы сервера
2. Настройте connection pooling для PostgreSQL
3. Оптимизируйте запросы к БД

### Оптимизация базы данных

1. Добавьте индексы
2. Используйте connection pooling (pgBouncer)
3. Настройте read replicas для чтения
4. Используйте кэширование (Redis)

---

## Безопасность

### Checklist

- [ ] Все секреты в переменных окружения
- [ ] HTTPS включен
- [ ] CORS настроен правильно
- [ ] Rate limiting активен
- [ ] Валидация всех входных данных
- [ ] SQL injection защита (Prisma)
- [ ] XSS защита (helmet)
- [ ] Webhook signature verification
- [ ] Логирование ошибок
- [ ] Мониторинг (Sentry)

### Рекомендации

1. Используйте secrets manager (AWS Secrets Manager, HashiCorp Vault)
2. Регулярно обновляйте зависимости
3. Используйте DDoS защиту (Cloudflare)
4. Настройте firewall
5. Регулярно делайте бэкапы БД

---

## Мониторинг и алерты

### Рекомендуемые инструменты

- **Sentry** - отслеживание ошибок
- **New Relic / Datadog** - APM
- **Uptime Robot** - мониторинг доступности
- **Logtail / Papertrail** - централизованное логирование

### Метрики для отслеживания

- Response time
- Error rate
- Database connection pool
- Queue size
- Memory usage
- CPU usage

---

## Бэкапы

### База данных

```bash
# Автоматические бэкапы (ежедневно)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Файлы (S3)

Настройте versioning в S3 bucket.

---

## Troubleshooting

### Проблема: Высокая нагрузка на БД

**Решение:**
- Добавьте индексы
- Используйте кэширование
- Оптимизируйте запросы

### Проблема: Медленные ответы API

**Решение:**
- Проверьте connection pooling
- Используйте CDN для статики
- Оптимизируйте запросы к БД

### Проблема: Ошибки в воркерах

**Решение:**
- Проверьте Redis подключение
- Увеличьте retry attempts
- Добавьте dead letter queue

