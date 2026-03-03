import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { BottomSheet } from './BottomSheet';
import { api } from '../utils/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  arenaName: string;
  arenaId?: string;
  price: number;
  onConfirm: (details: { date: string; time: string; duration: number }) => void;
  onBookingCreated?: () => void; // Брондаудан кейін күнтізбені жаңарту үшін callback
  calendarRefresh?: number; // Күнтізбені жаңарту үшін триггер
  initialDate?: string;
  initialTime?: string;
  initialDuration?: number;
  bookingId?: number; // Өңдеу үшін брондау ID
}

const MAX_DURATION = 6;
const MIN_DURATION = 1;

export function BookingModal({ isOpen, onClose, arenaName, arenaId, price, onConfirm, onBookingCreated, calendarRefresh, initialDate, initialTime, initialDuration, bookingId }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  
  // Модалдық терезені ашқанда қалпына келтіру немесе өңдеу үшін бастапқы мәндерді орнату
  useEffect(() => {
    if (isOpen) {
      if (initialDate && initialTime && initialDuration) {
        setSelectedDate(initialDate);
        setSelectedTime(initialTime);
        setDuration(initialDuration);
      } else {
        setSelectedDate('');
        setSelectedTime('');
        setDuration(1);
      }
    }
  }, [isOpen, initialDate, initialTime, initialDuration]);

  // Күнді таңдағанда бос емес слоттарды жүктеу
  useEffect(() => {
    if (selectedDate && arenaId) {
      loadBookedSlots(selectedDate);
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate, arenaId, calendarRefresh]); // Брондаудан кейін жаңарту үшін calendarRefresh қосылды

  // calendarRefresh өзгерген кезде күнтізбені жаңарту
  useEffect(() => {
    if (calendarRefresh && selectedDate && arenaId) {
      loadBookedSlots(selectedDate);
    }
  }, [calendarRefresh]);

  const loadBookedSlots = async (date: string) => {
    if (!arenaId) return;
    
    setLoadingAvailability(true);
    try {
      const startDate = new Date(date + 'T00:00:00');
      const endDate = new Date(date + 'T23:59:59');
      
      const calendar = await api.getArenaCalendar(arenaId, startDate.toISOString(), endDate.toISOString());
      
      const slots: string[] = [];
      calendar.forEach((booking: any) => {
        // Өңдеу кезінде ағымдағы брондауды бос емес слоттардан шығару
        if (bookingId && booking.id === String(bookingId)) {
          return;
        }
        
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        
        let current = new Date(start);
        while (current < end) {
          const hour = current.getHours();
          const slot = `${hour.toString().padStart(2, '0')}:00`;
          if (!slots.includes(slot)) {
            slots.push(slot);
          }
          current.setHours(current.getHours() + 1);
        }
      });
      
      setBookedSlots(slots);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading availability:', error);
      }
      setBookedSlots([]);
      // Show error to user if needed
    } finally {
      setLoadingAvailability(false);
    }
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  // Ұзақтығын ескере отырып, слот қолжетімді ме екенін тексеру
  const isSlotAvailable = (time: string): boolean => {
    if (!selectedDate) return true;
    
    const timeIndex = timeSlots.indexOf(time);
    if (timeIndex === -1) return false;

    for (let i = 0; i < duration; i++) {
      const slotIndex = timeIndex + i;
      if (slotIndex >= timeSlots.length) return false;
      
      const slot = timeSlots[slotIndex];
      if (bookedSlots.includes(slot)) return false;
    }

    return true;
  };

  // Слоттың өткен уақыт екенін тексеру
  const isPastTime = (time: string): boolean => {
    if (!selectedDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [hour] = time.split(':').map(Number);
    
    if (hour < currentHour) return true;
    if (hour === currentHour && currentMinute > 30) return true;
    
    return false;
  };

  // Таңдалған уақыт пен ұзақтықта бос емес болатын барлық слоттарды алу
  const getSelectedSlots = (): string[] => {
    if (!selectedTime) return [];
    
    const timeIndex = timeSlots.indexOf(selectedTime);
    if (timeIndex === -1) return [];

    const slots: string[] = [];
    for (let i = 0; i < duration; i++) {
      const slotIndex = timeIndex + i;
      if (slotIndex < timeSlots.length) {
        slots.push(timeSlots[slotIndex]);
      }
    }
    return slots;
  };

  // Аяқталу уақытын есептеу
  const getEndTime = (): string => {
    if (!selectedTime) return '';
    
    const timeIndex = timeSlots.indexOf(selectedTime);
    if (timeIndex === -1) return '';

    const endIndex = timeIndex + duration;
    if (endIndex >= timeSlots.length) return '';

    return timeSlots[endIndex];
  };

  const totalPrice = price * duration;
  const selectedSlots = getSelectedSlots();
  const endTime = getEndTime();

  // Растау алдында валидация
  const canConfirm = (): boolean => {
    if (!selectedDate || !selectedTime || !arenaId) return false;
    
    // Барлық слоттардың қолжетімділігін тексеру
    const timeIndex = timeSlots.indexOf(selectedTime);
    if (timeIndex === -1) return false;
    
    for (let i = 0; i < duration; i++) {
      const slotIndex = timeIndex + i;
      if (slotIndex >= timeSlots.length) return false;
      
      const slot = timeSlots[slotIndex];
      if (!isSlotAvailable(slot) || isPastTime(slot)) {
        return false;
      }
    }
    
    return true;
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={bookingId ? 'Брондауды өзгерту' : 'Брондау растау'}
    >
      <div className="flex flex-col gap-6">
          <div className="bg-[#EAFBF3] p-4 rounded-xl">
            <h3 className="text-[#1A1A1A] mb-1">{arenaName}</h3>
            <p className="body-s text-[#4D4D4D]">{price} ₸ / сағат</p>
          </div>
          
          {/* Date Selection */}
          <div>
            <label className="body-s text-[#4D4D4D] mb-3 flex items-center gap-2">
              <Calendar size={18} />
              Күнді таңдаңыз
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime('');
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
            {loadingAvailability && (
              <p className="body-s text-[#4D4D4D] mt-2">Қолжетімділікті тексеру...</p>
            )}
          </div>
          
          {/* Time Selection */}
          <div>
            <label className="body-s text-[#4D4D4D] mb-3 flex items-center gap-2">
              <Clock size={18} />
              Уақытты таңдаңыз
              {!selectedDate && (
                <span className="body-s text-[#808080] ml-2">(Алдымен күнді таңдаңыз)</span>
              )}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const isBooked = bookedSlots.includes(time);
                const isSelected = selectedTime === time;
                const isInSelectedRange = selectedSlots.includes(time);
                const isPast = isPastTime(time);
                const isAvailable = isSlotAvailable(time) && !isPast;
                
                return (
                  <button
                    key={time}
                    onClick={() => {
                      if (selectedDate && isAvailable && !isBooked && !isPast) {
                        setSelectedTime(time);
                      }
                    }}
                    disabled={!selectedDate || !isAvailable || isBooked || isPast}
                    className={`
                      h-12 rounded-lg border transition-all
                      ${!selectedDate ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9] opacity-50' : ''}
                      ${isPast ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9]' : ''}
                      ${isBooked ? 'bg-[#D9D9D9] text-[#808080] cursor-not-allowed border-[#D9D9D9]' : ''}
                      ${isSelected ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : ''}
                      ${isInSelectedRange && !isSelected ? 'bg-[#EAFBF3] border-[#2ECC71]' : ''}
                      ${selectedDate && isAvailable && !isSelected && !isInSelectedRange ? 'bg-white border-[#D9D9D9] hover:border-[#2ECC71] hover:bg-[#EAFBF3]' : ''}
                    `}
                    title={
                      !selectedDate
                        ? 'Алдымен күнді таңдаңыз'
                        : isPast 
                        ? 'Өткен уақыт' 
                        : isBooked 
                        ? 'Брондалған' 
                        : !isAvailable 
                        ? 'Қолжетімсіз' 
                        : ''
                    }
                  >
                    <span className="body-s">{time}</span>
                  </button>
                );
              })}
            </div>
            {selectedTime && duration > 1 && (
              <p className="body-s text-[#4D4D4D] mt-2">
                Таңдалған: {selectedTime} - {endTime} ({duration} сағат)
              </p>
            )}
          </div>
          
          {/* Duration */}
          <div>
            <label className="body-s text-[#4D4D4D] mb-3 block">
              Ұзақтығы (сағат)
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDuration(Math.max(MIN_DURATION, duration - 1))}
                disabled={duration <= MIN_DURATION}
                className={`
                  w-12 h-12 rounded-lg border transition-colors
                  ${duration <= MIN_DURATION ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9]' : 'border-[#D9D9D9] hover:bg-[#F5F5F5]'}
                `}
              >
                -
              </button>
              <span className="body-l min-w-[3rem] text-center">{duration}</span>
              <button
                onClick={() => {
                  const newDuration = duration + 1;
                  if (newDuration <= MAX_DURATION && (!selectedTime || isSlotAvailable(selectedTime))) {
                    setDuration(newDuration);
                  }
                }}
                disabled={duration >= MAX_DURATION || (selectedTime && !isSlotAvailable(selectedTime))}
                className={`
                  w-12 h-12 rounded-lg border transition-colors
                  ${duration >= MAX_DURATION || (selectedTime && !isSlotAvailable(selectedTime)) ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9]' : 'border-[#D9D9D9] hover:bg-[#F5F5F5]'}
                `}
              >
                +
              </button>
            </div>
            <p className="body-s text-[#808080] mt-2">
              Максималды ұзақтығы: {MAX_DURATION} сағат
            </p>
          </div>
          
          {/* Total */}
          <div className="bg-[#F5F5F5] p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="body-l text-[#4D4D4D]">Жалпы сома:</span>
              {selectedTime && endTime && (
                <p className="body-s text-[#808080] mt-1">
                  {selectedTime} - {endTime}
                </p>
              )}
            </div>
            <span className="text-[#2ECC71] font-semibold">{totalPrice} ₸</span>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={onClose} className="flex-1">
              Болдырмау
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (canConfirm()) {
                  onConfirm({ date: selectedDate, time: selectedTime, duration });
                }
              }}
              disabled={!canConfirm()}
              className="flex-1"
            >
              {bookingId ? 'Сақтау' : 'Төлемге өту'}
            </Button>
          </div>
        </div>
    </BottomSheet>
  );
}
