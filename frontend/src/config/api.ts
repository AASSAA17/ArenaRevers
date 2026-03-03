// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    CHECK_EMAIL: `${API_BASE_URL}/auth/check-email`,
    CHECK_PHONE: `${API_BASE_URL}/auth/check-phone`,
  },
  // Arenas
  ARENAS: {
    LIST: `${API_BASE_URL}/arenas`,
    CREATE: `${API_BASE_URL}/arenas`,
    BY_ID: (id: string) => `${API_BASE_URL}/arenas/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/arenas/${id}`,
    UPLOAD_IMAGE: (id: string) => `${API_BASE_URL}/arenas/${id}/upload-image`,
    DELETE_IMAGE: (id: string, imageId: string) => `${API_BASE_URL}/arenas/${id}/images/${imageId}`,
    REORDER_IMAGES: (id: string) => `${API_BASE_URL}/arenas/${id}/images/reorder`,
    CALENDAR: (id: string) => `${API_BASE_URL}/arenas/${id}/calendar`,
    CHECK_AVAILABILITY: (id: string) => `${API_BASE_URL}/arenas/${id}/check-availability`,
  },
  // Bookings
  BOOKINGS: {
    LIST: `${API_BASE_URL}/bookings`,
    CREATE: `${API_BASE_URL}/bookings`,
    BY_ID: (id: string) => `${API_BASE_URL}/bookings/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/bookings/${id}`,
    CANCEL: (id: string) => `${API_BASE_URL}/bookings/${id}/cancel`,
    RECEIPT: (id: string) => `${API_BASE_URL}/bookings/${id}/receipt`,
  },
  // Favorites
  FAVORITES: {
    LIST: `${API_BASE_URL}/favorites`,
    ADD: `${API_BASE_URL}/favorites`,
    CHECK: (arenaId: string) => `${API_BASE_URL}/favorites/${arenaId}/check`,
    REMOVE: (arenaId: string) => `${API_BASE_URL}/favorites/${arenaId}`,
  },
  // Ratings
  RATINGS: {
    CREATE: (arenaId: string) => `${API_BASE_URL}/ratings/${arenaId}`,
    GET_ARENA: (arenaId: string) => `${API_BASE_URL}/ratings/${arenaId}`,
  },
  // Payments
  PAYMENTS: {
    CREATE: `${API_BASE_URL}/payments/create`,
    PROCESS_CARD: `${API_BASE_URL}/payments/process-card`,
    STATUS: (id: string) => `${API_BASE_URL}/payments/${id}/status`,
  },
  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/me`,
    UPDATE: `${API_BASE_URL}/users/me`,
  },
  // Admin
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    USERS: `${API_BASE_URL}/admin/users`,
    USER_BY_ID: (id: string) => `${API_BASE_URL}/admin/users/${id}`,
    UPDATE_USER_ROLE: (id: string) => `${API_BASE_URL}/admin/users/${id}/role`,
    BLOCK_USER: (id: string) => `${API_BASE_URL}/admin/users/${id}/block`,
    UNBLOCK_USER: (id: string) => `${API_BASE_URL}/admin/users/${id}/unblock`,
    ARENAS: `${API_BASE_URL}/admin/arenas`,
    UPDATE_ARENA: (id: string) => `${API_BASE_URL}/admin/arenas/${id}`,
    UPDATE_ARENA_STATUS: (id: string) => `${API_BASE_URL}/admin/arenas/${id}/status`,
    BULK_UPDATE_ARENA_STATUS: `${API_BASE_URL}/admin/arenas/bulk-status`,
    VERIFY_ARENA: (id: string) => `${API_BASE_URL}/admin/arenas/${id}/verify`,
    ARENA_STATS: (id: string) => `${API_BASE_URL}/admin/arenas/${id}/stats`,
    DELETE_ARENA: (id: string) => `${API_BASE_URL}/admin/arenas/${id}`,
    BOOKINGS: `${API_BASE_URL}/admin/bookings`,
    MARK_BOOKING_COMPLETED: (id: string) => `${API_BASE_URL}/admin/bookings/${id}/mark-completed`,
    BOOKINGS_NEEDING_ATTENTION: `${API_BASE_URL}/admin/bookings/needing-attention`,
    // Analytics
    ANALYTICS_BOOKINGS: `${API_BASE_URL}/admin/analytics/bookings`,
    ANALYTICS_REVENUE: `${API_BASE_URL}/admin/analytics/revenue`,
    ANALYTICS_USERS: `${API_BASE_URL}/admin/analytics/users`,
    ANALYTICS_ARENAS: `${API_BASE_URL}/admin/analytics/arenas`,
    // Payments
    PAYMENTS: `${API_BASE_URL}/admin/payments`,
    PAYMENT_BY_ID: (id: string) => `${API_BASE_URL}/admin/payments/${id}`,
    PAYMENT_STATS: `${API_BASE_URL}/admin/payments/stats`,
    CREATE_REFUND: (id: string) => `${API_BASE_URL}/admin/payments/${id}/refund`,
    REFUNDS: `${API_BASE_URL}/admin/refunds`,
    // Ratings
    RATINGS: `${API_BASE_URL}/admin/ratings`,
    RATING_BY_ID: (id: string) => `${API_BASE_URL}/admin/ratings/${id}`,
    RATING_STATS: `${API_BASE_URL}/admin/ratings/stats`,
    DELETE_RATING: (id: string) => `${API_BASE_URL}/admin/ratings/${id}`,
    // Notifications
    NOTIFICATIONS: `${API_BASE_URL}/admin/notifications`,
    NOTIFICATION_STATS: `${API_BASE_URL}/admin/notifications/stats`,
    SEND_BULK_NOTIFICATION: `${API_BASE_URL}/admin/notifications/bulk`,
    // Audit & Security
    AUDIT_LOGS: `${API_BASE_URL}/admin/audit-logs`,
    SUSPICIOUS_ACTIVITY: `${API_BASE_URL}/admin/security/suspicious`,
    // Settings
    SETTINGS: `${API_BASE_URL}/admin/settings`,
    SETTINGS_HISTORY: `${API_BASE_URL}/admin/settings/history`,
  },
};

export default API_BASE_URL;

