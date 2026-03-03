# ArenaReserve API Документация

Полная документация REST API для ArenaReserve.

## Базовый URL

```
http://localhost:3000/api
```

## Аутентификация

Большинство эндпоинтов требуют JWT токен в заголовке:

```
Authorization: Bearer <access_token>
```

---

## 1. Аутентификация (Auth)

### POST /api/auth/register

Регистрация нового пользователя.

**Request:**
```json
{
  "fullName": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+77001234567",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "fullName": "Иван Иванов",
    "email": "ivan@example.com",
    "phone": "+77001234567",
    "role": "USER",
    "isVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login

Вход в систему.

**Request:**
```json
{
  "email": "ivan@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### POST /api/auth/refresh

Обновление access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "new_access_token",
  "user": { ... }
}
```

---

## 2. Пользователи (Users)

### GET /api/users/me

Получить текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "fullName": "Иван Иванов",
    "email": "ivan@example.com",
    "phone": "+77001234567",
    "role": "USER",
    "isVerified": true
  }
}
```

### PUT /api/users/me

Обновить профиль.

**Request:**
```json
{
  "fullName": "Новое имя",
  "phone": "+77001234568"
}
```

---

## 3. Арены (Arenas)

### GET /api/arenas

Получить список арен с фильтрацией.

**Query Parameters:**
- `sport` - тип спорта (football, tennis, etc.)
- `lat` - широта для поиска по радиусу
- `lng` - долгота для поиска по радиусу
- `radius` - радиус поиска в км (по умолчанию 10)
- `minPrice` - минимальная цена за час
- `maxPrice` - максимальная цена за час
- `page` - номер страницы (по умолчанию 1)
- `limit` - количество на странице (по умолчанию 10)

**Example:**
```
GET /api/arenas?sport=football&lat=51.1605&lng=71.4704&radius=5&page=1&limit=10
```

**Response (200):**
```json
{
  "arenas": [
    {
      "id": "uuid",
      "title": "Футбольное поле",
      "description": "...",
      "sportType": "football",
      "address": "Алматы, ул. Примерная, 1",
      "latitude": 51.1605,
      "longitude": 71.4704,
      "pricePerHour": 5000,
      "status": "active",
      "avgRating": 4.5,
      "images": [...],
      "owner": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### GET /api/arenas/:id

Получить детали арены.

**Response (200):**
```json
{
  "arena": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "images": [...],
    "schedules": [...],
    "avgRating": 4.5,
    "_count": {
      "ratings": 10,
      "bookings": 25
    }
  }
}
```

### POST /api/arenas

Создать арену (OWNER/ADMIN).

**Request:**
```json
{
  "title": "Футбольное поле",
  "description": "Описание арены",
  "sportType": "football",
  "address": "Алматы, ул. Примерная, 1",
  "latitude": 51.1605,
  "longitude": 71.4704,
  "pricePerHour": 5000,
  "timezone": "Asia/Almaty",
  "technicalInfo": {
    "lighting": true,
    "shower": true,
    "parking": true
  }
}
```

### POST /api/arenas/:id/upload-image

Загрузить изображение арены (OWNER/ADMIN).

**Request:** `multipart/form-data`
- `image` - файл изображения (max 5MB)

**Response (201):**
```json
{
  "image": {
    "id": "uuid",
    "arenaId": "uuid",
    "url": "https://s3.example.com/arenas/...",
    "altText": "image.jpg"
  }
}
```

---

## 4. Бронирования (Bookings)

### POST /api/bookings/:id/check-availability

Проверить доступность арены.

**Request:**
```json
{
  "startDatetime": "2025-12-10T18:00:00+06:00",
  "endDatetime": "2025-12-10T20:00:00+06:00"
}
```

**Response (200):**
```json
{
  "available": true,
  "conflicts": []
}
```

### GET /api/bookings/:id/calendar

Получить календарь бронирований арены.

**Query Parameters:**
- `start` - начальная дата (YYYY-MM-DD)
- `end` - конечная дата (YYYY-MM-DD)

**Response (200):**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Иван Иванов",
      "start": "2025-12-10T18:00:00+06:00",
      "end": "2025-12-10T20:00:00+06:00",
      "status": "confirmed"
    }
  ]
}
```

### POST /api/bookings

Создать бронирование.

**Request:**
```json
{
  "arenaId": "uuid",
  "startDatetime": "2025-12-10T18:00:00+06:00",
  "endDatetime": "2025-12-10T20:00:00+06:00",
  "paymentType": "deposit",
  "paymentProvider": "stripe",
  "promoCode": "PROMO10"
}
```

**Response (201):**
```json
{
  "booking_id": "uuid",
  "total_amount": 10000,
  "amount_to_pay": 5000,
  "currency": "KZT",
  "payment_session": {
    "provider": "stripe",
    "session_id": "cs_test_...",
    "checkout_url": "https://checkout.stripe.com/pay/..."
  }
}
```

### GET /api/bookings

Получить мои бронирования.

**Query Parameters:**
- `page` - номер страницы
- `limit` - количество на странице

**Response (200):**
```json
{
  "bookings": [...],
  "pagination": { ... }
}
```

### GET /api/bookings/:id

Получить детали бронирования.

**Response (200):**
```json
{
  "booking": {
    "id": "uuid",
    "startDatetime": "...",
    "endDatetime": "...",
    "status": "confirmed",
    "totalAmount": 10000,
    "paidAmount": 5000,
    "paymentStatus": "partial",
    "arena": { ... },
    "user": { ... },
    "payments": [...]
  }
}
```

### PUT /api/bookings/:id/cancel

Отменить бронирование.

**Response (200):**
```json
{
  "booking": { ... }
}
```

### POST /api/bookings/:id/confirm

Подтвердить бронирование (OWNER/ADMIN).

---

## 5. Платежи (Payments)

### POST /api/payments/create

Создать платеж.

**Request:**
```json
{
  "bookingId": "uuid",
  "provider": "stripe",
  "type": "full",
  "amount": 10000
}
```

**Response (201):**
```json
{
  "payment": {
    "id": "uuid",
    "amount": 10000,
    "currency": "KZT",
    "provider": "stripe",
    "status": "pending",
    "type": "full"
  },
  "paymentSession": {
    "provider": "stripe",
    "session_id": "cs_test_...",
    "checkout_url": "https://checkout.stripe.com/pay/..."
  }
}
```

### POST /api/payments/webhook/:provider

Webhook для обработки платежей от Stripe/Kaspi.

**Headers:**
- `Stripe-Signature` (для Stripe)
- `X-Kaspi-Signature` (для Kaspi)

**Note:** Этот эндпоинт не требует аутентификации, но проверяет подпись.

### GET /api/payments/:id/status

Получить статус платежа.

**Response (200):**
```json
{
  "payment": {
    "id": "uuid",
    "amount": 10000,
    "status": "succeeded",
    "provider": "stripe",
    "receiptUrl": "https://s3.example.com/receipt.pdf",
    "booking": { ... }
  }
}
```

---

## 6. Рейтинги (Ratings)

### POST /api/ratings/:id

Оставить отзыв об арене.

**Request:**
```json
{
  "stars": 5,
  "comment": "Отличная арена!"
}
```

**Response (201):**
```json
{
  "rating": {
    "id": "uuid",
    "stars": 5,
    "comment": "Отличная арена!",
    "user": { ... },
    "createdAt": "..."
  }
}
```

### GET /api/ratings/:id

Получить отзывы арены.

**Query Parameters:**
- `page` - номер страницы
- `limit` - количество на странице

**Response (200):**
```json
{
  "ratings": [...],
  "pagination": { ... }
}
```

---

## 7. Уведомления (Notifications)

### GET /api/notifications

Получить уведомления.

**Query Parameters:**
- `page` - номер страницы
- `limit` - количество на странице
- `isRead` - фильтр по прочитанным (true/false)

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "booking_confirmed",
      "payload": { ... },
      "isRead": false,
      "channel": "email",
      "createdAt": "..."
    }
  ],
  "pagination": { ... }
}
```

### PUT /api/notifications/:id/read

Отметить уведомление как прочитанное.

### PUT /api/notifications/read-all

Отметить все уведомления как прочитанные.

---

## Коды ошибок

- `400` - Bad Request (неверные данные)
- `401` - Unauthorized (нет токена или токен недействителен)
- `403` - Forbidden (недостаточно прав)
- `404` - Not Found (ресурс не найден)
- `409` - Conflict (дубликат данных)
- `500` - Internal Server Error

**Пример ошибки:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "email",
      "message": "Invalid email"
    }
  ]
}
```

---

## Типы платежей

- `full` - полная оплата
- `deposit` - предоплата (50% от суммы)

## Статусы бронирования

- `pending` - ожидает подтверждения
- `confirmed` - подтверждено
- `cancelled` - отменено
- `completed` - завершено
- `rejected` - отклонено

## Статусы платежей

- `unpaid` - не оплачено
- `partial` - частично оплачено
- `paid` - оплачено
- `refunded` - возвращено

