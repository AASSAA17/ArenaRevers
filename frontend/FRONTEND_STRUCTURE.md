# 🏗️ Полная структура Frontend проекта ArenaReserve

## 📋 Содержание
1. [Обзор архитектуры](#обзор-архитектуры)
2. [Связь с Backend](#связь-с-backend)
3. [Структура папок](#структура-папок)
4. [Потоки данных](#потоки-данных)
5. [Компоненты и их связи](#компоненты-и-их-связи)
6. [Маршрутизация](#маршрутизация)
7. [Утилиты и хелперы](#утилиты-и-хелперы)

---

## 🎯 Обзор архитектуры

Frontend построен на **React 18** + **TypeScript** с использованием:
- **Vite** — сборщик и dev-сервер
- **Tailwind CSS** — стилизация
- **React Router (Hash-based)** — навигация
- **Sonner** — toast-уведомления
- **Radix UI** — UI компоненты
- **Lucide React** — иконки

---

## 🔗 Связь с Backend

### Точка входа для API

**Файл:** `src/config/api.ts`
- Определяет базовый URL API (`VITE_API_URL` или `http://localhost:3000/api`)
- Экспортирует объект `API_ENDPOINTS` со всеми эндпоинтами:
  - `AUTH` — авторизация и регистрация
  - `ARENAS` — управление аренами
  - `BOOKINGS` — бронирования
  - `FAVORITES` — избранное
  - `RATINGS` — рейтинги
  - `PAYMENTS` — платежи
  - `USERS` — профиль пользователя
  - `ADMIN` — админ-панель

### HTTP клиент

**Файл:** `src/utils/api.ts`
- **Функция `apiRequest`** — обертка для всех HTTP запросов:
  - Автоматически добавляет JWT токен из `localStorage`
  - Обрабатывает ошибки (400, 401, 429, network errors)
  - Форматирует ответы
- **Объект `api`** — содержит все методы для работы с API:
  - `api.login()` — вход в систему
  - `api.register()` — регистрация
  - `api.getArenas()` — получение списка арен
  - `api.createBooking()` — создание бронирования
  - `api.processCardPayment()` — обработка платежа
  - И многие другие...

### Аутентификация

**Токен хранится в:** `localStorage.getItem('token')`
- При каждом запросе токен автоматически добавляется в заголовок `Authorization: Bearer <token>`
- Функции `setToken()` и `removeToken()` управляют токеном

---

## 📁 Структура папок

```
frontend/
├── src/                          # Основной исходный код
│   ├── App.tsx                   # Главный компонент приложения
│   ├── main.tsx                  # Точка входа React
│   ├── index.tsx                 # Альтернативная точка входа
│   ├── index.css                 # Глобальные стили
│   ├── types.ts                  # TypeScript типы (устаревшие)
│   │
│   ├── config/                   # Конфигурация
│   │   └── api.ts                # API эндпоинты и базовый URL
│   │
│   ├── utils/                    # Утилиты и хелперы
│   │   ├── api.ts                # HTTP клиент и методы API
│   │   ├── debounce.ts           # Функция debounce для поиска
│   │   └── validation.ts         # Валидация форм
│   │
│   ├── components/               # React компоненты
│   │   ├── ui/                   # Базовые UI компоненты (Radix UI)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── card.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── ... (48 файлов)
│   │   │
│   │   ├── figma/                # Компоненты из Figma
│   │   │   └── ImageWithFallback.tsx
│   │   │
│   │   ├── AdminPanel.tsx        # Админ-панель
│   │   ├── ArenaCard.tsx         # Карточка арены
│   │   ├── ArenaCardSkeleton.tsx # Skeleton для карточки
│   │   ├── ArenaDetailsModal.tsx # Модальное окно деталей арены
│   │   ├── AuthModal.tsx         # Модальное окно авторизации
│   │   ├── BookingModal.tsx      # Модальное окно бронирования
│   │   ├── BookingCardSkeleton.tsx
│   │   ├── BottomSheet.tsx      # Bottom sheet для мобильных
│   │   ├── Button.tsx            # Кастомная кнопка
│   │   ├── CalendarPicker.tsx    # Календарь для выбора даты
│   │   ├── Card.tsx              # Кастомная карточка
│   │   ├── ErrorModal.tsx        # Модальное окно ошибок
│   │   ├── FavoritesPage.tsx    # Страница избранного
│   │   ├── FilterModal.tsx       # Модальное окно фильтров
│   │   ├── Footer.tsx            # Футер
│   │   ├── Input.tsx             # Кастомный input
│   │   ├── MyBookingsPage.tsx    # Страница моих бронирований
│   │   ├── Navbar.tsx            # Навигационная панель
│   │   ├── Navigation.tsx        # Компонент навигации
│   │   ├── PasswordStrengthIndicator.tsx
│   │   ├── PaymentModal.tsx      # Модальное окно оплаты
│   │   ├── ProfilePage.tsx       # Страница профиля
│   │   ├── ProgressIndicator.tsx
│   │   ├── Rating.tsx            # Компонент рейтинга
│   │   ├── RatingModal.tsx       # Модальное окно рейтинга
│   │   ├── RefundModal.tsx       # Модальное окно возврата средств
│   │   ├── StyleGuide.tsx        # Страница стилей
│   │   ├── SuccessModal.tsx      # Модальное окно успеха
│   │   └── Tag.tsx               # Тег/чип
│   │
│   ├── styles/                   # Дополнительные стили
│   │   └── globals.css           # Глобальные CSS стили
│   │
│   └── guidelines/               # Документация и гайдлайны
│       └── Guidelines.md         # Руководство по стилям
│
├── pages/                        # Страницы (альтернативная структура)
│   ├── Arenas.tsx
│   ├── Home.tsx
│   ├── Payment.tsx
│   └── Profile.tsx
│
├── constants.ts                  # Константы приложения
├── types.ts                      # TypeScript типы
├── index.html                    # HTML шаблон
├── vite.config.ts                # Конфигурация Vite
├── tsconfig.json                 # Конфигурация TypeScript
├── package.json                  # Зависимости проекта
├── Dockerfile                    # Docker образ для production
├── Dockerfile.dev                # Docker образ для development
├── nginx.conf                    # Конфигурация Nginx
└── README.md                     # Документация
```

---

## 🔄 Потоки данных

### 1. Загрузка арен (Home Page)

```
App.tsx (useEffect)
  ↓
api.getArenas(params)
  ↓
src/utils/api.ts → apiRequest()
  ↓
src/config/api.ts → API_ENDPOINTS.ARENAS.LIST
  ↓
HTTP GET → Backend: /api/arenas
  ↓
Response → setArenas(data)
  ↓
ArenaCard компоненты отображают данные
```

### 2. Процесс бронирования

```
Пользователь кликает "Брондау"
  ↓
handleBooking() в App.tsx
  ↓
Проверка авторизации
  ├─ Нет → AuthModal открывается
  └─ Да → BookingModal открывается
  ↓
Пользователь выбирает дату/время
  ↓
handleBookingConfirm()
  ↓
api.createBooking()
  ↓
Backend создает бронирование и платеж
  ↓
PaymentModal открывается с paymentId
  ↓
Пользователь вводит данные карты
  ↓
api.processCardPayment()
  ↓
Backend обрабатывает платеж через Stripe
  ↓
handlePaymentSuccess()
  ↓
SuccessModal показывается
```

### 3. Авторизация

```
Пользователь вводит email/password
  ↓
AuthModal → api.login()
  ↓
Backend проверяет credentials
  ↓
Response: { accessToken, refreshToken, user }
  ↓
setToken(accessToken) → localStorage
  ↓
setUser(user) → состояние App
  ↓
Автоматическая загрузка бронирований
```

---

## 🧩 Компоненты и их связи

### Главный компонент: `App.tsx`

**Роль:** Центральный компонент, управляет:
- Состоянием приложения (user, arenas, bookings)
- Навигацией между страницами
- Модальными окнами
- API вызовами

**Связи:**
- Импортирует все основные компоненты
- Использует `api` из `utils/api.ts`
- Управляет состоянием через `useState` и `useEffect`
- Обрабатывает события от дочерних компонентов

### Компоненты страниц

#### `Home.tsx` (не используется, логика в App.tsx)
- Альтернативная реализация главной страницы

#### `FavoritesPage.tsx`
- Отображает избранные арены
- Использует: `api.getFavorites()`, `api.removeFavorite()`
- Импортирует: `ArenaCard`, `Navigation`

#### `MyBookingsPage.tsx`
- Отображает бронирования пользователя
- Использует: `api.getBookings()`, `api.cancelBooking()`, `api.updateBooking()`
- Импортирует: `BookingCardSkeleton`, `Navigation`

#### `ProfilePage.tsx`
- Отображает и редактирует профиль
- Использует: `api.getProfile()`, `api.updateProfile()`
- Импортирует: `Input`, `Button`, `Card`

#### `AdminPanel.tsx`
- Админ-панель для управления системой
- Использует: `api.admin.*` методы
- Импортирует: UI компоненты из `ui/`

### Модальные окна

#### `AuthModal.tsx`
- Авторизация и регистрация
- Использует: `api.login()`, `api.register()`, `api.checkEmail()`, `api.checkPhone()`
- Импортирует: `Input`, `Button`, `PasswordStrengthIndicator`

#### `BookingModal.tsx`
- Выбор даты/времени для бронирования
- Использует: `api.checkAvailability()`, `api.getArenaCalendar()`
- Импортирует: `CalendarPicker`, `Button`, `Card`

#### `PaymentModal.tsx`
- Ввод данных карты для оплаты
- Использует: `api.processCardPayment()`
- Импортирует: `Input`, `Button`, `Card`

#### `ArenaDetailsModal.tsx`
- Детальная информация об арене
- Использует: `api.getArenaById()`, `api.getArenaRatings()`
- Импортирует: `Rating`, `Button`, `Card`

#### `SuccessModal.tsx`
- Подтверждение успешного бронирования
- Импортирует: `Button`, `Card`

#### `ErrorModal.tsx`
- Отображение ошибок
- Импортирует: `Button`, `Card`

#### `RefundModal.tsx`
- Уведомление о возврате средств
- Импортирует: `Button`, `Card`

### UI компоненты

#### `ArenaCard.tsx`
- Карточка арены в списке
- Пропсы: `id`, `title`, `location`, `price`, `rating`, `image`
- События: `onBook()`, `onViewDetails()`, `onAuthRequired()`

#### `Button.tsx`
- Кастомная кнопка с вариантами: `primary`, `secondary`, `ghost`
- Размеры: `sm`, `md`, `lg`

#### `Input.tsx`
- Кастомный input с валидацией

#### `Card.tsx`
- Обертка для карточек с тенью и скруглением

#### `CalendarPicker.tsx`
- Календарь для выбора даты
- Использует: `react-day-picker`

### Базовые UI компоненты (`ui/`)

**Источник:** Radix UI + shadcn/ui
- `button.tsx` — кнопка
- `input.tsx` — поле ввода
- `dialog.tsx` — модальное окно
- `card.tsx` — карточка
- `calendar.tsx` — календарь
- `select.tsx` — выпадающий список
- `tabs.tsx` — вкладки
- И другие...

---

## 🧭 Маршрутизация

### Hash-based routing

**Используется:** `window.location.hash`

**Маршруты:**
- `#home` — главная страница (по умолчанию)
- `#favorites` — избранное
- `#bookings` — мои бронирования
- `#profile` — профиль
- `#admin` — админ-панель (только для ADMIN)

**Обработка:**
```typescript
// В App.tsx
useEffect(() => {
  const hash = window.location.hash.replace('#', '');
  if (hash && ['home', 'favorites', 'bookings', 'profile', 'admin'].includes(hash)) {
    setCurrentPage(hash as Page);
  }
}, []);
```

**Навигация:**
- `handleNavigate(page)` — программная навигация
- `window.location.hash = page` — изменение hash

---

## 🛠️ Утилиты и хелперы

### `src/utils/api.ts`

**Основные функции:**
- `getToken()` — получение токена из localStorage
- `setToken(token)` — сохранение токена
- `removeToken()` — удаление токена
- `apiRequest<T>()` — обертка для HTTP запросов

**Объект `api`:**
- `api.login()` — вход
- `api.register()` — регистрация
- `api.logout()` — выход
- `api.getArenas()` — список арен
- `api.getArenaById()` — детали арены
- `api.createBooking()` — создание бронирования
- `api.getBookings()` — список бронирований
- `api.updateBooking()` — обновление бронирования
- `api.cancelBooking()` — отмена бронирования
- `api.processCardPayment()` — обработка платежа
- `api.addFavorite()` — добавить в избранное
- `api.removeFavorite()` — удалить из избранного
- `api.getFavorites()` — список избранного
- `api.createRating()` — создать рейтинг
- `api.getProfile()` — получить профиль
- `api.admin.*` — методы админ-панели

### `src/utils/debounce.ts`

**Функция:** `debounce(func, delay)`
- Используется для оптимизации поиска
- Задерживает выполнение функции до окончания ввода

### `src/utils/validation.ts`

**Функции валидации:**
- Валидация email
- Валидация телефона
- Валидация пароля
- И другие...

### `src/config/api.ts`

**Экспорты:**
- `API_BASE_URL` — базовый URL API
- `API_ENDPOINTS` — объект со всеми эндпоинтами

---

## 📊 Схема связей компонентов

```
App.tsx (главный компонент)
│
├── Navigation.tsx (навигация)
│
├── Home Page (в App.tsx)
│   ├── Hero Section (поиск)
│   ├── ArenaCard[] (список арен)
│   │   └── ArenaDetailsModal (при клике)
│   └── FilterModal (фильтры)
│
├── FavoritesPage.tsx
│   └── ArenaCard[] (избранные арены)
│
├── MyBookingsPage.tsx
│   └── BookingCard[] (бронирования)
│
├── ProfilePage.tsx
│   └── Форма редактирования профиля
│
├── AdminPanel.tsx
│   └── Таблицы и графики
│
└── Модальные окна:
    ├── AuthModal.tsx
    ├── BookingModal.tsx
    ├── PaymentModal.tsx
    ├── SuccessModal.tsx
    ├── ErrorModal.tsx
    ├── RefundModal.tsx
    └── ArenaDetailsModal.tsx
```

---

## 🔐 Управление состоянием

### Локальное состояние (useState)

**В App.tsx:**
- `user` — текущий пользователь
- `arenas` — список арен
- `bookings` — список бронирований
- `currentPage` — текущая страница
- `selectedArena` — выбранная арена для бронирования
- `isAuthModalOpen` — открыто ли модальное окно авторизации
- `isBookingModalOpen` — открыто ли модальное окно бронирования
- `isPaymentModalOpen` — открыто ли модальное окно оплаты
- И другие...

### Персистентное состояние (localStorage)

- `token` — JWT токен авторизации
- Восстанавливается при загрузке страницы

---

## 🎨 Стилизация

### Tailwind CSS

**Конфигурация:** Встроена в `index.css` и `globals.css`

**Цветовая палитра:**
- Primary: `#2ECC71` (зеленый)
- Text: `#1A1A1A`, `#4D4D4D`, `#808080`
- Background: `#F5F5F5`, `#FFFFFF`
- Border: `#D9D9D9`

**Использование:**
- Утилитарные классы Tailwind
- Кастомные классы в `globals.css`

### Компоненты Radix UI

- Стилизованы через Tailwind
- Находятся в `src/components/ui/`

---

## 🚀 Сборка и деплой

### Development

```bash
npm run dev
# или
vite
```

**Порт:** Обычно `http://localhost:5173`

### Production

```bash
npm run build
```

**Результат:** Папка `dist/` с оптимизированными файлами

### Docker

**Dockerfile.dev** — для development
**Dockerfile** — для production
**nginx.conf** — конфигурация Nginx для production

---

## 📝 Важные заметки

1. **Hash-based routing:** Используется `window.location.hash` вместо React Router для простоты
2. **API клиент:** Все запросы идут через `src/utils/api.ts`
3. **Токен:** Хранится в `localStorage`, автоматически добавляется в заголовки
4. **Обработка ошибок:** Централизована в `apiRequest()`
5. **Модальные окна:** Управляются через состояние в `App.tsx`
6. **Типы:** Определены в `types.ts` и в компонентах
7. **Стили:** Tailwind CSS + кастомные классы

---

## 🔄 Связь с Backend (детально)

### 1. Аутентификация

```
Frontend → POST /api/auth/login
  Body: { email, password }
  ↓
Backend → Проверка credentials
  ↓
Response: { accessToken, refreshToken, user }
  ↓
Frontend → setToken(accessToken)
  ↓
Все последующие запросы → Authorization: Bearer <token>
```

### 2. Получение арен

```
Frontend → GET /api/arenas?search=...&sport=...&minPrice=...&maxPrice=...
  Headers: Authorization: Bearer <token> (опционально)
  ↓
Backend → Запрос к PostgreSQL через Prisma
  ↓
Response: { arenas: [...], total, page, limit }
  ↓
Frontend → setArenas(data.arenas)
  ↓
Отображение в ArenaCard компонентах
```

### 3. Создание бронирования

```
Frontend → POST /api/bookings
  Body: { arenaId, startDatetime, endDatetime, paymentType, paymentProvider }
  Headers: Authorization: Bearer <token>
  ↓
Backend → Проверка доступности, создание Booking и Payment
  ↓
Response: { booking_id, payment_id, ... }
  ↓
Frontend → setCurrentPaymentId(payment_id)
  ↓
Открытие PaymentModal
```

### 4. Обработка платежа

```
Frontend → POST /api/payments/process-card
  Body: { paymentId, cardNumber, expiryMonth, expiryYear, cvv, cardHolder }
  Headers: Authorization: Bearer <token>
  ↓
Backend → Обработка через Stripe
  ↓
Response: { status: 'succeeded' | 'failed', ... }
  ↓
Frontend → handlePaymentSuccess()
  ↓
Открытие SuccessModal
```

### 5. Получение бронирований

```
Frontend → GET /api/bookings
  Headers: Authorization: Bearer <token>
  ↓
Backend → Запрос бронирований текущего пользователя
  ↓
Response: { bookings: [...] }
  ↓
Frontend → setBookings(transformedBookings)
  ↓
Отображение в MyBookingsPage
```

---

## 📚 Дополнительные ресурсы

- **Backend API:** `backend/API_DOCUMENTATION.md`
- **Дизайн:** `PROJECT_DESIGN_EXPLANATION.md`
- **README:** `frontend/README.md`

---

**Версия документа:** 1.0  
**Дата обновления:** 2025-01-01  
**Автор:** ArenaReserve Team






