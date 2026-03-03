import { Arena, Booking, PaymentMethod, User } from './types';

export const CATEGORIES = [
  { name: 'Футбол', icon: '⚽' },
  { name: 'Баскетбол', icon: '🏀' },
  { name: 'Теннис', icon: '🎾' },
  { name: 'Волейбол', icon: '🏐' },
  { name: 'Жүзу', icon: '🏊' },
  { name: 'Бадминтон', icon: '🏸' },
];

export const MOCK_ARENAS: Arena[] = [
  {
    id: '1',
    name: 'Ortalyq Stadion',
    location: 'Сәтпаев көшесі 29/3, Алматы',
    sport: 'Футбол',
    rating: 4.8,
    pricePerHour: 5000,
    image: 'https://picsum.photos/id/1040/800/600',
  },
  {
    id: '2',
    name: 'Dostyk Sport Center',
    location: 'Абай даңғылы 48, Алматы',
    sport: 'Баскетбол',
    rating: 4.7,
    pricePerHour: 4500,
    image: 'https://picsum.photos/id/1058/800/600',
  },
  {
    id: '3',
    name: 'Gorky Tennis Park',
    location: 'Коперник көшесі 128, Алматы',
    sport: 'Теннис',
    rating: 4.9,
    pricePerHour: 6000,
    image: 'https://picsum.photos/id/1039/800/600',
  },
  {
    id: '4',
    name: 'Almaty Arena',
    location: 'Момышұлы даңғылы, Алматы',
    sport: 'Волейбол',
    rating: 4.6,
    pricePerHour: 4000,
    image: 'https://picsum.photos/id/103/800/600',
  },
  {
    id: '5',
    name: 'National Tennis Center',
    location: 'Тұран даңғылы 4/2, Астана',
    sport: 'Теннис',
    rating: 4.8,
    pricePerHour: 7500,
    image: 'https://picsum.photos/id/433/800/600',
  },
  {
    id: '6',
    name: 'Saryarka Velodrome',
    location: 'Қабанбай батыр даңғылы 45А, Астана',
    sport: 'Баскетбол',
    rating: 4.5,
    pricePerHour: 5500,
    image: 'https://picsum.photos/id/535/800/600',
  },
];

export const MOCK_USER: User = {
  name: 'Әлия Нұрланова',
  email: 'aliya.nurlanova@email.com',
  phone: '+7 (777) 123-4567',
  address: 'Абай даңғылы 10, пәтер 25, Алматы',
  dob: '1995-04-15',
  avatar: 'https://picsum.photos/id/64/200/200',
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk_1',
    arenaId: '3',
    arenaName: 'Gorky Tennis Park - Корт 3',
    sport: 'Теннис',
    date: '2023-10-10',
    time: '10:00',
    duration: 1,
    totalPrice: 6000,
    status: 'Аяқталды',
  },
  {
    id: 'bk_2',
    arenaId: '2',
    arenaName: 'Dostyk Sport Center - Зал 2',
    sport: 'Баскетбол',
    date: '2023-10-22',
    time: '18:00',
    duration: 1,
    totalPrice: 4500,
    status: 'Күтілуде',
  },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'Visa',
    last4: '4567',
    expiry: '12/25',
  },
  {
    id: 'pm_2',
    type: 'Mastercard',
    last4: '8901',
    expiry: '06/24',
  },
];