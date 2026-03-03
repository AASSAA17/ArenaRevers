# Изменения в Docker конфигурации

## Что изменилось

✅ **Используется внешняя база данных PostgreSQL** вместо контейнера Docker
- Host: localhost:5433
- User: postgres
- Password: 1234
- Database: arenareserve

## Что нужно сделать перед запуском

### 1. Убедитесь, что PostgreSQL запущен
- PostgreSQL должен быть установлен и запущен на вашем компьютере
- Порт: 5433
- Пользователь: postgres
- Пароль: 1234

### 2. Создайте базу данных arenareserve

**Вариант А: Через скрипт**
```bash
create-database.bat
```

**Вариант Б: Вручную**
```bash
psql -h localhost -p 5433 -U postgres
```
Затем выполните:
```sql
CREATE DATABASE arenareserve;
```

**Вариант В: Через командную строку**
```bash
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE arenareserve;"
```

### 3. Запустите Docker контейнеры

```bash
docker-compose up -d --build
```

или для development:

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## Измененные файлы

- `docker-compose.yml` - убран сервис database, изменен DATABASE_URL
- `docker-compose.dev.yml` - убран сервис database, изменен DATABASE_URL
- Добавлен `create-database.bat` - скрипт для создания базы данных
- Добавлен `create-database.sql` - SQL скрипт для создания базы данных

## Важные замечания

1. **База данных должна быть создана ДО запуска контейнеров**, иначе миграции не применятся
2. Если база `arenareserve` не существует, приложение выдаст ошибку при подключении
3. Контейнеры подключаются к внешней БД через `host.docker.internal:5433`
4. Redis по-прежнему запускается в Docker контейнере

## Устранение проблем

### Ошибка подключения к базе данных

Если видите ошибку "could not connect to server", проверьте:
1. PostgreSQL запущен на порту 5433
2. Пароль пользователя postgres: 1234
3. База данных `arenareserve` создана
4. В pg_hba.conf разрешены подключения с localhost

### База данных не найдена

Если видите ошибку "database 'arenareserve' does not exist":
```bash
create-database.bat
```

### Проблемы с host.docker.internal

На Linux может потребоваться добавить в docker-compose.yml:
```yaml
extra_hosts:
  - "host.docker.internal:172.17.0.1"
```

Или использовать IP адрес хоста вместо `host.docker.internal`.

