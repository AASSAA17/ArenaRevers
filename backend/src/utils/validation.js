import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string()
      .min(2, 'Аты-жөні кемінде 2 символ болуы керек')
      .max(100, 'Аты-жөні 100 символдан аспауы керек')
      .regex(/^[a-zA-Zа-яА-ЯёЁәіңғұқөһӘІҢҒҰҚӨҺ\s\-']+$/, 'Аты-жөні тек әріптерден, бос орындардан және дефис/апострофтан тұруы керек'),
    email: z.string()
      .email('Дұрыс email енгізіңіз. Мысал: user@example.com')
      .max(254, 'Email тым ұзын. Максимум 254 символ')
      .refine((val) => !val.includes('..'), 'Email дұрыс емес. Тізбектелген нүктелерге рұқсат етілмейді'),
    phone: z.string()
      .optional()
      .or(z.literal(''))
      .refine((val) => {
        if (!val || val.trim() === '') return true;
        const digits = val.replace(/\D/g, '');
        return (digits.length === 11 && digits.startsWith('7')) || 
               (digits.length === 10);
      }, 'Дұрыс телефон нөмірін енгізіңіз. Мысал: +7 (700) 123-45-67'),
    password: z.string()
      .min(8, 'Құпия сөз кемінде 8 символ болуы керек')
      .max(128, 'Құпия сөз 128 символдан аспауы керек')
      .regex(/[A-Z]/, 'Құпия сөзде кемінде бір бас әріп болуы керек')
      .regex(/[0-9]/, 'Құпия сөзде кемінде бір сан болуы керек'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Arena schemas
export const createArenaSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    sportType: z.string().min(1),
    address: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    pricePerHour: z.number().positive(),
    timezone: z.string().default('Asia/Almaty'),
    technicalInfo: z.record(z.any()).optional(),
  }),
});

export const updateArenaSchema = z.object({
  body: createArenaSchema.shape.body.partial(),
});

// Booking schemas
export const createBookingSchema = z.object({
  body: z.object({
    arenaId: z.string().uuid(),
    startDatetime: z.string().datetime(),
    endDatetime: z.string().datetime(),
    paymentType: z.enum(['full', 'deposit']),
    paymentProvider: z.enum(['stripe', 'kaspi', 'cash']).optional(),
    promoCode: z.string().optional(),
  }).refine((data) => {
    const start = new Date(data.startDatetime);
    const end = new Date(data.endDatetime);
    return end > start;
  }, {
    message: 'End datetime must be after start datetime',
  }),
});

export const updateBookingSchema = z.object({
  body: z.object({
    startDatetime: z.string().datetime().optional(),
    endDatetime: z.string().datetime().optional(),
    promoCode: z.string().optional(),
  }).refine((data) => {
    if (data.startDatetime && data.endDatetime) {
      const start = new Date(data.startDatetime);
      const end = new Date(data.endDatetime);
      return end > start;
    }
    return true;
  }, {
    message: 'End datetime must be after start datetime',
  }),
});

export const checkAvailabilitySchema = z.object({
  body: z.object({
    startDatetime: z.string().datetime(),
    endDatetime: z.string().datetime(),
  }),
});

// Payment schemas
export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    amount: z.number().positive().optional(),
    provider: z.enum(['stripe', 'kaspi', 'cash']),
    type: z.enum(['full', 'deposit']),
  }),
});

// Card payment schema
export const processCardPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().uuid(),
    cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
    expiryYear: z.string().regex(/^\d{2}$/, 'Invalid year'),
    cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
    cardHolder: z.string().min(2, 'Card holder name is required'),
  }),
});

// Rating schemas
export const createRatingSchema = z.object({
  body: z.object({
    stars: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

// Query schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  }).optional(),
});

export const arenaSearchSchema = z.object({
  query: z.object({
    sport: z.string().optional(),
    search: z.string().optional(),
    lat: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    lng: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    radius: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    minPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
  }).optional(),
});

export const addFavoriteSchema = z.object({
  body: z.object({
    arenaId: z.string().uuid(),
  }),
});

