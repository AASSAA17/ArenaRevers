import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

interface CalendarPickerProps {
  arenaId?: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  bookedDates?: string[];
  calendarRefresh?: number;
}

export function CalendarPicker({ 
  arenaId, 
  selectedDate, 
  onDateSelect, 
  bookedDates = [],
  calendarRefresh 
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [busyDates, setBusyDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Ағымдағы ай үшін бос емес күндерді жүктеу
  useEffect(() => {
    if (arenaId) {
      loadBusyDates();
    }
  }, [arenaId, currentMonth, calendarRefresh]);

  const loadBusyDates = async () => {
    if (!arenaId) return;
    
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      
      const calendar = await api.getArenaCalendar(
        arenaId, 
        startDate.toISOString(), 
        endDate.toISOString()
      );
      
      const dates: string[] = [];
      calendar.forEach((booking: any) => {
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        
        let current = new Date(start);
        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          if (!dates.includes(dateStr)) {
            dates.push(dateStr);
          }
          current.setDate(current.getDate() + 1);
        }
      });
      
      setBusyDates(dates);
    } catch (error) {
      console.error('Error loading busy dates:', error);
      setBusyDates([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Апта күнін алу (0 = жексенбі, 1 = дүйсенбі, ..., 6 = сенбі)
    let startingDayOfWeek = firstDay.getDay();
    
    // Түрлендіру: апта дүйсенбіден басталады (0 = дүйсенбі, 6 = жексенбі)
    // Жексенбі (0) -> 6, дүйсенбі (1) -> 0, сейсенбі (2) -> 1, т.б.
    if (startingDayOfWeek === 0) {
      startingDayOfWeek = 6; // Жексенбі аптаның соңғы күніне айналады
    } else {
      startingDayOfWeek = startingDayOfWeek - 1; // 1 күнге артқа жылжыту
    }
    
    const days: (Date | null)[] = [];
    
    // Алдыңғы айдың күндері үшін бос ұяшықтарды қосу
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Ағымдағы айдың күндерін қосу
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateBusy = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return busyDates.includes(dateStr) || bookedDates.includes(dateStr);
  };

  const isDatePast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const handleDateClick = (date: Date) => {
    if (isDatePast(date) || isDateBusy(date)) return;
    onDateSelect(date.toISOString().split('T')[0]);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
    'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'
  ];

  const weekDays = ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'];

  const days = getDaysInMonth();

  return (
    <div className="w-full">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="body-l text-[#1A1A1A]">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center body-s text-[#808080] py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square w-full" />;
          }

          const isPast = isDatePast(date);
          const isBusy = isDateBusy(date);
          const isSelected = isDateSelected(date);
          const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={isPast || isBusy}
              className={`
                w-full aspect-square rounded-lg transition-all flex items-center justify-center
                ${isPast ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed' : ''}
                ${isBusy && !isPast ? 'bg-[#FEE] text-[#E74C3C] cursor-not-allowed border border-[#E74C3C]' : ''}
                ${isSelected ? 'bg-[#2ECC71] text-white border-2 border-[#2ECC71] font-semibold' : ''}
                ${!isPast && !isBusy && !isSelected ? 'bg-white border border-[#D9D9D9] hover:border-[#2ECC71] hover:bg-[#EAFBF3]' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-[#2ECC71] ring-offset-1' : ''}
              `}
              title={
                isPast
                  ? 'Өткен күн'
                  : isBusy
                  ? 'Брондалған'
                  : isSelected
                  ? 'Таңдалған'
                  : ''
              }
            >
              <span className="body-s">{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#D9D9D9]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#2ECC71] border-2 border-[#2ECC71]"></div>
          <span className="caption-r text-[#4D4D4D]">Таңдалған</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#FEE] border border-[#E74C3C]"></div>
          <span className="caption-r text-[#4D4D4D]">Брондалған</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border border-[#D9D9D9]"></div>
          <span className="caption-r text-[#4D4D4D]">Қолжетімді</span>
        </div>
      </div>
    </div>
  );
}

