# Frontend Dockerfile (Multi-stage build)
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Build argument для API URL (по умолчанию используем относительный путь)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Собираем приложение
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем собранные файлы из builder
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx (опционально)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

