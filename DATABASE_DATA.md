# Какие данные сохраняются в базе данных

## 📊 Текущее состояние базы данных

- **Пользователи**: 4 записи ✅
- **Бронирования**: 0 записей (требуется авторизация)
- **Арены**: 0 записей
- **Платежи**: 0 записей

---

## ✅ Данные, которые сохраняются

### 1. При регистрации пользователя (`/api/auth/register`)

**Таблица: `users`**

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `id` | UUID | Уникальный идентификатор | `3b73d26e-f51a-481a-9073-e81d6528fe4b` |
| `full_name` | String | Полное имя пользователя | `Нұрлан Ахметов` |
| `email` | String (unique) | Email адрес | `user@example.com` |
| `phone` | String (unique) | Номер телефона (нормализованный) | `+77712194493` |
| `password_hash` | String | Хэш пароля (bcrypt) | `$2b$12$...` |
| `role` | Enum | Роль пользователя | `USER`, `OWNER`, `ADMIN` |
| `is_verified` | Boolean | Подтвержден ли email | `false` |
| `created_at` | DateTime | Дата создания | `2025-12-05 11:23:43` |
| `updated_at` | DateTime | Дата обновления | `2025-12-05 11:23:43` |

**Что происходит:**
- Пароль хэшируется с помощью bcrypt (12 раундов)
- Телефон нормализуется (удаляются пробелы, добавляется +7)
- Email проверяется на уникальность
- Телефон проверяется на уникальность

---

### 2. При создании бронирования (`/api/bookings`)

**Таблица: `bookings`**

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `id` | UUID | Уникальный идентификатор | `...` |
| `user_id` | UUID | ID пользователя (из JWT токена) | `3b73d26e-f51a-481a-9073-e81d6528fe4b` |
| `arena_id` | UUID | ID арены | `...` |
| `start_datetime` | DateTime | Начало бронирования | `2025-12-10 17:00:00` |
| `end_datetime` | DateTime | Конец бронирования | `2025-12-10 19:00:00` |
| `status` | Enum | Статус бронирования | `pending`, `confirmed`, `cancelled`, `completed` |
| `total_amount` | Decimal | Общая сумма | `10000.00` |
| `paid_amount` | Decimal | Оплаченная сумма | `0.00` |
| `payment_status` | Enum | Статус оплаты | `unpaid`, `partial`, `paid`, `refunded` |
| `payment_method` | String | Метод оплаты | `cash`, `stripe`, `kaspi` |
| `promo_code` | String | Промокод (опционально) | `DISCOUNT10` |
| `hold_expire_at` | DateTime | Истечение резерва (опционально) | `2025-12-10 17:15:00` |
| `created_at` | DateTime | Дата создания | `2025-12-05 12:00:00` |
| `updated_at` | DateTime | Дата обновления | `2025-12-05 12:00:00` |

**Что происходит:**
- `user_id` берется автоматически из JWT токена (не нужно передавать)
- Проверяется доступность времени (нет конфликтов)
- Рассчитывается `total_amount` на основе цены арены и продолжительности
- Статус по умолчанию: `pending` (ожидает подтверждения)

**Требования:**
- ✅ Пользователь должен быть авторизован (JWT токен)
- ✅ Арена должна существовать
- ✅ Время не должно пересекаться с другими бронированиями

---

### 3. При создании платежа (`/api/payments`)

**Таблица: `payments`**

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `id` | UUID | Уникальный идентификатор | `...` |
| `booking_id` | UUID | ID бронирования | `...` |
| `user_id` | UUID | ID пользователя | `...` |
| `amount` | Decimal | Сумма платежа | `10000.00` |
| `currency` | String | Валюта | `KZT` |
| `provider` | Enum | Провайдер оплаты | `stripe`, `kaspi`, `cash` |
| `provider_payment_id` | String | ID платежа у провайдера | `pi_1234567890` |
| `status` | Enum | Статус транзакции | `pending`, `succeeded`, `failed`, `refunded` |
| `type` | Enum | Тип платежа | `full`, `deposit` |
| `receipt_url` | String | Ссылка на чек | `https://...` |
| `metadata` | JSON | Дополнительные данные | `{}` |
| `created_at` | DateTime | Дата создания | `2025-12-05 12:00:00` |
| `updated_at` | DateTime | Дата обновления | `2025-12-05 12:00:00` |

---

## 🔍 Как проверить сохраненные данные

### Через PostgreSQL:

```sql
-- Просмотр пользователей
SELECT id, full_name, email, phone, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- Просмотр бронирований
SELECT 
  b.id,
  u.full_name as user_name,
  a.title as arena_name,
  b.start_datetime,
  b.end_datetime,
  b.status,
  b.total_amount,
  b.payment_status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN arenas a ON b.arena_id = a.id
ORDER BY b.created_at DESC;

-- Статистика
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM arenas) as total_arenas,
  (SELECT COUNT(*) FROM payments) as total_payments;
```

### Через Prisma Studio:

```bash
cd backend
npm run db:studio
```

Откроется веб-интерфейс на `http://localhost:5555`

---

## ⚠️ Важные моменты

1. **Авторизация обязательна** для создания бронирований
   - Токен сохраняется в `localStorage` после логина
   - Токен автоматически добавляется в заголовки запросов

2. **Пароли никогда не сохраняются в открытом виде**
   - Используется bcrypt с 12 раундами хэширования

3. **Телефоны нормализуются**
   - Формат: `+7XXXXXXXXXX` (11 цифр)
   - Удаляются пробелы, дефисы, скобки

4. **Email и телефон уникальны**
   - Нельзя зарегистрировать два пользователя с одним email
   - Нельзя зарегистрировать два пользователя с одним телефоном

5. **Бронирования проверяются на конфликты**
   - Используется EXCLUDE constraint в PostgreSQL
   - Нельзя забронировать уже занятое время

---

## 📝 Примеры запросов

### Создание пользователя (регистрация):
```json
POST /api/auth/register
{
  "fullName": "Нұрлан Ахметов",
  "email": "nurlan@example.com",
  "phone": "+77712194493",
  "password": "SecurePass123"
}
```

### Создание бронирования:
```json
POST /api/bookings
Authorization: Bearer <JWT_TOKEN>
{
  "arenaId": "arena-uuid",
  "startDatetime": "2025-12-10T17:00:00Z",
  "endDatetime": "2025-12-10T19:00:00Z",
  "paymentType": "full",
  "paymentProvider": "cash"
}
```

---

## 🎯 Что нужно для работы бронирований

1. ✅ Пользователь должен быть зарегистрирован
2. ✅ Пользователь должен быть авторизован (есть токен)
3. ✅ Должны существовать арены в базе данных
4. ✅ Токен должен быть валидным (не истек)

---

## 📊 Структура базы данных

Всего таблиц: **10**

1. `users` - Пользователи
2. `arenas` - Арены
3. `arena_images` - Изображения арен
4. `schedules` - Расписание работы арен
5. `bookings` - Бронирования
6. `payments` - Платежи
7. `ratings` - Рейтинги
8. `notifications` - Уведомления
9. `refunds` - Возвраты
10. `audit_logs` - Логи аудита

