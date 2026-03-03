import prisma from '../config/database.js';
import * as bookingService from '../services/bookingService.js';
import * as paymentService from '../services/paymentService.js';

export const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDatetime, endDatetime } = req.body;
    
    const result = await bookingService.checkAvailability(
      id,
      startDatetime,
      endDatetime
    );
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getArenaCalendar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters are required' });
    }
    
    const events = await bookingService.getArenaCalendar(id, start, end);
    res.json({ events });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const result = await bookingService.createBooking(req.body, req.user.id);
    
    // Create payment for all payment providers (including cash)
    let paymentSession = null;
    let payment = null;
    
    if (req.body.paymentProvider) {
      const paymentResult = await paymentService.createPayment({
        bookingId: result.booking.id,
        provider: req.body.paymentProvider,
        type: req.body.paymentType,
        amount: result.amountToPay,
      }, req.user.id);
      
      payment = paymentResult.payment;
      paymentSession = paymentResult.paymentSession;
      
      // If cash payment, mark as paid immediately and update booking
      if (req.body.paymentProvider === 'cash') {
        await paymentService.confirmPayment(payment.id, req.user.id);
        // Update booking payment status
        await prisma.booking.update({
          where: { id: result.booking.id },
          data: {
            paymentStatus: 'paid',
            paidAmount: result.amountToPay,
            status: 'confirmed',
          },
        });
      }
    }
    
    const response = {
      booking_id: result.booking.id,
      total_amount: result.totalAmount,
      amount_to_pay: result.amountToPay,
      currency: 'KZT',
      status: result.booking.status,
      payment_session: paymentSession,
      payment_id: payment?.id || null,
    };

    // Add hold_expires_at if booking is in hold status
    if (result.booking.status === 'hold' && result.holdExpiresAt) {
      response.hold_expires_at = result.holdExpiresAt;
    }
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(
      id,
      req.user.id,
      req.user.role
    );
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await bookingService.getUserBookings(
      req.user.id,
      page,
      limit
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.cancelBooking(
      id,
      req.user.id,
      req.user.role
    );
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.updateBooking(
      id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.confirmBooking(
      id,
      req.user.id,
      req.user.role
    );
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const downloadReceipt = async (req, res, next) => {
  try {
    const { downloadReceipt: downloadReceiptHandler } = await import('../controllers/receiptController.js');
    return downloadReceiptHandler(req, res, next);
  } catch (error) {
    next(error);
  }
};

