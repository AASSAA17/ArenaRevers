# Пересборка Docker контейнера для установки xlsx

Для установки библиотеки xlsx в Docker контейнере выполните:

```bash
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml up -d frontend
```

Или пересоберите весь стек:

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

