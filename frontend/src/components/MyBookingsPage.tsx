import React, { useState } from 'react';
import { Calendar, MapPin, Clock, CreditCard, CheckCircle, XCircle, Download, Star, Share2, Navigation, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Tag } from './Tag';
import { api } from '../utils/api';
import { RatingModal } from './RatingModal';

interface Booking {
  id: number;
  arenaName: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
}

interface MyBookingsPageProps {
  bookings: Booking[];
  onCancelBooking: (id: number) => void;
  onEditBooking?: (booking: Booking) => void;
  arenaId?: string;
  arenaName?: string;
}

export function MyBookingsPage({ bookings, onCancelBooking, onEditBooking }: MyBookingsPageProps) {
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; arenaId: string; arenaName: string } | null>(null);
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-20 lg:pb-0">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={40} className="text-[#808080]" />
            </div>
            <h2 className="text-[#1A1A1A] mb-2">Брондаулар жоқ</h2>
            <p className="body-r text-[#808080] mb-6">
              Сізде әлі брондаулар жоқ. Арена таңдап брондау жасаңыз.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '#home'}
            >
              Арена табу
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const getStatusTag = (status: Booking['status']) => {
    switch (status) {
      case 'upcoming':
        return <Tag variant="success">Келер</Tag>;
      case 'completed':
        return <Tag variant="default">Аяқталды</Tag>;
      case 'cancelled':
        return <Tag variant="error">Болдырылды</Tag>;
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[#1A1A1A] mb-1">{booking.arenaName}</h3>
            <div className="flex items-center gap-2 text-[#808080]">
              <MapPin size={16} />
              <span className="body-s">{booking.location}</span>
            </div>
          </div>
          {getStatusTag(booking.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#D9D9D9]">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#2ECC71]" />
            <div>
              <p className="caption-r text-[#808080]">Күні</p>
              <p className="body-s text-[#1A1A1A]">{booking.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#2ECC71]" />
            <div>
              <p className="caption-r text-[#808080]">Уақыт</p>
              <p className="body-s text-[#1A1A1A]">{booking.time} ({booking.duration} сағат)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#2ECC71]" />
            <div>
              <p className="caption-r text-[#808080]">Төлем</p>
              <p className="body-s text-[#1A1A1A]">{booking.price} ₸</p>
            </div>
          </div>
        </div>

        {booking.status === 'upcoming' && (
          <div className="flex gap-3 pt-3 border-t border-[#D9D9D9]">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => onEditBooking && onEditBooking(booking)}
            >
              Өзгерту
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={() => onCancelBooking(booking.id)}
            >
              Болдырмау
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-2">Менің брондауларым</h1>
          <p className="body-r text-[#808080]">
            Барлық брондауларыңызды басқарыңыз
          </p>
        </div>

        {/* Upcoming Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2>Келер брондаулар</h2>
            <Tag variant="info">{upcomingBookings.length}</Tag>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={48} className="text-[#D9D9D9]" />
                </div>
                <h3 className="mb-2">Келер брондаулар жоқ</h3>
                <p className="body-r text-[#808080] mb-6 max-w-md mx-auto">
                  Сізде әлі келер брондаулар жоқ. Ареналарды көріп, брондау жасаңыз.
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => {
                    window.location.hash = 'home';
                    window.location.reload();
                  }}
                >
                  Ареналарды көру
                </Button>
              </div>
            </Card>
          )}
        </section>

        {/* Past Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2>Өткен брондаулар</h2>
            <Tag variant="default">{pastBookings.length}</Tag>
          </div>

          {pastBookings.length > 0 ? (
            <div className="space-y-4">
              {pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={48} className="text-[#D9D9D9]" />
                </div>
                <h3 className="mb-2">Өткен брондаулар жоқ</h3>
                <p className="body-r text-[#808080] max-w-md mx-auto">
                  Сізде әлі өткен брондаулар жоқ. Брондауларыңызды мұнда көре аласыз.
                </p>
              </div>
            </Card>
          )}
        </section>
      </div>
      
      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal(null)}
          arenaId={ratingModal.arenaId}
          arenaName={ratingModal.arenaName}
          onRatingSubmitted={() => {
            setRatingModal(null);
            // Optionally reload bookings or show success message
          }}
        />
      )}
    </div>
  );
}
