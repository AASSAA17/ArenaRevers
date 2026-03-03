import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { BottomSheet } from './BottomSheet';
import { ProgressIndicator } from './ProgressIndicator';
import { api } from '../utils/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  bookingDetails: {
    arenaName: string;
    date: string;
    time: string;
    duration: number;
  };
  arenaId?: string;
  paymentId?: string; // Payment ID from booking creation
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount, bookingDetails, arenaId, paymentId }: PaymentModalProps) {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: form, 1: validating, 2: processing, 3: confirming

  const paymentSteps = ['Деректерді енгізу', 'Тексеру', 'Өңдеу', 'Растау'];

  // Reset errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setIsProcessing(false);
    }
  }, [isOpen]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardData.cardNumber) {
      newErrors.cardNumber = 'Карта нөмірі міндетті';
    } else if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Карта нөмірі 16 санынан тұруы керек';
    }

    if (!cardData.cardHolder) {
      newErrors.cardHolder = 'Карта иесінің аты міндетті';
    }

    if (!cardData.expiryDate) {
      newErrors.expiryDate = 'Жарамдылық мерзімі міндетті';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = 'Формат: MM/YY';
    } else {
      // Картаның жарамдылық мерзімін тексеру
      const [month, year] = cardData.expiryDate.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Жылдың соңғы 2 цифры
      const currentMonth = currentDate.getMonth() + 1; // Ай (1-12)
      
      // Жылдың өткенде емес екенін тексеру
      if (year < currentYear) {
        newErrors.expiryDate = 'Картаның мерзімі өтіп кеткен';
      } else if (year === currentYear && month < currentMonth) {
        // Егер жыл ағымдағы болса, айды тексеру
        newErrors.expiryDate = 'Картаның мерзімі өтіп кеткен';
      } else if (month < 1 || month > 12) {
        // Айдың жарамдылығын тексеру
        newErrors.expiryDate = 'Жарамсыз ай';
      }
    }

    if (!cardData.cvv) {
      newErrors.cvv = 'CVV міндетті';
    } else if (cardData.cvv.length !== 3) {
      newErrors.cvv = 'CVV 3 санынан тұруы керек';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!paymentId) {
      setErrors({ 
        submit: 'Төлем ID табылмады. Қайталап көріңіз.' 
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStep(1); // Validating
    
    try {
      // Extract month and year from expiry date (MM/YY)
      const [month, year] = cardData.expiryDate.split('/');
      
      // Remove spaces from card number
      const cardNumber = cardData.cardNumber.replace(/\s/g, '');
      
      setPaymentStep(2); // Processing
      
      // Process card payment through API
      const result = await api.processCardPayment({
        paymentId,
        cardNumber,
        expiryMonth: month,
        expiryYear: year,
        cvv: cardData.cvv,
        cardHolder: cardData.cardHolder,
      });

      if (result.success) {
        setPaymentStep(3); // Confirming
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Payment successful, call onSuccess
        onSuccess();
        
        // Reset form
        setCardData({
          cardNumber: '',
          cardHolder: '',
          expiryDate: '',
          cvv: ''
        });
        setErrors({});
        setPaymentStep(0);
      } else {
        throw new Error('Төлем сәтсіз аяқталды');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrors({ 
        submit: error.message || 'Төлем кезінде қате орын алды. Қайталап көріңіз.' 
      });
      setPaymentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Төлем" showCloseButton={!isProcessing} isProcessing={isProcessing}>
      <div className="space-y-6">
        {/* Progress Indicator */}
        {isProcessing && (
          <div className="pb-4">
            <ProgressIndicator 
              steps={paymentSteps} 
              currentStep={paymentStep + 1} 
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-[#EAFBF3] p-4 rounded-xl space-y-2">
            <h3 className="text-[#1A1A1A]">{bookingDetails.arenaName}</h3>
            <div className="space-y-1">
              <p className="body-s text-[#4D4D4D]">
                📅 {bookingDetails.date} - {bookingDetails.time}
              </p>
              <p className="body-s text-[#4D4D4D]">
                ⏱ Ұзақтығы: {bookingDetails.duration} сағат
              </p>
            </div>
            <div className="pt-2 border-t border-[#2ECC71]/20">
              <div className="flex justify-between items-center">
                <span className="body-l text-[#4D4D4D]">Төлем сомасы:</span>
                <span className="text-[#2ECC71]">{amount} ₸</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#808080] mb-4">
              <Lock size={16} />
              <span className="caption-r">Қауіпсіз төлем SSL шифрлауымен қорғалған</span>
            </div>

            <Input
              label="Карта нөмірі"
              placeholder="0000 0000 0000 0000"
              value={cardData.cardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                setCardData({ ...cardData, cardNumber: formatCardNumber(value) });
              }}
              error={errors.cardNumber}
            />

            <Input
              label="Карта иесінің аты"
              placeholder="NAME SURNAME"
              value={cardData.cardHolder}
              onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
              error={errors.cardHolder}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Жарамдылық мерзімі"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCardData({ ...cardData, expiryDate: formatExpiryDate(value) });
                }}
                error={errors.expiryDate}
              />

              <Input
                label="CVV"
                type="password"
                placeholder="•••"
                maxLength={3}
                value={cardData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setCardData({ ...cardData, cvv: value });
                }}
                error={errors.cvv}
              />
            </div>

            {/* Payment Methods */}
            <div className="pt-4">
              <p className="body-s text-[#4D4D4D] mb-3">Қабылданатын картalar:</p>
              <div className="flex gap-3">
                <div className="px-4 py-2 border border-[#D9D9D9] rounded-lg">
                  <span className="body-s">💳 Visa</span>
                </div>
                <div className="px-4 py-2 border border-[#D9D9D9] rounded-lg">
                  <span className="body-s">💳 Mastercard</span>
                </div>
                <div className="px-4 py-2 border border-[#D9D9D9] rounded-lg">
                  <span className="body-s">💳 МИР</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                variant="secondary" 
                size="lg" 
                onClick={onClose} 
                className="flex-1"
                disabled={isProcessing}
              >
                Болдырмау
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Өңделуде...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Төлем жасау {amount} ₸
                  </span>
                )}
              </Button>
            </div>
            
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-[#FEE] border border-[#E74C3C] text-[#E74C3C] px-4 py-3 rounded-lg">
                <p className="body-s">{errors.submit}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </BottomSheet>
  );
}
