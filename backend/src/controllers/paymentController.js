import * as paymentService from '../services/paymentService.js';

export const createPayment = async (req, res, next) => {
  try {
    const result = await paymentService.createPayment(req.body, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const provider = req.params.provider; // stripe or kaspi
    const signature = req.headers['stripe-signature'] || req.headers['x-kaspi-signature'];
    
    // For Stripe, use raw body if available
    const payload = req.rawBody || JSON.stringify(req.body);
    
    const result = await paymentService.processPaymentWebhook(
      provider,
      payload,
      signature
    );

    if (result) {
      await paymentService.updatePaymentStatus(
        result.paymentId,
        result.status,
        result.providerPaymentId
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentStatus(
      id,
      req.user.id,
      req.user.role
    );
    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

export const processCardPayment = async (req, res, next) => {
  try {
    const { paymentId, cardNumber, expiryMonth, expiryYear, cvv, cardHolder } = req.body;

    // Get payment record
    const payment = await paymentService.getPaymentById(paymentId, req.user.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Process card payment through Stripe
    const result = await paymentService.processCardPayment({
      paymentId,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolder,
      amount: Number(payment.amount),
      currency: payment.currency,
      bookingId: payment.bookingId,
      customerEmail: payment.user.email,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};