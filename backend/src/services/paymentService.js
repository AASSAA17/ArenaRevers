import prisma from '../config/database.js';
import { createPaymentSession as createMockPaymentSession } from './mockPaymentService.js';
import { createKaspiPayment } from './kaspiService.js';

// Используем mock сервис вместо Stripe (без реальных API вызовов)
const USE_MOCK_PAYMENT = process.env.USE_MOCK_PAYMENT !== 'false'; // По умолчанию true

export const createPayment = async (data, userId) => {
  const { bookingId, amount, provider, type } = data;

  // Get booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      arena: true,
      user: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId !== userId) {
    throw new Error('Not authorized');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    throw new Error('Cannot create payment for this booking');
  }

  // Calculate amount to pay
  let amountToPay = amount;
  if (!amountToPay) {
    if (type === 'deposit') {
      amountToPay = Number(booking.totalAmount) * 0.5;
    } else {
      amountToPay = Number(booking.totalAmount) - Number(booking.paidAmount);
    }
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      userId,
      amount: amountToPay,
      currency: 'KZT',
      provider,
      type,
      status: 'pending',
    },
  });

  // Create payment session based on provider
  let paymentSession = null;

  if (provider === 'stripe') {
    // Используем mock сервис вместо реального Stripe API
    paymentSession = await createMockPaymentSession({
      paymentId: payment.id,
      bookingId,
      amount: amountToPay,
      currency: 'KZT',
      customerEmail: booking.user.email,
      metadata: {
        bookingId,
        paymentId: payment.id,
        userId,
        type,
      },
    });
  } else if (provider === 'kaspi') {
    paymentSession = await createKaspiPayment({
      paymentId: payment.id,
      bookingId,
      amount: amountToPay,
      metadata: {
        bookingId,
        paymentId: payment.id,
        userId,
        type,
      },
    });
  } else if (provider === 'cash') {
    // Cash payment - mark as pending, needs manual confirmation
    return {
      payment,
      paymentSession: {
        provider: 'cash',
        status: 'pending',
        message: 'Payment will be confirmed manually',
      },
    };
  }

  // Update payment with provider payment ID
  if (paymentSession?.id) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: paymentSession.id,
        metadata: paymentSession,
      },
    });
  }

  return {
    payment,
    paymentSession: {
      provider,
      ...paymentSession,
    },
  };
};

export const processPaymentWebhook = async (provider, payload, signature) => {
  if (provider === 'stripe') {
    return await processStripeWebhook(payload, signature);
  } else if (provider === 'kaspi') {
    return await processKaspiWebhook(payload, signature);
  }

  throw new Error('Unknown payment provider');
};

const processStripeWebhook = async (payload, signature) => {
  // Используем mock сервис вместо реального Stripe API
  const { processStripeWebhook: processWebhook } = await import('./mockPaymentService.js');
  return await processWebhook(payload, signature);
};

const processKaspiWebhook = async (payload, signature) => {
  const { processKaspiWebhook: processWebhook } = await import('./kaspiService.js');
  return await processWebhook(payload, signature);
};

export const confirmPayment = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.userId !== userId) {
    throw new Error('Not authorized');
  }

  // Update payment to succeeded
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'succeeded',
      // updatedAt will be automatically updated by Prisma
    },
  });

  // Update booking payment status
  const newPaidAmount = Number(payment.booking.paidAmount) + Number(payment.amount);
  const totalAmount = Number(payment.booking.totalAmount);
  
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: {
      paidAmount: newPaidAmount,
      paymentStatus: newPaidAmount >= totalAmount ? 'paid' : 'partial',
      status: payment.booking.status === 'pending' ? 'confirmed' : payment.booking.status,
    },
  });

  return updatedPayment;
};

export const updatePaymentStatus = async (paymentId, status, providerPaymentId = null) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      ...(providerPaymentId && { providerPaymentId }),
    },
  });

  // Update booking if payment succeeded
  if (status === 'succeeded') {
    const newPaidAmount = Number(payment.booking.paidAmount) + Number(payment.amount);
    const totalAmount = Number(payment.booking.totalAmount);

    let paymentStatus = 'partial';
    if (newPaidAmount >= totalAmount) {
      paymentStatus = 'paid';
    }

    let bookingStatus = payment.booking.status;
    
    // Convert hold to confirmed/pending based on payment status
    if (bookingStatus === 'hold') {
      if (paymentStatus === 'paid') {
        bookingStatus = 'confirmed';
      } else {
        bookingStatus = 'pending'; // Partial payment, still pending full payment
      }
    } else if (paymentStatus === 'paid' && bookingStatus === 'pending') {
      bookingStatus = 'confirmed';
    }

    // Update booking: clear holdExpireAt if it was a hold, update status and payment info
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus,
        status: bookingStatus,
        paymentMethod: payment.provider,
        holdExpireAt: null, // Clear hold expiration when payment succeeds
      },
    });

    // TODO: Queue notification job
  }

  return updatedPayment;
};

export const getPaymentById = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: true,
      user: true,
    },
  });

  if (!payment) {
    return null;
  }

  if (payment.userId !== userId) {
    throw new Error('Not authorized');
  }

  return payment;
};

export const processCardPayment = async (data) => {
  const { 
    paymentId, 
    cardNumber, 
    expiryMonth, 
    expiryYear, 
    cvv, 
    cardHolder
  } = data;

  // Get payment record to get amount, currency, bookingId, etc.
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: true,
      user: true,
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Используем mock сервис вместо Stripe API
  const { createPaymentIntent, createPaymentMethod, confirmPaymentIntent } = await import('./mockPaymentService.js');

  try {
    // Create payment method
    const paymentMethod = await createPaymentMethod({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolder,
    });

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      paymentId,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      currency: payment.currency,
      customerEmail: payment.user.email,
      metadata: {
        paymentId,
        bookingId: payment.bookingId,
      },
    });

    // Confirm payment intent
    const confirmed = await confirmPaymentIntent(paymentIntent.id, paymentMethod.id);

    // Mock сервис всегда возвращает успешный результат
    if (confirmed.status === 'succeeded') {
      // Update payment status
      await updatePaymentStatus(paymentId, 'succeeded', paymentIntent.id);

      console.log(`✅ Mock payment: Payment ${paymentId} processed successfully`);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: 'succeeded',
      };
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    console.error('Card payment error:', error);
    throw new Error(error.message || 'Payment processing failed');
  }
};

export const getPaymentStatus = async (paymentId, userId, userRole) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          arena: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Check authorization
  if (payment.userId !== userId && payment.booking.arena.ownerId !== userId && userRole !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  return payment;
};

