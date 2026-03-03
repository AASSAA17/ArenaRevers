import { API_ENDPOINTS } from '../config/api';

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// API request wrapper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      
      // Handle validation errors
      if (response.status === 400 && error.details) {
        const validationMessage = error.details.map((d: any) => d.message).join(', ');
        throw new Error(validationMessage || error.message || 'Валидация қатесі');
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Тым көп сұрау. Біраздан кейін қайталап көріңіз.');
      }
      
      throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors (Failed to fetch)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Серверге қосылу мүмкін емес. Бэкенд сервері іске қосылғанын тексеріңіз (http://localhost:3000)');
    }
    
    // Handle abort errors
    if (error.name === 'AbortError') {
      throw new Error('Сұрау тоқтатылды');
    }
    
    // Re-throw other errors
    throw error;
  }
};

// API methods
export const api = {
  // Auth
  register: async (data: { fullName: string; email: string; phone: string; password: string }) => {
    return apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiRequest<{ accessToken: string; refreshToken: string; user: any }>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (response.accessToken) {
      setToken(response.accessToken);
    }
    return response;
  },

  logout: async () => {
    await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
    removeToken();
  },

  // Arenas
  getArenas: async (params?: { sportType?: string; search?: string; page?: number; limit?: number; minPrice?: number; maxPrice?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.sportType) queryParams.append('sport', params.sportType);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.ARENAS.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.ARENAS.LIST;
    
    return apiRequest(url);
  },

  getArenaById: async (id: string) => {
    return apiRequest(API_ENDPOINTS.ARENAS.BY_ID(id));
  },

  createArena: async (data: {
    title: string;
    description?: string;
    sportType: string;
    address: string;
    latitude?: number;
    longitude?: number;
    pricePerHour: number;
    timezone?: string;
    technicalInfo?: any;
  }) => {
    return apiRequest(API_ENDPOINTS.ARENAS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateArena: async (id: string, data: {
    title?: string;
    description?: string;
    sportType?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    pricePerHour?: number;
    timezone?: string;
    status?: string;
    technicalInfo?: any;
  }) => {
    return apiRequest(API_ENDPOINTS.ARENAS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadArenaImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.ARENAS.UPLOAD_IMAGE(id), {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  deleteArenaImage: async (id: string, imageId: string) => {
    return apiRequest(API_ENDPOINTS.ARENAS.DELETE_IMAGE(id, imageId), {
      method: 'DELETE',
    });
  },

  reorderArenaImages: async (id: string, imageIds: string[]) => {
    return apiRequest(API_ENDPOINTS.ARENAS.REORDER_IMAGES(id), {
      method: 'PUT',
      body: JSON.stringify({ imageIds }),
    });
  },

  checkAvailability: async (id: string, data: { startDatetime: string; endDatetime: string }) => {
    return apiRequest(API_ENDPOINTS.ARENAS.CHECK_AVAILABILITY(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getArenaCalendar: async (arenaId: string, startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
    });
    const response = await apiRequest<{ events: any[] }>(`${API_ENDPOINTS.ARENAS.CALENDAR(arenaId)}?${params.toString()}`);
    return response.events || [];
  },

  // Bookings
  createBooking: async (data: {
    arenaId: string;
    startDatetime: string;
    endDatetime: string;
    paymentType?: 'full' | 'deposit';
    paymentProvider?: 'stripe' | 'kaspi' | 'cash';
    promoCode?: string;
  }) => {
    return apiRequest(API_ENDPOINTS.BOOKINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        paymentType: data.paymentType || 'full',
        paymentProvider: data.paymentProvider || 'cash',
      }),
    });
  },

  getBookings: async () => {
    return apiRequest(API_ENDPOINTS.BOOKINGS.LIST);
  },

  getBookingById: async (id: string) => {
    return apiRequest(API_ENDPOINTS.BOOKINGS.BY_ID(id));
  },

  updateBooking: async (id: string, data: {
    startDatetime?: string;
    endDatetime?: string;
    promoCode?: string;
  }) => {
    return apiRequest(API_ENDPOINTS.BOOKINGS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancelBooking: async (id: string) => {
    return apiRequest(API_ENDPOINTS.BOOKINGS.CANCEL(id), {
      method: 'PUT',
    });
  },

  // Payments
  processCardPayment: async (data: {
    paymentId: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardHolder: string;
  }) => {
    return apiRequest(API_ENDPOINTS.PAYMENTS.PROCESS_CARD, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPaymentStatus: async (id: string) => {
    return apiRequest(API_ENDPOINTS.PAYMENTS.STATUS(id));
  },

  downloadReceipt: async (id: string) => {
    const token = getToken();
    const response = await fetch(API_ENDPOINTS.BOOKINGS.RECEIPT(id), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Favorites
  addFavorite: async (arenaId: string) => {
    return apiRequest(API_ENDPOINTS.FAVORITES.ADD, {
      method: 'POST',
      body: JSON.stringify({ arenaId }),
    });
  },

  removeFavorite: async (arenaId: string) => {
    return apiRequest(API_ENDPOINTS.FAVORITES.REMOVE(arenaId), {
      method: 'DELETE',
    });
  },

  getFavorites: async (page?: number, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.FAVORITES.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.FAVORITES.LIST;
    
    return apiRequest(url);
  },

  checkFavorite: async (arenaId: string) => {
    return apiRequest(API_ENDPOINTS.FAVORITES.CHECK(arenaId));
  },

  // Ratings
  createRating: async (arenaId: string, data: { stars: number; comment?: string }) => {
    return apiRequest(API_ENDPOINTS.RATINGS.CREATE(arenaId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getArenaRatings: async (arenaId: string, page?: number, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.RATINGS.GET_ARENA(arenaId)}?${queryParams.toString()}`
      : API_ENDPOINTS.RATINGS.GET_ARENA(arenaId);
    
    return apiRequest(url);
  },

  // Users
  getProfile: async () => {
    return apiRequest(API_ENDPOINTS.USERS.PROFILE);
  },

  // Check availability
  checkEmail: async (email: string, signal?: AbortSignal) => {
    const params = new URLSearchParams({ email });
    return apiRequest<{ exists: boolean }>(
      `${API_ENDPOINTS.AUTH.CHECK_EMAIL}?${params.toString()}`,
      { signal }
    );
  },

  checkPhone: async (phone: string, signal?: AbortSignal) => {
    const params = new URLSearchParams({ phone });
    return apiRequest<{ exists: boolean }>(
      `${API_ENDPOINTS.AUTH.CHECK_PHONE}?${params.toString()}`,
      { signal }
    );
  },

  // Admin
  admin: {
    getDashboard: async () => {
      return apiRequest(API_ENDPOINTS.ADMIN.DASHBOARD);
    },
    getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.ADMIN.USERS}?${queryParams.toString()}`
        : API_ENDPOINTS.ADMIN.USERS;
      
      return apiRequest(url);
    },
    getUserById: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    },
    updateUserRole: async (id: string, role: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(id), {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },
    getArenas: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      
      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.ADMIN.ARENAS}?${queryParams.toString()}`
        : API_ENDPOINTS.ADMIN.ARENAS;
      
      return apiRequest(url);
    },
    getBookings: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      
      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.ADMIN.BOOKINGS}?${queryParams.toString()}`
        : API_ENDPOINTS.ADMIN.BOOKINGS;
      
      return apiRequest(url);
    },
    markBookingCompleted: async (id: string, notes?: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.MARK_BOOKING_COMPLETED(id), {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
    },
    getBookingsNeedingAttention: async (params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.ADMIN.BOOKINGS_NEEDING_ATTENTION}?${queryParams.toString()}`
        : API_ENDPOINTS.ADMIN.BOOKINGS_NEEDING_ATTENTION;
      
      return apiRequest(url);
    },
    updateArenaStatus: async (id: string, status: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.UPDATE_ARENA_STATUS(id), {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    deleteArena: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.DELETE_ARENA(id), {
        method: 'DELETE',
      });
    },
    getBookings: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      
      const url = queryParams.toString()
        ? `${API_ENDPOINTS.ADMIN.BOOKINGS}?${queryParams.toString()}`
        : API_ENDPOINTS.ADMIN.BOOKINGS;
      
      return apiRequest(url);
    },
    // Analytics
    getBookingsAnalytics: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.groupBy) queryParams.append('groupBy', params.groupBy);
      return apiRequest(`${API_ENDPOINTS.ADMIN.ANALYTICS_BOOKINGS}?${queryParams.toString()}`);
    },
    getRevenueAnalytics: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.groupBy) queryParams.append('groupBy', params.groupBy);
      return apiRequest(`${API_ENDPOINTS.ADMIN.ANALYTICS_REVENUE}?${queryParams.toString()}`);
    },
    getUserActivityAnalytics: async (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      return apiRequest(`${API_ENDPOINTS.ADMIN.ANALYTICS_USERS}?${queryParams.toString()}`);
    },
    getArenaPopularityAnalytics: async (limit?: number) => {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit.toString());
      return apiRequest(`${API_ENDPOINTS.ADMIN.ANALYTICS_ARENAS}?${queryParams.toString()}`);
    },
    // Payments
    getPayments: async (params?: { page?: number; limit?: number; status?: string; provider?: string; startDate?: string; endDate?: string; arenaId?: string; userId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.provider) queryParams.append('provider', params.provider);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.arenaId) queryParams.append('arenaId', params.arenaId);
      if (params?.userId) queryParams.append('userId', params.userId);
      return apiRequest(`${API_ENDPOINTS.ADMIN.PAYMENTS}?${queryParams.toString()}`);
    },
    getPaymentById: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.PAYMENT_BY_ID(id));
    },
    getPaymentStats: async () => {
      return apiRequest(API_ENDPOINTS.ADMIN.PAYMENT_STATS);
    },
    createRefund: async (paymentId: string, amount?: number, reason?: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.CREATE_REFUND(paymentId), {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      });
    },
    getRefunds: async (params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      return apiRequest(`${API_ENDPOINTS.ADMIN.REFUNDS}?${queryParams.toString()}`);
    },
    // Ratings
    getRatings: async (params?: { page?: number; limit?: number; arenaId?: string; userId?: string; stars?: number; hasComment?: boolean; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.arenaId) queryParams.append('arenaId', params.arenaId);
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.stars) queryParams.append('stars', params.stars.toString());
      if (params?.hasComment !== undefined) queryParams.append('hasComment', params.hasComment.toString());
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      return apiRequest(`${API_ENDPOINTS.ADMIN.RATINGS}?${queryParams.toString()}`);
    },
    getRatingById: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.RATING_BY_ID(id));
    },
    getRatingStats: async () => {
      return apiRequest(API_ENDPOINTS.ADMIN.RATING_STATS);
    },
    deleteRating: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.DELETE_RATING(id), {
        method: 'DELETE',
      });
    },
    // Notifications
    getNotifications: async (params?: { page?: number; limit?: number; type?: string; channel?: string; isRead?: boolean; userId?: string; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.channel) queryParams.append('channel', params.channel);
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      return apiRequest(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS}?${queryParams.toString()}`);
    },
    getNotificationStats: async () => {
      return apiRequest(API_ENDPOINTS.ADMIN.NOTIFICATION_STATS);
    },
    sendBulkNotification: async (userIds: string[], type: string, payload: any, channel?: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.SEND_BULK_NOTIFICATION, {
        method: 'POST',
        body: JSON.stringify({ userIds, type, payload, channel }),
      });
    },
    // Audit & Security
    getAuditLogs: async (params?: { page?: number; limit?: number; userId?: string; action?: string; resource?: string; resourceId?: string; ipAddress?: string; startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.action) queryParams.append('action', params.action);
      if (params?.resource) queryParams.append('resource', params.resource);
      if (params?.resourceId) queryParams.append('resourceId', params.resourceId);
      if (params?.ipAddress) queryParams.append('ipAddress', params.ipAddress);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      return apiRequest(`${API_ENDPOINTS.ADMIN.AUDIT_LOGS}?${queryParams.toString()}`);
    },
    getSuspiciousActivity: async () => {
      return apiRequest(API_ENDPOINTS.ADMIN.SUSPICIOUS_ACTIVITY);
    },
    blockUser: async (id: string, reason?: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.BLOCK_USER(id), {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    unblockUser: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.UNBLOCK_USER(id), {
        method: 'POST',
      });
    },
    // Settings
    getSettings: async () => {
      return apiRequest(API_ENDPOINTS.ADMIN.SETTINGS);
    },
    updateSettings: async (settings: any) => {
      return apiRequest(API_ENDPOINTS.ADMIN.SETTINGS, {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
    },
    getSettingsHistory: async (params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      return apiRequest(`${API_ENDPOINTS.ADMIN.SETTINGS_HISTORY}?${queryParams.toString()}`);
    },
    // Extended Arena Management
    updateArena: async (id: string, data: any) => {
      return apiRequest(API_ENDPOINTS.ADMIN.UPDATE_ARENA(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    bulkUpdateArenaStatus: async (arenaIds: string[], status: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.BULK_UPDATE_ARENA_STATUS, {
        method: 'POST',
        body: JSON.stringify({ arenaIds, status }),
      });
    },
    verifyArena: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.VERIFY_ARENA(id), {
        method: 'POST',
      });
    },
    getArenaStats: async (id: string) => {
      return apiRequest(API_ENDPOINTS.ADMIN.ARENA_STATS(id));
    },
  },
};

