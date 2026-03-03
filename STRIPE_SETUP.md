# Настройка Stripe для оплаты

## Проблема

Если вы видите ошибку:
```
You did not need to provide your API key in the Authorization header
```

Это означает, что ключи Stripe не настроены.

## Решение

### Шаг 1: Получите ключи Stripe

1. Зарегистрируйтесь на [Stripe](https://stripe.com)
2. Перейдите в [Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Скопируйте:
   - **Secret key** (начинается с `sk_test_` для тестового режима)
   - **Publishable key** (начинается с `pk_test_` для тестового режима)

### Шаг 2: Создайте файл `.env` в корне проекта

Создайте файл `.env` в корне проекта (рядом с `docker-compose.yml`) со следующим содержимым:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_ваш_secret_ключ_здесь
STRIPE_PUBLISHABLE_KEY=pk_test_ваш_publishable_ключ_здесь
STRIPE_WEBHOOK_SECRET=whsec_ваш_webhook_secret_здесь

# Другие переменные (опционально)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
```

### Шаг 3: Перезапустите контейнеры

После добавления переменных окружения перезапустите backend:

```bash
docker-compose -f docker-compose.dev.yml restart backend
```

Или для production:

```bash
docker-compose restart backend
```

### Шаг 4: Проверка

После перезапуска попробуйте снова выполнить оплату. Ошибка должна исчезнуть.

## Альтернативный способ (без .env файла)

Если вы не хотите создавать .env файл, можете напрямую указать переменные в `docker-compose.dev.yml`:

```yaml
environment:
  STRIPE_SECRET_KEY: sk_test_ваш_ключ_здесь
  STRIPE_PUBLISHABLE_KEY: pk_test_ваш_ключ_здесь
  # ...
```

**⚠️ ВНИМАНИЕ:** Не коммитьте файл `.env` в Git! Он должен быть в `.gitignore`.

## Тестовые карты Stripe

Для тестирования используйте тестовые карты:

- **Успешная оплата:** `4242 4242 4242 4242`
- **Отклоненная карта:** `4000 0000 0000 0002`
- **Требует 3D Secure:** `4000 0025 0000 3155`

Любая дата в будущем, любой CVC.

## Production

Для production используйте реальные ключи (начинаются с `sk_live_` и `pk_live_`).

