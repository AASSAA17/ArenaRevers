export interface Arena {
  id: string;
  name: string;
  location: string;
  sport: string;
  rating: number;
  pricePerHour: number;
  image: string;
  coordinates?: { lat: number; lng: number };
}

export interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  avatar: string;
}

export interface Booking {
  id: string;
  arenaId: string;
  arenaName: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  totalPrice: number;
  status: 'Күтілуде' | 'Аяқталды' | 'Бас тартылды';
}

export interface PaymentMethod {
  id: string;
  type: 'Visa' | 'Mastercard';
  last4: string;
  expiry: string;
}