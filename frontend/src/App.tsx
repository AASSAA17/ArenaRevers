import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ArenaCard } from './components/ArenaCard';
import { ArenaCardSkeleton } from './components/ArenaCardSkeleton';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { SuccessModal } from './components/SuccessModal';
import { ProfilePage } from './components/ProfilePage';
import { MyBookingsPage } from './components/MyBookingsPage';
import { FavoritesPage } from './components/FavoritesPage';
import { AdminPanel } from './components/AdminPanel';
import { ArenaDetailsModal } from './components/ArenaDetailsModal';
import { Button } from './components/Button';
import { StyleGuide } from './components/StyleGuide';
import { Search, MapPin, Filter, X, Calendar, Heart, CheckCircle, XCircle, Info, AlertCircle, ChevronLeft, ChevronRight, MapPin as MapPinIcon, ChevronDown } from 'lucide-react';
import { FilterModal, FilterState } from './components/FilterModal';
import { ErrorModal } from './components/ErrorModal';
import { RefundModal } from './components/RefundModal';
import { Card } from './components/Card';
import { api } from './utils/api';
import { toast } from 'sonner';

type Page = 'home' | 'search' | 'favorites' | 'bookings' | 'profile' | 'admin' | 'styleGuide';

interface User {
  name: string;
  email: string;
  phone: string;
  role?: string;
  isSuperAdmin?: boolean;
}

interface Booking {
  id: number;
  arenaId: string;
  arenaName: string;
  location: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
}

interface Arena {
  id: string;
  title: string;
  location: string;
  price: number;
  rating?: number;
  image?: string;
  sportType?: string;
  status?: 'active' | 'maintenance' | 'closed';
  latitude?: number;
  longitude?: number;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedArena, setSelectedArena] = useState<{ id: string; name: string; price: number; location: string } | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{
    date: string;
    time: string;
    duration: number;
  } | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    arenaName: string;
    date: string;
    time: string;
    duration: number;
    bookingId?: string;
  } | null>(null);
  const [editingBooking, setEditingBooking] = useState<{ id: number; arenaId: string; arenaName: string; price: number; location: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loadingArenas, setLoadingArenas] = useState(true);
  const [arenasError, setArenasError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [arenasPagination, setArenasPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [bookingCalendarRefresh, setBookingCalendarRefresh] = useState<number>(0);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ sportType: string; minPrice: number | null; maxPrice: number | null }>({
    sportType: '',
    minPrice: null,
    maxPrice: null,
  });
  const [selectedCity, setSelectedCity] = useState<string>('Барлығы');
  const [isSessionRestoring, setIsSessionRestoring] = useState(true);

  const CITIES = ['Барлығы', 'Алматы', 'Астана', 'Семей'];
  
  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedArenaForDetails, setSelectedArenaForDetails] = useState<string | null>(null);
  const [isArenaDetailsModalOpen, setIsArenaDetailsModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string; onRetry?: () => void }>({
    isOpen: false,
    message: '',
  });
  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    message: string;
  } | null>(null);

  // Restore user session on page load
  useEffect(() => {
    const restoreSession = async () => {
      setIsSessionRestoring(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Load user profile
          const profileResponse = await api.getProfile();
          if (profileResponse.user) {
            setUser({
              name: profileResponse.user.fullName || profileResponse.user.name,
              email: profileResponse.user.email,
              phone: profileResponse.user.phone || '',
              role: profileResponse.user.role || 'USER',
              isSuperAdmin: profileResponse.user.isSuperAdmin || false,
            });
            
            // Load user bookings
            try {
              const bookingsResponse = await api.getBookings();
              if (bookingsResponse && bookingsResponse.bookings) {
                const transformedBookings = bookingsResponse.bookings.map((b: any) => ({
                  id: b.id,
                  arenaId: b.arenaId,
                  arenaName: b.arena?.title || b.arenaName || 'Арена',
                  location: b.arena?.address || b.location || '',
                  date: new Date(b.startDatetime).toISOString().split('T')[0],
                  time: new Date(b.startDatetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                  duration: Math.round((new Date(b.endDatetime).getTime() - new Date(b.startDatetime).getTime()) / (1000 * 60 * 60)),
                  price: Number(b.totalAmount || 0),
                  status: b.status === 'confirmed' ? 'upcoming' : b.status === 'completed' ? 'completed' : b.status === 'cancelled' ? 'cancelled' : 'upcoming',
                  paymentStatus: b.paymentStatus === 'paid' ? 'paid' : 'pending',
                }));
                setBookings(transformedBookings);
              } else {
                setBookings([]);
              }
            } catch (error: any) {
              console.error('Error loading bookings:', error);
              setBookings([]);
              // Don't show error on page load, just set empty array
            }
          }
        } catch (error: any) {
          console.error('Error restoring session:', error);
          // Token might be invalid, remove it
          if (error.message?.includes('401') || error.message?.includes('token') || error.message?.includes('Unauthorized')) {
            localStorage.removeItem('token');
          }
        }
      }
      setIsSessionRestoring(false);
    };

    restoreSession();
  }, []);

  // Handle navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.location.hash = page;
  };

  // Handle hash navigation (for direct links like #bookings, #profile, etc.)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['home', 'favorites', 'bookings', 'profile', 'admin'].includes(hash)) {
        setCurrentPage(hash as Page);
      } else if (!hash || hash === '') {
        // If no hash, default to home
        setCurrentPage('home');
      }
    };

    // Check initial hash only once on mount
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['home', 'favorites', 'bookings', 'profile', 'admin'].includes(initialHash)) {
      setCurrentPage(initialHash as Page);
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Auto-open booking modal when editingBooking is set
  useEffect(() => {
    if (editingBooking) {
      setIsBookingModalOpen(true);
    }
  }, [editingBooking]);

  // Load arenas from backend
  useEffect(() => {
    const loadArenas = async () => {
      try {
        setLoadingArenas(true);
        setArenasError('');
        const params: any = {
          page: arenasPagination.page,
          limit: arenasPagination.limit,
        };
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (filters.sportType) {
          params.sportType = filters.sportType;
        }
        if (filters.minPrice !== null) {
          params.minPrice = filters.minPrice;
        }
        if (filters.maxPrice !== null) {
          params.maxPrice = filters.maxPrice;
        }
        const response: any = await api.getArenas(params);
        // Transform API response to match frontend format
        let transformedArenas = (response.arenas || response.data || response).map((arena: any) => ({
          id: arena.id,
          title: arena.title,
          location: arena.address || arena.location,
          price: Number(arena.pricePerHour || arena.price || 0),
          rating: arena.rating || 4.5,
          image: arena.images?.[0]?.url || arena.image,
          sportType: arena.sportType,
          status: arena.status || 'active',
          latitude: arena.latitude ? Number(arena.latitude) : undefined,
          longitude: arena.longitude ? Number(arena.longitude) : undefined,
        }));
        
        // Filter by city on client side if city is selected
        if (selectedCity !== 'Барлығы') {
          transformedArenas = transformedArenas.filter((arena: Arena) => 
            arena.location?.includes(selectedCity)
          );
        }
        
        setArenas(transformedArenas);
        
        // Update pagination info from response
        if (response.pagination) {
          setArenasPagination(prev => ({
            ...prev,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0,
          }));
        }
        
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Show message if no arenas found
        if (transformedArenas.length === 0 && (searchQuery || filters.sportType || filters.minPrice !== null || filters.maxPrice !== null)) {
          toast.info('Іздеу нәтижелері табылмады. Басқа параметрлерді пайдаланып көріңіз.', {
            icon: <Info size={20} />,
            duration: 4000,
          });
        }
      } catch (error: any) {
        console.error('Error loading arenas:', error);
        setArenasError('Ареналарды жүктеу кезінде қате орын алды');
        toast.error('Ареналарды жүктеу кезінде қате орын алды', {
          icon: <XCircle size={20} />,
          action: {
            label: 'Қайта жүктеу',
            onClick: () => window.location.reload(),
          },
        });
        // Fallback to empty array or mock data if needed
        setArenas([]);
      } finally {
        setLoadingArenas(false);
      }
    };

    loadArenas();
  }, [searchQuery, filters, arenasPagination.page, selectedCity]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setArenasPagination(prev => ({ ...prev, page: 1 }));
  }, [searchQuery, filters.sportType, filters.minPrice, filters.maxPrice, selectedCity]);

  // Use real arenas from backend
  const displayArenas = arenas;
  
  const handleBooking = (arena: Arena) => {
    // Арена статусын тексеру
    if (arena.status === 'maintenance' || arena.status === 'closed') {
      const statusMessage = arena.status === 'maintenance' 
        ? 'Аренада техникалық проблемалар бар. Брондау мүмкін емес.'
        : 'Арена қолжетімсіз. Брондау мүмкін емес.';
      toast.error(statusMessage, {
        icon: <AlertCircle size={20} />,
        duration: 5000,
      });
      return;
    }

    if (!user) {
      setIsAuthModalOpen(true);
      setSelectedArena({ id: String(arena.id), name: arena.title, price: arena.price, location: arena.location });
      return;
    }
    setSelectedArena({ id: String(arena.id), name: arena.title, price: arena.price, location: arena.location });
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (details: { date: string; time: string; duration: number }) => {
    if (!selectedArena || !selectedArena.id) {
      toast.error('Арена таңдалмаған');
      return;
    }

    setBookingDetails(details);
    setIsBookingModalOpen(false);

    try {
      // Calculate start and end datetime
      const [hours, minutes] = details.time.split(':').map(Number);
      const startDatetime = new Date(`${details.date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
      const endDatetime = new Date(startDatetime);
      endDatetime.setHours(endDatetime.getHours() + details.duration);

      // Create booking with stripe payment provider to get paymentId
      const bookingResponse = await api.createBooking({
        arenaId: String(selectedArena.id),
        startDatetime: startDatetime.toISOString(),
        endDatetime: endDatetime.toISOString(),
        paymentType: 'full',
        paymentProvider: 'stripe',
      });

      // Store payment ID and booking ID for card processing
      if (bookingResponse.payment_id) {
        setCurrentPaymentId(bookingResponse.payment_id);
        setCurrentBookingId(bookingResponse.booking_id || null);
        setIsPaymentModalOpen(true);
      } else {
        throw new Error('Төлем ID алынбады');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Брондау жасау кезінде қате орын алды');
    }
  };

  const handlePaymentSuccess = async () => {
    // Close payment modal first
    setIsPaymentModalOpen(false);
    setCurrentPaymentId(null);

    if (selectedArena && bookingDetails) {
      try {
        
        // Reload bookings from server to get accurate data
        try {
          const bookingsResponse = await api.getBookings();
          if (bookingsResponse && bookingsResponse.bookings) {
            const transformedBookings = bookingsResponse.bookings.map((b: any) => ({
              id: b.id,
              arenaId: b.arenaId,
              arenaName: b.arena?.title || b.arenaName || 'Арена',
              location: b.arena?.address || b.location || '',
              date: new Date(b.startDatetime).toISOString().split('T')[0],
              time: new Date(b.startDatetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
              duration: Math.round((new Date(b.endDatetime).getTime() - new Date(b.startDatetime).getTime()) / (1000 * 60 * 60)),
              price: Number(b.totalAmount || 0),
              status: b.status === 'confirmed' ? 'upcoming' : b.status === 'completed' ? 'completed' : b.status === 'cancelled' ? 'cancelled' : 'upcoming',
              paymentStatus: b.paymentStatus === 'paid' ? 'paid' : 'pending',
            }));
            setBookings(transformedBookings);
          } else {
            setBookings([]);
          }
        } catch (error: any) {
          console.error('Error reloading bookings:', error);
          setBookings([]);
          // Still show success modal even if reload fails
        }
        
        // Trigger calendar refresh in BookingModal
        setBookingCalendarRefresh(Date.now());
        
        // Show success toast with icon
        toast.success('Брондау сәтті жасалды!', {
          icon: <CheckCircle size={20} />,
          duration: 3000,
        });
        
        // Store success modal data before clearing selectedArena
        setSuccessModalData({
          arenaName: selectedArena.name,
          date: bookingDetails.date,
          time: bookingDetails.time,
          duration: bookingDetails.duration,
          bookingId: currentBookingId || undefined,
        });
        
        // Clear booking state
        setSelectedArena(null);
        setBookingDetails(null);
        setCurrentBookingId(null);
        
        // Show success modal
        setIsSuccessModalOpen(true);
        
        // Return to home page after successful payment
        setCurrentPage('home');
        window.location.hash = 'home';
      } catch (error: any) {
        // Show error message to user
        const errorMessage = error.message || error.error || 'Брондау құру кезінде қате орын алды';
        setErrorModal({
          isOpen: true,
          message: errorMessage,
          onRetry: () => {
            // Retry payment success handler
            handlePaymentSuccess();
          },
        });
        // Keep payment modal open so user can try again
      }
    }
  };

  const handleEditBooking = (booking: Booking) => {
    // Set editing booking state
    setEditingBooking({
      id: booking.id,
      arenaId: booking.arenaId,
      arenaName: booking.arenaName,
      price: booking.price,
      location: booking.location,
    });
    setBookingDetails({
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
    });
    setIsBookingModalOpen(true);
  };

  const handleUpdateBooking = async (details: { date: string; time: string; duration: number }) => {
    if (!editingBooking) return;

    try {
      // Check if booking was paid
      const currentBooking = bookings.find(b => b.id === editingBooking.id);
      const wasPaid = currentBooking?.paymentStatus === 'paid';

      // Calculate start and end datetime
      const [hours, minutes] = details.time.split(':').map(Number);
      const startDatetime = new Date(`${details.date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
      const endDatetime = new Date(startDatetime);
      endDatetime.setHours(endDatetime.getHours() + details.duration);

      // Update booking through API
      await api.updateBooking(String(editingBooking.id), {
        startDatetime: startDatetime.toISOString(),
        endDatetime: endDatetime.toISOString(),
      });

      // Show refund modal immediately if booking was paid
      if (wasPaid) {
        setRefundModal({
          isOpen: true,
          message: 'Ақша 1-3 күн ішінде қайтарылады'
        });
      } else {
        toast.success('Брондау сәтті өзгертілді', {
          icon: <CheckCircle size={20} />,
          duration: 3000,
        });
      }

      // Close modal
      setIsBookingModalOpen(false);
      setEditingBooking(null);
      setBookingDetails(null);

      // Reload bookings from server
      const bookingsResponse = await api.getBookings();
      if (bookingsResponse && bookingsResponse.bookings) {
        const transformedBookings = bookingsResponse.bookings.map((b: any) => ({
          id: b.id,
          arenaId: b.arenaId,
          arenaName: b.arena?.title || b.arenaName || 'Арена',
          location: b.arena?.address || b.location || '',
          date: new Date(b.startDatetime).toISOString().split('T')[0],
          time: new Date(b.startDatetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          duration: Math.round((new Date(b.endDatetime).getTime() - new Date(b.startDatetime).getTime()) / (1000 * 60 * 60)),
          price: Number(b.totalAmount || 0),
          status: b.status === 'confirmed' ? 'upcoming' : b.status === 'completed' ? 'completed' : b.status === 'cancelled' ? 'cancelled' : 'upcoming',
          paymentStatus: b.paymentStatus === 'paid' ? 'paid' : 'pending',
        }));
        setBookings(transformedBookings);
      }

      // Trigger calendar refresh
      setBookingCalendarRefresh(Date.now());
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error(error.message || 'Брондауды өзгерту кезінде қате орын алды', {
        icon: <AlertCircle size={20} />,
      });
      setErrorModal({
        isOpen: true,
        message: error.message || 'Брондауды өзгерту кезінде қате орын алды',
      });
    }
  };

  const handleDownloadReceipt = async (bookingId: string) => {
    try {
      await api.downloadReceipt(bookingId);
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        message: error.message || 'Чекті жүктеу кезінде қате орын алды',
      });
    }
  };

  const handleCancelBooking = async (id: number) => {
    try {
      // Check if booking was paid before cancellation
      const currentBooking = bookings.find(b => b.id === id);
      const wasPaid = currentBooking?.paymentStatus === 'paid';

      // Cancel booking on server
      await api.cancelBooking(String(id));
      
      // Show refund modal immediately if booking was paid
      if (wasPaid) {
        setRefundModal({
          isOpen: true,
          message: 'Төлем 1-3 күн ішінде қайтарылады'
        });
      } else {
        toast.success('Брондау сәтті болдырылды', {
          icon: <CheckCircle size={20} />,
          duration: 3000,
        });
      }
      
      // Reload bookings from server to get accurate status
      const bookingsResponse = await api.getBookings();
      if (bookingsResponse && bookingsResponse.bookings) {
        const transformedBookings = bookingsResponse.bookings.map((b: any) => ({
          id: b.id,
          arenaId: b.arenaId,
          arenaName: b.arena?.title || b.arenaName || 'Арена',
          location: b.arena?.address || b.location || '',
          date: new Date(b.startDatetime).toISOString().split('T')[0],
          time: new Date(b.startDatetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          duration: Math.round((new Date(b.endDatetime).getTime() - new Date(b.startDatetime).getTime()) / (1000 * 60 * 60)),
          price: Number(b.totalAmount || 0),
          status: b.status === 'confirmed' ? 'upcoming' : b.status === 'completed' ? 'completed' : b.status === 'cancelled' ? 'cancelled' : 'upcoming',
          paymentStatus: b.paymentStatus === 'paid' ? 'paid' : 'pending',
        }));
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Брондауды болдыру кезінде қате орын алды', {
        icon: <AlertCircle size={20} />,
      });
      setErrorModal({
        isOpen: true,
        message: error.message || 'Брондауды болдыру кезінде қате орын алды',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logging out:', error);
      }
    } finally {
      setUser(null);
      setBookings([]);
      setCurrentPage('home');
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    
    // If admin, navigate to admin panel immediately
    if (userData.role === 'ADMIN') {
      setCurrentPage('admin');
      window.location.hash = 'admin';
    }
    
    // Load bookings after login
    try {
      const bookingsResponse = await api.getBookings();
      if (bookingsResponse && bookingsResponse.bookings) {
        const transformedBookings = bookingsResponse.bookings.map((b: any) => ({
          id: b.id,
          arenaId: b.arenaId,
          arenaName: b.arena?.title || b.arenaName || 'Арена',
          location: b.arena?.address || b.location || '',
          date: new Date(b.startDatetime).toISOString().split('T')[0],
          time: new Date(b.startDatetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          duration: Math.round((new Date(b.endDatetime).getTime() - new Date(b.startDatetime).getTime()) / (1000 * 60 * 60)),
          price: Number(b.totalAmount || 0),
          status: b.status === 'confirmed' ? 'upcoming' : b.status === 'completed' ? 'completed' : b.status === 'cancelled' ? 'cancelled' : 'upcoming',
          paymentStatus: b.paymentStatus === 'paid' ? 'paid' : 'pending',
        }));
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error loading bookings after login:', error);
      setBookings([]);
      // Show error to user
      setErrorModal({
        isOpen: true,
        message: 'Брондауларды жүктеу кезінде қате орын алды. Бетті жаңартып көріңіз.',
      });
    }
    
    // If there was a pending booking, open the booking modal
    if (selectedArena && !isBookingModalOpen) {
      setIsBookingModalOpen(true);
    }
  };

  // Style Guide Page
  if (currentPage === 'styleGuide') {
    return (
      <div className="relative">
        <button
          onClick={() => setCurrentPage('home')}
          className="fixed top-4 right-4 z-50 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 border border-[#D9D9D9]"
        >
          ← Негізгі бетке қайту
        </button>
        <StyleGuide />
      </div>
    );
  }

  // Favorites Page
  if (currentPage === 'favorites') {
    return (
      <>
        {user ? (
          <FavoritesPage />
        ) : (
          <div className="min-h-screen bg-[#F5F5F5] pb-20 lg:pb-0">
            <Navigation 
              isAdmin={user?.role === 'ADMIN'} 
              onNavigate={handleNavigate}
            />
            <div className="min-h-screen flex items-center justify-center px-4">
              <Card>
                <div className="text-center py-12 px-8">
                  <h2 className="text-[#1A1A1A] mb-2">Таңдаулыларды көру үшін кіру керек</h2>
                  <p className="body-r text-[#808080] mb-6">
                    Таңдаулы ареналарды көру үшін жүйеге кіріңіз
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    Кіру
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  }

  // Profile Page
  if (currentPage === 'profile') {
    if (isSessionRestoring) {
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <p className="text-[#4D4D4D]">Жүктелуде...</p>
        </div>
      );
    }
    if (!isSessionRestoring && !user) {
      setIsAuthModalOpen(true);
      setCurrentPage('home');
      return null;
    }
    if (isSessionRestoring) {
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <p className="text-[#4D4D4D]">Жүктелуде...</p>
        </div>
      );
    }
    return (
      <>
        <ProfilePage 
          user={user} 
          onUpdateProfile={setUser}
          onLogout={handleLogout}
        />
        <button
          onClick={() => setCurrentPage('home')}
          className="fixed bottom-24 lg:bottom-8 left-4 z-40 bg-white text-[#1A1A1A] px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all border border-[#D9D9D9]"
        >
          ← Артқа
        </button>
      </>
    );
  }

  // Admin Page
  if (currentPage === 'admin') {
    if (isSessionRestoring) {
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <p className="text-[#4D4D4D]">Жүктелуде...</p>
        </div>
      );
    }
    if (!user || !user.role || user.role !== 'ADMIN') {
      setCurrentPage('home');
      window.location.hash = 'home';
      return null;
    }
    return (
      <>
        <AdminPanel />
        <button
          onClick={() => setCurrentPage('home')}
          className="fixed bottom-24 lg:bottom-8 left-4 z-40 bg-white text-[#1A1A1A] px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all border border-[#D9D9D9]"
        >
          ← Артқа
        </button>
      </>
    );
  }

  // Bookings Page
  if (currentPage === 'bookings') {
    // Show bookings page if user is logged in, or show empty state with auth prompt
    return (
      <>
        <Navigation 
          isAdmin={user?.role === 'ADMIN'} 
          onNavigate={handleNavigate}
        />
        {user ? (
          <MyBookingsPage 
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onEditBooking={handleEditBooking}
          />
        ) : (
          <div className="min-h-screen bg-[#F5F5F5] pb-20 lg:pb-0">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-12">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={40} className="text-[#808080]" />
                </div>
                <h2 className="text-[#1A1A1A] mb-2">Брондауларды көру үшін кіру керек</h2>
                <p className="body-r text-[#808080] mb-6">
                  Брондауларыңызды көру үшін жүйеге кіріңіз
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Кіру
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Home Page (Main)
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 lg:pb-0">
      {/* Navigation with page handlers */}
      <nav className="hidden lg:block bg-white border-b border-[#D9D9D9] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-20">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
                <div className="w-10 h-10 bg-[#2ECC71] rounded-lg flex items-center justify-center">
                  <span className="text-white">A</span>
                </div>
                <span className="text-[#1A1A1A]">ArenaBook</span>
              </div>
              
              {/* City Selector */}
              <div className="relative group">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F5F5] hover:bg-[#EAFBF3] text-[#1A1A1A] transition-all duration-200 border border-transparent hover:border-[#2ECC71]"
                  onClick={() => {
                    const currentIndex = CITIES.indexOf(selectedCity);
                    const nextIndex = (currentIndex + 1) % CITIES.length;
                    setSelectedCity(CITIES[nextIndex]);
                  }}
                >
                  <MapPinIcon size={18} className="text-[#2ECC71]" />
                  <span className="body-r font-medium">{selectedCity}</span>
                  <ChevronDown size={16} className="text-[#808080] transition-transform duration-200 group-hover:rotate-180" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 text-[#4D4D4D] hover:text-[#2ECC71] transition-colors">
                <Search size={20} />
                <span className="body-r">Арена табу</span>
              </button>
              <button 
                onClick={() => {
                  setCurrentPage('favorites');
                  window.location.hash = 'favorites';
                  if (!user) {
                    setIsAuthModalOpen(true);
                  }
                }} 
                className="flex items-center gap-2 text-[#4D4D4D] hover:text-[#2ECC71] transition-colors"
              >
                <Heart size={20} />
                <span className="body-r">Таңдаулылар</span>
              </button>
              <button 
                onClick={() => {
                  setCurrentPage('bookings');
                  window.location.hash = 'bookings';
                  if (!user) {
                    setIsAuthModalOpen(true);
                  }
                }} 
                className="flex items-center gap-2 text-[#4D4D4D] hover:text-[#2ECC71] transition-colors"
              >
                <MapPin size={20} />
                <span className="body-r">Менің брондауым</span>
              </button>
              {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <button onClick={() => setCurrentPage('admin')} className="flex items-center gap-2 text-[#4D4D4D] hover:text-[#2ECC71] transition-colors">
                      <span className="body-r">Админ панелі</span>
                    </button>
                  )}
                  <button onClick={() => setCurrentPage('profile')} className="flex items-center gap-2 text-[#4D4D4D] hover:text-[#2ECC71] transition-colors">
                    <span className="body-r">{user.name}</span>
                  </button>
                </>
              ) : (
                <Button variant="primary" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                  Кіру
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-[#D9D9D9] sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3" onClick={() => setCurrentPage('home')}>
              <div className="w-10 h-10 bg-[#2ECC71] rounded-lg flex items-center justify-center">
                <span className="text-white">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#1A1A1A] text-sm font-medium">ArenaBook</span>
                <button
                  className="flex items-center gap-1 text-xs text-[#2ECC71] font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = CITIES.indexOf(selectedCity);
                    const nextIndex = (currentIndex + 1) % CITIES.length;
                    setSelectedCity(CITIES[nextIndex]);
                  }}
                >
                  <MapPinIcon size={12} />
                  <span>{selectedCity}</span>
                </button>
              </div>
            </div>
            {!user && (
              <Button variant="primary" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                Кіру
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9D9D9] z-50">
        <div className="flex items-center justify-around px-2 py-2">
          <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center gap-1 p-2 text-[#2ECC71]">
            <Search size={24} />
            <span className="caption-r">Іздеу</span>
          </button>
          <button 
            onClick={() => {
              setCurrentPage('bookings');
              window.location.hash = 'bookings';
              if (!user) {
                setIsAuthModalOpen(true);
              }
            }} 
            className="flex flex-col items-center gap-1 p-2 text-[#808080]"
          >
            <MapPin size={24} />
            <span className="caption-r">Брондау</span>
          </button>
          <button onClick={() => user ? setCurrentPage('profile') : setIsAuthModalOpen(true)} className="flex flex-col items-center gap-1 p-2 text-[#808080]">
            <Filter size={24} />
            <span className="caption-r">{user ? 'Профил' : 'Кіру'}</span>
          </button>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-12 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="display-lg mb-4 text-[#1A1A1A]">
              Спорт алаңдарын оңай брондаңыз
            </h1>
            <p className="body-l text-[#4D4D4D] mb-8">
              Қазақстандағы ең үздік спорт алаңдарын табыңыз және бірнеше минут ішінде брондаңыз
            </p>
            
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#808080]" size={20} />
                <input
                  type="text"
                  placeholder="Алаң түрі немесе орны..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Search is triggered by useEffect when searchQuery changes
                    }
                  }}
                  className="w-full h-14 pl-12 pr-12 rounded-lg border border-[#D9D9D9] focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#EAFBF3] placeholder:text-[#808080]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#1A1A1A] transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <Button 
                variant="primary" 
                size="lg" 
                className="lg:w-auto"
                onClick={() => {
                  // Search is triggered by useEffect when searchQuery changes
                }}
              >
                <Search size={20} className="lg:mr-2" />
                <span className="hidden lg:inline">Іздеу</span>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="lg:w-auto relative"
                onClick={() => setShowFilters(true)}
              >
                <Filter size={20} />
                {(filters.sportType || filters.minPrice !== null || filters.maxPrice !== null) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#2ECC71] rounded-full"></span>
                )}
              </Button>
            </div>
            
            {/* Active Filters Display */}
            {(filters.sportType || filters.minPrice !== null || filters.maxPrice !== null || searchQuery || selectedCity !== 'Барлығы') && (
              <div className="flex flex-wrap gap-2 items-center mt-4">
                <span className="body-s text-[#4D4D4D]">Белсенді сүзгілер:</span>
                {selectedCity !== 'Барлығы' && (
                  <div className="flex items-center gap-2 bg-[#EAFBF3] px-3 py-1 rounded-full">
                    <MapPinIcon size={14} className="text-[#2ECC71]" />
                    <span className="body-s text-[#2ECC71]">{selectedCity}</span>
                    <button
                      onClick={() => setSelectedCity('Барлығы')}
                      className="text-[#2ECC71] hover:text-[#27AE60]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="flex items-center gap-2 bg-[#EAFBF3] px-3 py-1 rounded-full">
                    <span className="body-s text-[#2ECC71]">Іздеу: {searchQuery}</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[#2ECC71] hover:text-[#27AE60]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {filters.sportType && (
                  <div className="flex items-center gap-2 bg-[#EAFBF3] px-3 py-1 rounded-full">
                    <span className="body-s text-[#2ECC71]">
                      {filters.sportType === 'football' ? 'Футбол' :
                       filters.sportType === 'basketball' ? 'Баскетбол' :
                       filters.sportType === 'tennis' ? 'Теннис' :
                       filters.sportType === 'volleyball' ? 'Волейбол' :
                       filters.sportType === 'badminton' ? 'Бадминтон' :
                       filters.sportType === 'table-tennis' ? 'Үстел теннисі' : filters.sportType}
                    </span>
                    <button
                      onClick={() => setFilters({ ...filters, sportType: '' })}
                      className="text-[#2ECC71] hover:text-[#27AE60]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {(filters.minPrice !== null || filters.maxPrice !== null) && (
                  <div className="flex items-center gap-2 bg-[#EAFBF3] px-3 py-1 rounded-full">
                    <span className="body-s text-[#2ECC71]">
                      Баға: {filters.minPrice !== null ? `${filters.minPrice}₸` : '0₸'} - {filters.maxPrice !== null ? `${filters.maxPrice}₸` : '∞'}
                    </span>
                    <button
                      onClick={() => setFilters({ ...filters, minPrice: null, maxPrice: null })}
                      className="text-[#2ECC71] hover:text-[#27AE60]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ sportType: '', minPrice: null, maxPrice: null });
                    setSelectedCity('Барлығы');
                  }}
                  className="text-[#808080] hover:text-[#1A1A1A]"
                >
                  Барлығын өшіру
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Popular Arenas */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-20 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[#1A1A1A]">Танымал алаңдар</h2>
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilters({ sportType: '', minPrice: null, maxPrice: null });
              // Scroll to top to show all arenas
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-[#2ECC71] body-r hover:underline"
          >
            Барлығын көру →
          </button>
        </div>
        
        {loadingArenas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ArenaCardSkeleton key={i} />
            ))}
          </div>
        ) : arenasError ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{arenasError}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Қайта жүктеу
            </Button>
          </div>
        ) : displayArenas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#4D4D4D]">Ареналар табылмады</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArenas.map((arena) => (
              <ArenaCard
                key={arena.id}
                id={arena.id}
                image={arena.image || ''}
                title={arena.title}
                location={arena.location}
                price={arena.price}
                rating={arena.rating || 4.5}
                latitude={arena.latitude}
                longitude={arena.longitude}
                status={arena.status}
                onBook={() => handleBooking(arena)}
                onViewDetails={() => {
                  setSelectedArenaForDetails(arena.id);
                  setIsArenaDetailsModalOpen(true);
                }}
                onAuthRequired={() => setIsAuthModalOpen(true)}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!loadingArenas && !arenasError && displayArenas.length > 0 && arenasPagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setArenasPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={arenasPagination.page === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
                arenasPagination.page === 1
                  ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9]'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#F5F5F5] border-[#D9D9D9]'
              }`}
            >
              <ChevronLeft size={18} />
              <span className="body-s">Алдыңғы</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(9, arenasPagination.totalPages) }, (_, i) => {
                let pageNum: number;
                const totalPages = arenasPagination.totalPages;
                const currentPage = arenasPagination.page;
                
                if (totalPages <= 9) {
                  pageNum = i + 1;
                } else if (currentPage <= 5) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 4) {
                  pageNum = totalPages - 8 + i;
                } else {
                  pageNum = currentPage - 4 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setArenasPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`w-10 h-10 rounded-lg border transition-colors body-s ${
                      arenasPagination.page === pageNum
                        ? 'bg-[#2ECC71] text-white border-[#2ECC71]'
                        : 'bg-white text-[#1A1A1A] hover:bg-[#EAFBF3] border-[#D9D9D9]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setArenasPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={arenasPagination.page === arenasPagination.totalPages}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
                arenasPagination.page === arenasPagination.totalPages
                  ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9]'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#F5F5F5] border-[#D9D9D9]'
              }`}
            >
              <span className="body-s">Келесі</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        
        {!loadingArenas && !arenasError && displayArenas.length > 0 && (
          <div className="text-center mt-4">
            <p className="body-s text-[#808080]">
              Бет {arenasPagination.page} / {arenasPagination.totalPages} (Барлығы: {arenasPagination.total} арена)
            </p>
          </div>
        )}
      </section>
      
      {/* Features */}
      <section className="bg-white py-16 lg:py-20 mt-12">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-20">
          <h2 className="text-center mb-12 text-[#1A1A1A]">Неге ArenaBook таңдайсыз?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#EAFBF3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-[#2ECC71]" />
              </div>
              <h4 className="text-[#1A1A1A] mb-2">Оңай іздеу</h4>
              <p className="body-s text-[#808080]">
                Өз қалаңыздағы барлық спорт алаңдарын бір жерден табыңыз
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#EAFBF3] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-[#2ECC71]" />
              </div>
              <h4 className="text-[#1A1A1A] mb-2">Жедел брондау</h4>
              <p className="body-s text-[#808080]">
                Бірнеше секундта өзіңізге ыңғайлы уақытты брондаңыз
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#EAFBF3] rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter size={32} className="text-[#2ECC71]" />
              </div>
              <h4 className="text-[#1A1A1A] mb-2">Сенімді төлем</h4>
              <p className="body-s text-[#808080]">
                Қауіпсіз және жылдам онлайн төлем жүйесі
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
      
      {/* Booking Modal */}
      {(selectedArena || editingBooking) && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedArena(null);
            setEditingBooking(null);
            setBookingDetails(null);
          }}
          arenaName={editingBooking ? editingBooking.arenaName : selectedArena!.name}
          arenaId={editingBooking ? editingBooking.arenaId : selectedArena!.id}
          price={editingBooking ? editingBooking.price : selectedArena!.price}
          onConfirm={editingBooking ? handleUpdateBooking : handleBookingConfirm}
          onBookingCreated={() => setBookingCalendarRefresh(Date.now())}
          calendarRefresh={bookingCalendarRefresh}
          initialDate={bookingDetails?.date}
          initialTime={bookingDetails?.time}
          initialDuration={bookingDetails?.duration}
          bookingId={editingBooking?.id}
        />
      )}
      
      {/* Payment Modal */}
      {selectedArena && bookingDetails && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setCurrentPaymentId(null);
          }}
          amount={selectedArena.price * bookingDetails.duration}
          arenaId={selectedArena.id}
          paymentId={currentPaymentId || undefined}
          bookingDetails={{
            arenaName: selectedArena.name,
            date: bookingDetails.date,
            time: bookingDetails.time,
            duration: bookingDetails.duration
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
      
      {/* Success Modal */}
      {isSuccessModalOpen && successModalData && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            setSuccessModalData(null);
            setCurrentPage('home');
            window.location.hash = 'home';
          }}
          onViewBookings={() => {
            setIsSuccessModalOpen(false);
            setSuccessModalData(null);
            setCurrentPage('bookings');
            window.location.hash = 'bookings';
          }}
          onViewReceipt={successModalData.bookingId ? () => {
            if (successModalData.bookingId) {
              handleDownloadReceipt(successModalData.bookingId);
            }
            setIsSuccessModalOpen(false);
            setSuccessModalData(null);
          } : undefined}
          bookingDetails={successModalData}
          bookingId={successModalData.bookingId}
        />
      )}
      
      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        currentFilters={filters}
      />
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
        onRetry={errorModal.onRetry}
      />
      
      {/* Refund Modal */}
      {refundModal && (
        <RefundModal
          isOpen={refundModal.isOpen}
          onClose={() => setRefundModal(null)}
          message={refundModal.message}
        />
      )}
      
      {/* Arena Details Modal */}
      {selectedArenaForDetails && (
        <ArenaDetailsModal
          isOpen={isArenaDetailsModalOpen}
          onClose={() => {
            setIsArenaDetailsModalOpen(false);
            setSelectedArenaForDetails(null);
          }}
          arenaId={selectedArenaForDetails}
          onBook={() => {
            const arena = arenas.find(a => a.id === selectedArenaForDetails);
            if (arena) {
              handleBooking(arena);
              setIsArenaDetailsModalOpen(false);
              setSelectedArenaForDetails(null);
            }
          }}
          onAuthRequired={() => setIsAuthModalOpen(true)}
        />
      )}
    </div>
  );
}
