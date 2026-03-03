import axios from 'axios';

const KASPI_API_URL = process.env.KASPI_API_URL || 'https://api.kaspi.kz';
const KASPI_API_KEY = process.env.KASPI_API_KEY;
const KASPI_MERCHANT_ID = process.env.KASPI_MERCHANT_ID;

export const createKaspiPayment = async (data) => {
  const { paymentId, bookingId, amount, metadata } = data;

  // Kaspi Pay API integration
  // This is a placeholder - actual implementation depends on Kaspi Pay API documentation
  try {
    const response = await axios.post(
      `${KASPI_API_URL}/payments/create`,
      {
        merchant_id: KASPI_MERCHANT_ID,
        amount: amount,
        currency: 'KZT',
        order_id: bookingId,
        description: `Booking payment #${bookingId.substring(0, 8)}`,
        return_url: `${process.env.FRONTEND_URL}/bookings/success`,
        cancel_url: `${process.env.FRONTEND_URL}/bookings/cancel`,
        metadata: {
          ...metadata,
          paymentId,
          bookingId,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${KASPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.payment_id,
      payment_id: response.data.payment_id,
      redirect_url: response.data.redirect_url,
      qr_code: response.data.qr_code, // If available
    };
  } catch (error) {
    throw new Error(`Kaspi Pay API error: ${error.message}`);
  }
};

export const processKaspiWebhook = async (payload, signature) => {
  // Verify webhook signature
  // Implementation depends on Kaspi Pay webhook verification method

  if (payload.status === 'success' || payload.status === 'completed') {
    const { paymentId, bookingId } = payload.metadata || {};

    if (!paymentId || !bookingId) {
      throw new Error('Missing metadata in webhook');
    }

    return {
      paymentId,
      bookingId,
      providerPaymentId: payload.payment_id,
      status: 'succeeded',
      amount: payload.amount,
    };
  }

  return null;
};

