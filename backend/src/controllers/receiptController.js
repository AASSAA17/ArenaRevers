import PDFDocument from 'pdfkit';
import * as bookingService from '../services/bookingService.js';
import prisma from '../config/database.js';

export const downloadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get booking with payment info
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        arena: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          where: {
            status: 'succeeded',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (booking.payments.length === 0) {
      return res.status(400).json({ error: 'No payment found for this booking' });
    }

    const payment = booking.payments[0];

    // Create PDF with Unicode support
    const doc = new PDFDocument({ 
      margin: 50,
      autoFirstPage: true
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${booking.id}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to format dates
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Helper function to safely encode text for PDF
    const safeText = (text) => {
      if (!text) return '';
      // Ensure text is properly encoded as UTF-8
      return String(text).normalize('NFC');
    };

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('ArenaBook', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text(safeText('Receipt'), { align: 'center' });
    doc.moveDown(2);

    // Booking details
    doc.fontSize(12).font('Helvetica');
    doc.text(safeText(`Booking #: ${booking.id}`), { align: 'left' });
    doc.text(safeText(`Date: ${formatDate(booking.createdAt)}`), { align: 'left' });
    doc.moveDown();

    // Arena info
    doc.fontSize(14).font('Helvetica-Bold').text(safeText('Arena Information:'), { underline: true });
    doc.fontSize(12).font('Helvetica');
    doc.text(safeText(`Name: ${booking.arena.title || 'Arena'}`));
    doc.text(safeText(`Address: ${booking.arena.address || 'Address not specified'}`));
    doc.moveDown();

    // Booking time
    doc.fontSize(14).font('Helvetica-Bold').text(safeText('Booking Time:'), { underline: true });
    doc.fontSize(12).font('Helvetica');
    doc.text(safeText(`Start: ${formatDateTime(booking.startDatetime)}`));
    doc.text(safeText(`End: ${formatDateTime(booking.endDatetime)}`));
    doc.moveDown();

    // Payment info
    doc.fontSize(14).font('Helvetica-Bold').text(safeText('Payment Information:'), { underline: true });
    doc.fontSize(12).font('Helvetica');
    doc.text(safeText(`Amount: ${Number(booking.totalAmount || 0).toFixed(2)} ₸`));
    
    // Translate payment provider
    const providerNames = {
      'cash': 'Cash',
      'stripe': 'Stripe',
      'kaspi': 'Kaspi.kz'
    };
    doc.text(safeText(`Payment Method: ${providerNames[payment.provider] || payment.provider}`));
    doc.text(safeText(`Payment Status: ${payment.status === 'succeeded' ? 'Paid' : 'Pending'}`));
    doc.moveDown();

    // User info
    doc.fontSize(14).font('Helvetica-Bold').text(safeText('Client Information:'), { underline: true });
    doc.fontSize(12).font('Helvetica');
    doc.text(safeText(`Full Name: ${booking.user.fullName || 'Not specified'}`));
    if (booking.user.email) {
      doc.text(safeText(`Email: ${booking.user.email}`));
    }
    if (booking.user.phone) {
      doc.text(safeText(`Phone: ${booking.user.phone}`));
    }
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).font('Helvetica').text(safeText('Thank you!'), { align: 'center' });
    doc.text(safeText('ArenaBook - Sports Arena Booking Platform'), { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};

