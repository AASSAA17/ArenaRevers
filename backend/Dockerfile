# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Устанавливаем необходимые библиотеки для Prisma и PostgreSQL клиент
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Копируем скрипт ожидания
COPY wait-for-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-db.sh

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/
COPY prisma/apply-constraint.sql ./prisma/

# Устанавливаем зависимости (включая dev для Prisma CLI)
RUN npm ci

# Генерируем Prisma Client (без миграций, чтобы избежать проверки)
RUN npx prisma generate

# Копируем остальные файлы (миграции копируем отдельно, но они не нужны для работы)
COPY . .

# Создаем директории для логов и загрузок
RUN mkdir -p logs public/uploads uploads

# Открываем порт
EXPOSE 3000

# Команда запуска (миграции применяются в docker-compose.yml)
CMD ["npm", "start"]