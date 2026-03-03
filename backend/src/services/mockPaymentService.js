// Локальный сервис оплаты без Stripe API
// Всегда возвращает успешный результат для тестирования

export const createPaymentSession = async (data) => {
  const { paymentId, bookingId, amount, currency, customerEmail, metadata } = data;

  // Генерируем фиктивный ID сессии
  const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: sessionId,
    session_id: sessionId,
    checkout_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/bookings/success?session_id=${sessionId}`,
  };
};

export const createPaymentIntent = async (data) => {
  const { paymentId, bookingId, amount, currency, customerEmail, metadata } = data;

  // Генерируем фиктивный ID payment intent
  const intentId = `mock_intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientSecret = `mock_secret_${intentId}`;

  return {
    id: intentId,
    client_secret: clientSecret,
  };
};

export const createPaymentMethod = async (cardData) => {
  const { cardNumber, expiryMonth, expiryYear, cvv, cardHolder } = cardData;

  // Простая валидация формата карты (не проверяем реальность)
  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    throw new Error('Invalid card number format');
  }

  // Генерируем фиктивный ID payment method
  const methodId = `mock_method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log('💳 Mock payment: Payment method created successfully');
  console.log(`   Card: ****${cleanCardNumber.slice(-4)}`);
  console.log(`   Holder: ${cardHolder || 'N/A'}`);

  return {
    id: methodId,
  };
};

export const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  // Всегда возвращаем успешный результат
  console.log('✅ Mock payment: Payment confirmed successfully');
  console.log(`   Intent ID: ${paymentIntentId}`);
  console.log(`   Method ID: ${paymentMethodId}`);

  return {
    status: 'succeeded',
    id: paymentIntentId,
    amount: 0, // Будет переопределено из payment record
  };
};

export const processStripeWebhook = async (payload, signature) => {
  // Для mock сервиса всегда возвращаем успешный результат
  console.log('📥 Mock webhook: Processing payment webhook');

  // Пытаемся извлечь данные из payload
  let paymentId, bookingId;
  
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    paymentId = data?.metadata?.paymentId || data?.data?.object?.metadata?.paymentId;
    bookingId = data?.metadata?.bookingId || data?.data?.object?.metadata?.bookingId;
  } catch (e) {
    // Игнорируем ошибки парсинга
  }

  if (paymentId && bookingId) {
    return {
      paymentId,
      bookingId,
      providerPaymentId: `mock_${Date.now()}`,
      status: 'succeeded',
      amount: 0,
    };
  }

  return null;
};

