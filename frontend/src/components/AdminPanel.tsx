import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, MapPin, Calendar, 
  TrendingUp, DollarSign, Activity, 
  Search, Filter, X, Edit, Trash2, 
  CheckCircle, XCircle, AlertCircle,
  CreditCard, Star, Bell, Shield, Settings,
  LineChart, PieChart, FileText, Lock,
  Image as ImageIcon, Upload, X as XIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Tag } from './Tag';
import { api } from '../utils/api';

type Tab = 'dashboard' | 'users' | 'arenas' | 'addArena' | 'editArena' | 'bookings' | 'payments' | 'ratings' | 'notifications' | 'audit' | 'settings';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [usersSearch, setUsersSearch] = useState('');

  // Arenas state
  const [arenas, setArenas] = useState<any[]>([]);
  const [arenasPagination, setArenasPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [arenasSearch, setArenasSearch] = useState('');
  const [arenaStatusFilter, setArenaStatusFilter] = useState<string>('');

  // Add Arena state
  const [newArena, setNewArena] = useState({
    title: '',
    description: '',
    sportType: 'football',
    address: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    timezone: 'Asia/Almaty',
  });

  // Edit Arena state
  const [editingArena, setEditingArena] = useState<any>(null);
  const [arenaImages, setArenaImages] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsPagination, setBookingsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('');

  // Payments state
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsPagination, setPaymentsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [paymentFilters, setPaymentFilters] = useState({ status: '', provider: '', startDate: '', endDate: '' });
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [refundsPagination, setRefundsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Ratings state
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingsPagination, setRatingsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [ratingFilters, setRatingFilters] = useState({ arenaId: '', userId: '', stars: '', hasComment: '' });
  const [ratingStats, setRatingStats] = useState<any>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsPagination, setNotificationsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [notificationFilters, setNotificationFilters] = useState({ type: '', channel: '', isRead: '' });
  const [notificationStats, setNotificationStats] = useState<any>(null);

  // Audit state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPagination, setAuditPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [auditFilters, setAuditFilters] = useState({ userId: '', action: '', resource: '', ipAddress: '' });
  const [suspiciousActivity, setSuspiciousActivity] = useState<any>(null);

  // Settings state
  const [settings, setSettings] = useState<any>(null);
  const [settingsHistory, setSettingsHistory] = useState<any[]>([]);

  // Load current user info
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const profile = await api.getProfile();
        setCurrentUser(profile.user);
      } catch (err) {
        // Silently fail
      }
    };
    loadCurrentUser();
  }, []);

  // Load dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    }
  }, [activeTab]);

  // Load users
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, usersPagination.page, usersSearch]);

  // Load arenas
  useEffect(() => {
    if (activeTab === 'arenas') {
      loadArenas();
    }
  }, [activeTab, arenasPagination.page, arenasSearch, arenaStatusFilter]);

  // Load bookings
  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab, bookingsPagination.page, bookingsSearch, bookingStatusFilter]);

  // Load payments
  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
      loadPaymentStats();
    }
  }, [activeTab, paymentsPagination.page, paymentFilters]);

  // Load refunds
  useEffect(() => {
    if (activeTab === 'payments') {
      loadRefunds();
    }
  }, [activeTab, refundsPagination.page]);

  // Load ratings
  useEffect(() => {
    if (activeTab === 'ratings') {
      loadRatings();
      loadRatingStats();
    }
  }, [activeTab, ratingsPagination.page, ratingFilters]);

  // Load notifications
  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications();
      loadNotificationStats();
    }
  }, [activeTab, notificationsPagination.page, notificationFilters]);

  // Load audit logs
  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
      loadSuspiciousActivity();
    }
  }, [activeTab, auditPagination.page, auditFilters]);

  // Load settings
  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab]);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getDashboard();
      setDashboardStats(data);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getUsers({
        page: usersPagination.page,
        limit: usersPagination.limit,
        search: usersSearch,
      });
      setUsers(data.users || []);
      setUsersPagination(data.pagination || usersPagination);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const loadArenas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getArenas({
        page: arenasPagination.page,
        limit: arenasPagination.limit,
        search: arenasSearch,
        status: arenaStatusFilter || undefined,
      });
      setArenas(data.arenas || []);
      setArenasPagination(data.pagination || arenasPagination);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getBookings({
        page: bookingsPagination.page,
        limit: bookingsPagination.limit,
        search: bookingsSearch,
        status: bookingStatusFilter || undefined,
      });
      setBookings(data.bookings || []);
      setBookingsPagination(data.pagination || bookingsPagination);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string, userIsSuperAdmin: boolean) => {
    try {
      if (userIsSuperAdmin) {
        setError('Негізгі админ аккаунтын өзгерту мүмкін емес');
        return;
      }
      await api.admin.updateUserRole(userId, newRole);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Рөлді өзгерту қатесі');
    }
  };

  const handleUpdateArenaStatus = async (arenaId: string, status: string) => {
    try {
      await api.admin.updateArenaStatus(arenaId, status);
      loadArenas();
    } catch (err: any) {
      setError(err.message || 'Статусты өзгерту қатесі');
    }
  };

  const handleDeleteArena = async (arenaId: string) => {
    if (!confirm('Аренаны жоюға сенімдісіз бе?')) return;
    
    try {
      await api.admin.deleteArena(arenaId);
      loadArenas();
    } catch (err: any) {
      setError(err.message || 'Аренаны жою қатесі');
    }
  };

  // Pagination component helper
  const renderPagination = (
    pagination: { page: number; totalPages: number; total: number },
    setPagination: React.Dispatch<React.SetStateAction<{ page: number; limit: number; total: number; totalPages: number }>>
  ) => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="mt-6">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
              pagination.page === 1
                ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9]'
                : 'bg-white text-[#1A1A1A] hover:bg-[#F5F5F5] border-[#D9D9D9]'
            }`}
          >
            <ChevronLeft size={18} />
            <span className="body-s">Алдыңғы</span>
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(9, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              const totalPages = pagination.totalPages;
              const currentPage = pagination.page;
              
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
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={`w-10 h-10 rounded-lg border transition-colors body-s ${
                    pagination.page === pageNum
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
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
              pagination.page === pagination.totalPages
                ? 'bg-[#F5F5F5] text-[#D9D9D9] cursor-not-allowed border-[#D9D9D9]'
                : 'bg-white text-[#1A1A1A] hover:bg-[#F5F5F5] border-[#D9D9D9]'
            }`}
          >
            <span className="body-s">Келесі</span>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="text-center mt-4">
          <p className="body-s text-[#808080]">
            Бет {pagination.page} / {pagination.totalPages} (Барлығы: {pagination.total})
          </p>
        </div>
      </div>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('kk-KZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Export analytics to Excel
  const exportAnalyticsToExcel = async () => {
    if (!dashboardStats) return;

    try {
      // Dynamic import for xlsx to work with Vite
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();

      // 1. Негізгі статистика
      const statsData = [
        ['Көрсеткіш', 'Мән'],
        ['Жалпы пайдаланушылар', dashboardStats.stats?.totalUsers || 0],
        ['Жалпы ареналар', dashboardStats.stats?.totalArenas || 0],
        ['Белсенді ареналар', dashboardStats.stats?.activeArenas || 0],
        ['Жалпы брондаулар', dashboardStats.stats?.totalBookings || 0],
        ['Осы кезең брондаулар', dashboardStats.stats?.currentPeriodBookings || 0],
        ['Жалпы табыс', Number(dashboardStats.stats?.totalRevenue || 0)],
        ['Осы кезең табыс', Number(dashboardStats.stats?.currentPeriodRevenue || 0)],
        ['Бүгін жаңа пайдаланушылар', dashboardStats.stats?.newUsersToday || 0],
        ['Бұл апта жаңа пайдаланушылар', dashboardStats.stats?.newUsersThisWeek || 0],
        ['Брондаулар тренді (%)', dashboardStats.stats?.bookingsTrend || 0],
        ['Табыс тренді (%)', dashboardStats.stats?.revenueTrend || 0],
        ['Расталған брондаулар', dashboardStats.stats?.confirmedBookings || 0],
        ['Аяқталған брондаулар', dashboardStats.stats?.completedBookings || 0],
        ['Болдырылған брондаулар', dashboardStats.stats?.cancelledBookings || 0],
        ['Күтуде брондаулар', dashboardStats.stats?.pendingBookings || 0],
        ['Болдыру %', dashboardStats.stats?.cancellationRate || 0],
        ['Админмен белгіленген', dashboardStats.stats?.adminMarkedCompleted || 0],
        ['Назар аудару керек', dashboardStats.stats?.bookingsNeedingAttention || 0],
      ];
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Негізгі статистика');

      // 2. Брондаулар статистикасы
      if (dashboardStats.quickStats?.bookings) {
        const bookingsData = [
          ['Кезең', 'Брондаулар саны'],
          ['Бүгін', dashboardStats?.quickStats?.bookings?.today || 0],
          ['Бұл апта', dashboardStats?.quickStats?.bookings?.week || 0],
          ['Бұл ай', dashboardStats?.quickStats?.bookings?.month || 0],
        ];
        const bookingsSheet = XLSX.utils.aoa_to_sheet(bookingsData);
        XLSX.utils.book_append_sheet(workbook, bookingsSheet, 'Брондаулар');
      }

      // 3. Табыс статистикасы
      if (dashboardStats.quickStats?.revenue) {
        const revenueData = [
          ['Кезең', 'Табыс (₸)'],
          ['Бүгін', Number(dashboardStats?.quickStats?.revenue?.today || 0)],
          ['Бұл апта', Number(dashboardStats?.quickStats?.revenue?.week || 0)],
          ['Бұл ай', Number(dashboardStats?.quickStats?.revenue?.month || 0)],
        ];
        const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Табыс');
      }

      // 4. Пайдаланушылар статистикасы
      if (dashboardStats.quickStats?.users) {
        const usersData = [
          ['Кезең', 'Пайдаланушылар саны'],
          ['Бүгін', dashboardStats?.quickStats?.users?.today || 0],
          ['Бұл апта', dashboardStats?.quickStats?.users?.week || 0],
          ['Бұл ай', dashboardStats?.quickStats?.users?.month || 0],
        ];
        const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
        XLSX.utils.book_append_sheet(workbook, usersSheet, 'Пайдаланушылар');
      }

      // 5. Соңғы брондаулар
      if (dashboardStats.recentBookings && dashboardStats.recentBookings.length > 0) {
        const recentBookingsData = [
          ['Арена', 'Пайдаланушы', 'Күні', 'Уақыты', 'Статус', 'Сома (₸)'],
          ...dashboardStats.recentBookings.map((booking: any) => [
            booking.arena?.title || '',
            booking.user?.fullName || '',
            new Date(booking.startDatetime).toLocaleDateString('kk-KZ'),
            new Date(booking.startDatetime).toLocaleTimeString('kk-KZ'),
            booking.status || '',
            Number(booking.totalAmount || 0),
          ]),
        ];
        const recentBookingsSheet = XLSX.utils.aoa_to_sheet(recentBookingsData);
        XLSX.utils.book_append_sheet(workbook, recentBookingsSheet, 'Соңғы брондаулар');
      }

      // 6. Барлық брондаулар (толық ақпарат)
      try {
        // Барлық брондауларды алу (үлкен лимитпен)
        let allBookings: any[] = [];
        let currentPage = 1;
        const pageLimit = 1000;
        let hasMore = true;

        while (hasMore) {
          const bookingsData = await api.admin.getBookings({ page: currentPage, limit: pageLimit });
          if (bookingsData.bookings && bookingsData.bookings.length > 0) {
            allBookings = [...allBookings, ...bookingsData.bookings];
            hasMore = bookingsData.bookings.length === pageLimit && currentPage * pageLimit < (bookingsData.pagination?.total || 0);
            currentPage++;
          } else {
            hasMore = false;
          }
        }

        if (allBookings.length > 0) {
          const bookingsDetailData = [
            ['ID', 'Арена', 'Пайдаланушы', 'Email', 'Телефон', 'Басталу күні', 'Басталу уақыты', 'Аяқталу күні', 'Аяқталу уақыты', 'Статус', 'Жалпы сома (₸)', 'Төленген сома (₸)', 'Төлем статусы', 'Төлем әдісі', 'Промокод', 'Админмен белгіленген', 'Админ ескертпелері', 'Құрылған күні'],
            ...allBookings.map((booking: any) => [
              booking.id || '',
              booking.arena?.title || '',
              booking.user?.fullName || '',
              booking.user?.email || '',
              booking.user?.phone || '',
              new Date(booking.startDatetime).toLocaleDateString('kk-KZ'),
              new Date(booking.startDatetime).toLocaleTimeString('kk-KZ'),
              new Date(booking.endDatetime).toLocaleDateString('kk-KZ'),
              new Date(booking.endDatetime).toLocaleTimeString('kk-KZ'),
              booking.status === 'confirmed' ? 'Расталған' :
              booking.status === 'cancelled' ? 'Болдырылған' :
              booking.status === 'completed' ? 'Аяқталған' :
              booking.status === 'pending' ? 'Күтуде' :
              booking.status === 'rejected' ? 'Қабылданбады' :
              booking.status === 'hold' ? 'Ұсталған' : booking.status || '',
              Number(booking.totalAmount || 0),
              Number(booking.paidAmount || 0),
              booking.paymentStatus === 'paid' ? 'Төленген' :
              booking.paymentStatus === 'unpaid' ? 'Төленбеген' :
              booking.paymentStatus === 'partial' ? 'Жартылай төленген' :
              booking.paymentStatus === 'refunded' ? 'Қайтарылған' : booking.paymentStatus || '',
              booking.paymentMethod || '',
              booking.promoCode || '',
              booking.adminMarkedCompleted ? 'Иә' : 'Жоқ',
              booking.adminNotes || '',
              new Date(booking.createdAt).toLocaleDateString('kk-KZ') + ' ' + new Date(booking.createdAt).toLocaleTimeString('kk-KZ'),
            ]),
          ];
          const bookingsDetailSheet = XLSX.utils.aoa_to_sheet(bookingsDetailData);
          XLSX.utils.book_append_sheet(workbook, bookingsDetailSheet, 'Барлық брондаулар');

          // 6.1. Статустар бойынша топтау
          const statusGroups: { [key: string]: any[] } = {
            'Расталған': [],
            'Болдырылған': [],
            'Аяқталған': [],
            'Күтуде': [],
            'Қабылданбады': [],
            'Ұсталған': [],
          };

          allBookings.forEach((booking: any) => {
            const status = booking.status === 'confirmed' ? 'Расталған' :
              booking.status === 'cancelled' ? 'Болдырылған' :
              booking.status === 'completed' ? 'Аяқталған' :
              booking.status === 'pending' ? 'Күтуде' :
              booking.status === 'rejected' ? 'Қабылданбады' :
              booking.status === 'hold' ? 'Ұсталған' : booking.status || '';
            if (statusGroups[status]) {
              statusGroups[status].push(booking);
            }
          });

          // Әр статус үшін парақтарды жасау
          Object.entries(statusGroups).forEach(([status, bookings]) => {
            if (bookings.length > 0) {
              const statusData = [
                ['ID', 'Арена', 'Пайдаланушы', 'Email', 'Телефон', 'Басталу күні', 'Басталу уақыты', 'Аяқталу күні', 'Аяқталу уақыты', 'Жалпы сома (₸)', 'Төленген сома (₸)', 'Төлем статусы', 'Төлем әдісі', 'Промокод', 'Админмен белгіленген', 'Админ ескертпелері', 'Құрылған күні'],
                ...bookings.map((booking: any) => [
                  booking.id || '',
                  booking.arena?.title || '',
                  booking.user?.fullName || '',
                  booking.user?.email || '',
                  booking.user?.phone || '',
                  new Date(booking.startDatetime).toLocaleDateString('kk-KZ'),
                  new Date(booking.startDatetime).toLocaleTimeString('kk-KZ'),
                  new Date(booking.endDatetime).toLocaleDateString('kk-KZ'),
                  new Date(booking.endDatetime).toLocaleTimeString('kk-KZ'),
                  Number(booking.totalAmount || 0),
                  Number(booking.paidAmount || 0),
                  booking.paymentStatus === 'paid' ? 'Төленген' :
                  booking.paymentStatus === 'unpaid' ? 'Төленбеген' :
                  booking.paymentStatus === 'partial' ? 'Жартылай төленген' :
                  booking.paymentStatus === 'refunded' ? 'Қайтарылған' : booking.paymentStatus || '',
                  booking.paymentMethod || '',
                  booking.promoCode || '',
                  booking.adminMarkedCompleted ? 'Иә' : 'Жоқ',
                  booking.adminNotes || '',
                  new Date(booking.createdAt).toLocaleDateString('kk-KZ') + ' ' + new Date(booking.createdAt).toLocaleTimeString('kk-KZ'),
                ]),
              ];
              const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
              XLSX.utils.book_append_sheet(workbook, statusSheet, status);
            }
          });
        }
      } catch (err) {
        console.error('Брондауларды алу кезінде қате:', err);
      }

      // 7. Соңғы пайдаланушылар
      if (dashboardStats.recentUsers && dashboardStats.recentUsers.length > 0) {
        const recentUsersData = [
          ['Аты', 'Email', 'Телефон', 'Рөлі', 'Тіркелген күні'],
          ...dashboardStats.recentUsers.map((user: any) => [
            user.fullName || '',
            user.email || '',
            user.phone || '',
            user.role || '',
            new Date(user.createdAt).toLocaleDateString('kk-KZ'),
          ]),
        ];
        const recentUsersSheet = XLSX.utils.aoa_to_sheet(recentUsersData);
        XLSX.utils.book_append_sheet(workbook, recentUsersSheet, 'Соңғы пайдаланушылар');
      }

      // Ағымдағы күнмен файл атауын генерациялау
      const fileName = `ArenaReserve_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Файлды сақтау
      XLSX.writeFile(workbook, fileName);
      
      setError('');
    } catch (err: any) {
      setError('Excel файлды экспорттау кезінде қате орын алды: ' + err.message);
    }
  };

  // Payments functions
  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getPayments({
        page: paymentsPagination.page,
        limit: paymentsPagination.limit,
        ...paymentFilters,
      });
      setPayments(data.payments || []);
      setPaymentsPagination(data.pagination || paymentsPagination);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const stats = await api.admin.getPaymentStats();
      setPaymentStats(stats);
    } catch (err: any) {
      console.error('Failed to load payment stats:', err);
    }
  };

  const loadRefunds = async () => {
    try {
      const data = await api.admin.getRefunds({
        page: refundsPagination.page,
        limit: refundsPagination.limit,
      });
      setRefunds(data.refunds || []);
      setRefundsPagination(data.pagination || refundsPagination);
    } catch (err: any) {
      console.error('Failed to load refunds:', err);
    }
  };

  const handleCreateRefund = async (paymentId: string, amount?: number, reason?: string) => {
    if (!confirm('Қайтарымды жасауға сенімдісіз бе?')) return;
    
    try {
      await api.admin.createRefund(paymentId, amount, reason);
      loadPayments();
      loadRefunds();
    } catch (err: any) {
      setError(err.message || 'Қайтарым қатесі');
    }
  };

  // Ratings functions
  const loadRatings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getRatings({
        page: ratingsPagination.page,
        limit: ratingsPagination.limit,
        ...ratingFilters,
        hasComment: ratingFilters.hasComment === 'true' ? true : ratingFilters.hasComment === 'false' ? false : undefined,
        stars: ratingFilters.stars ? parseInt(ratingFilters.stars) : undefined,
      });
      setRatings(data.ratings || []);
      setRatingsPagination(data.pagination || ratingsPagination);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const loadRatingStats = async () => {
    try {
      const stats = await api.admin.getRatingStats();
      setRatingStats(stats);
    } catch (err: any) {
      console.error('Failed to load rating stats:', err);
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm('Рейтингті жоюға сенімдісіз бе?')) return;
    
    try {
      await api.admin.deleteRating(ratingId);
      loadRatings();
      loadRatingStats();
    } catch (err: any) {
      setError(err.message || 'Рейтингті жою қатесі');
    }
  };

  // Notifications functions
  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getNotifications({
        page: notificationsPagination.page,
        limit: notificationsPagination.limit,
        ...notificationFilters,
        isRead: notificationFilters.isRead === 'true' ? true : notificationFilters.isRead === 'false' ? false : undefined,
      });
      setNotifications(data.notifications || []);
      setNotificationsPagination(data.pagination || notificationsPagination);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const stats = await api.admin.getNotificationStats();
      setNotificationStats(stats);
    } catch (err: any) {
      console.error('Failed to load notification stats:', err);
    }
  };

  const handleSendBulkNotification = async (userIds: string[], type: string, payload: any, channel?: string) => {
    try {
      await api.admin.sendBulkNotification(userIds, type, payload, channel);
      loadNotifications();
      loadNotificationStats();
    } catch (err: any) {
      setError(err.message || 'Хабарландыру жіберу қатесі');
    }
  };

  // Audit functions
  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getAuditLogs({
        page: auditPagination.page,
        limit: auditPagination.limit,
        ...auditFilters,
      });
      setAuditLogs(data.logs || []);
      setAuditPagination(data.pagination || auditPagination);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const loadSuspiciousActivity = async () => {
    try {
      const activity = await api.admin.getSuspiciousActivity();
      setSuspiciousActivity(activity);
    } catch (err: any) {
      console.error('Failed to load suspicious activity:', err);
    }
  };

  const handleBlockUser = async (userId: string, reason?: string) => {
    if (!confirm('Пайдаланушыны бұғаттауға сенімдісіз бе?')) return;
    
    try {
      await api.admin.blockUser(userId, reason);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Бұғаттау қатесі');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!confirm('Пайдаланушының бұғатын алып тастауға сенімдісіз бе?')) return;
    
    try {
      await api.admin.unblockUser(userId);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Бұғатты алу қатесі');
    }
  };

  // Settings functions
  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getSettings();
      setSettings(data.settings);
    } catch (err: any) {
      setError(err.message || 'Қате орын алды');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updatedSettings: any) => {
    try {
      await api.admin.updateSettings(updatedSettings);
      loadSettings();
    } catch (err: any) {
      setError(err.message || 'Баптауларды жаңарту қатесі');
    }
  };

  // Add Arena function
  const handleCreateArena = async () => {
    setLoading(true);
    setError('');
    try {
      const arenaData: any = {
        title: newArena.title,
        description: newArena.description || undefined,
        sportType: newArena.sportType,
        address: newArena.address,
        pricePerHour: parseFloat(newArena.pricePerHour),
        timezone: newArena.timezone,
      };

      if (newArena.latitude && newArena.longitude) {
        arenaData.latitude = parseFloat(newArena.latitude);
        arenaData.longitude = parseFloat(newArena.longitude);
      }

      await api.createArena(arenaData);
      
      // Reset form
      setNewArena({
        title: '',
        description: '',
        sportType: 'football',
        address: '',
        latitude: '',
        longitude: '',
        pricePerHour: '',
        timezone: 'Asia/Almaty',
      });
      
      // Switch back to arenas tab and reload
      setActiveTab('arenas');
      loadArenas();
    } catch (err: any) {
      setError(err.message || 'Арена қосу қатесі');
    } finally {
      setLoading(false);
    }
  };

  // Edit Arena functions
  const handleEditArena = async (arena: any) => {
    try {
      const arenaDetails = await api.getArenaById(arena.id);
      setEditingArena({
        ...arenaDetails.arena,
        latitude: arenaDetails.arena.latitude?.toString() || '',
        longitude: arenaDetails.arena.longitude?.toString() || '',
        pricePerHour: arenaDetails.arena.pricePerHour?.toString() || '',
      });
      setArenaImages(arenaDetails.arena.images || []);
      setActiveTab('editArena');
    } catch (err: any) {
      setError(err.message || 'Арена деректерін жүктеу қатесі');
    }
  };

  const handleUpdateArena = async () => {
    if (!editingArena) return;
    
    setLoading(true);
    setError('');
    try {
      const arenaData: any = {
        title: editingArena.title,
        description: editingArena.description || undefined,
        sportType: editingArena.sportType,
        address: editingArena.address,
        pricePerHour: parseFloat(editingArena.pricePerHour),
        timezone: editingArena.timezone,
        status: editingArena.status,
      };

      if (editingArena.latitude && editingArena.longitude) {
        arenaData.latitude = parseFloat(editingArena.latitude);
        arenaData.longitude = parseFloat(editingArena.longitude);
      }

      await api.updateArena(editingArena.id, arenaData);
      
      // Switch back to arenas tab and reload
      setActiveTab('arenas');
      setEditingArena(null);
      setArenaImages([]);
      loadArenas();
    } catch (err: any) {
      setError(err.message || 'Аренаны жаңарту қатесі');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async (files: FileList) => {
    if (!editingArena || files.length === 0) return;
    
    setUploadingImages(true);
    setError('');
    try {
      const uploadPromises = Array.from(files).map(file => 
        api.uploadArenaImage(editingArena.id, file)
      );
      
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(r => r.image);
      setArenaImages([...arenaImages, ...newImages]);
    } catch (err: any) {
      setError(err.message || 'Суреттерді жүктеу қатесі');
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Админ панелі</h1>
          <p className="body-r text-[#808080]">Жүйені басқару</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#D9D9D9]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-[#2ECC71] text-[#2ECC71]'
                : 'border-transparent text-[#808080] hover:text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={18} />
              <span>Бақылау табло</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-[#2ECC71] text-[#2ECC71]'
                : 'border-transparent text-[#808080] hover:text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>Пайдаланушылар</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('arenas')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'arenas'
                ? 'border-[#2ECC71] text-[#2ECC71]'
                : 'border-transparent text-[#808080] hover:text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>Ареналар</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-[#2ECC71] text-[#2ECC71]'
                : 'border-transparent text-[#808080] hover:text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>Брондаулар</span>
            </div>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-[#FEE] border border-[#E74C3C] rounded-lg">
            <p className="text-[#E74C3C]">{error}</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
                <p className="mt-4 body-r text-[#808080]">Жүктелуде...</p>
              </div>
            ) : dashboardStats ? (
              <div className="space-y-6">
                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={exportAnalyticsToExcel}
                    className="flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Excel-ге экспорттау
                  </Button>
                </div>
                {/* Alerts */}
                {dashboardStats.alerts?.alerts && dashboardStats.alerts.alerts.length > 0 && (
                  <div className="space-y-2">
                    {dashboardStats.alerts.alerts.map((alert: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          alert.type === 'error'
                            ? 'bg-[#FEE] border-[#E74C3C]'
                            : alert.type === 'warning'
                            ? 'bg-[#FFF4E6] border-[#F39C12]'
                            : 'bg-[#E3F2FD] border-[#3498DB]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {alert.type === 'error' && <AlertCircle size={20} className="text-[#E74C3C]" />}
                          {alert.type === 'warning' && <AlertCircle size={20} className="text-[#F39C12]" />}
                          {alert.type === 'info' && <AlertCircle size={20} className="text-[#3498DB]" />}
                          <p className={`body-s ${
                            alert.type === 'error' ? 'text-[#E74C3C]' :
                            alert.type === 'warning' ? 'text-[#F39C12]' :
                            'text-[#3498DB]'
                          }`}>
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats Cards with Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#EAFBF3] rounded-full flex items-center justify-center">
                          <Users size={24} className="text-[#2ECC71]" />
                        </div>
                        {dashboardStats.stats?.newUsersToday !== undefined && (
                          <div className="text-right">
                            <p className="caption-r text-[#808080]">Бүгін</p>
                            <p className="body-s text-[#2ECC71] font-semibold">+{dashboardStats.stats.newUsersToday}</p>
                          </div>
                        )}
                      </div>
                      <p className="caption-r text-[#808080] mb-1">Жалпы пайдаланушылар</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{dashboardStats.stats?.totalUsers || 0}</p>
                      {dashboardStats.stats?.newUsersThisWeek !== undefined && (
                        <p className="caption-r text-[#808080] mt-1">Бұл апта: +{dashboardStats.stats.newUsersThisWeek}</p>
                      )}
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#EAFBF3] rounded-full flex items-center justify-center">
                          <MapPin size={24} className="text-[#2ECC71]" />
                        </div>
                      </div>
                      <p className="caption-r text-[#808080] mb-1">Жалпы ареналар</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{dashboardStats.stats?.totalArenas || 0}</p>
                      {dashboardStats.stats?.activeArenas !== undefined && (
                        <p className="caption-r text-[#808080] mt-1">Белсенді: {dashboardStats.stats.activeArenas}</p>
                      )}
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#EAFBF3] rounded-full flex items-center justify-center">
                          <Calendar size={24} className="text-[#2ECC71]" />
                        </div>
                        {dashboardStats.stats?.bookingsTrend !== undefined && (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <TrendingUp size={16} className={dashboardStats.stats.bookingsTrend >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'} />
                              <span className={`body-s font-semibold ${
                                dashboardStats.stats.bookingsTrend >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'
                              }`}>
                                {dashboardStats.stats.bookingsTrend >= 0 ? '+' : ''}{dashboardStats.stats.bookingsTrend}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="caption-r text-[#808080] mb-1">Жалпы брондаулар</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{dashboardStats.stats?.totalBookings || 0}</p>
                      {dashboardStats.stats?.currentPeriodBookings !== undefined && (
                        <p className="caption-r text-[#808080] mt-1">Осы кезең: {dashboardStats.stats.currentPeriodBookings}</p>
                      )}
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-[#EAFBF3] rounded-full flex items-center justify-center">
                          <DollarSign size={24} className="text-[#2ECC71]" />
                        </div>
                        {dashboardStats.stats?.revenueTrend !== undefined && (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <TrendingUp size={16} className={dashboardStats.stats.revenueTrend >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'} />
                              <span className={`body-s font-semibold ${
                                dashboardStats.stats.revenueTrend >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'
                              }`}>
                                {dashboardStats.stats.revenueTrend >= 0 ? '+' : ''}{dashboardStats.stats.revenueTrend}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="caption-r text-[#808080] mb-1">Жалпы табыс</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">
                        {formatCurrency(Number(dashboardStats.stats?.totalRevenue || 0))}
                      </p>
                      {dashboardStats.stats?.currentPeriodRevenue !== undefined && (
                        <p className="caption-r text-[#808080] mt-1">
                          Осы кезең: {formatCurrency(Number(dashboardStats.stats.currentPeriodRevenue))}
                        </p>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Booking Status Statistics */}
                {dashboardStats.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <div className="p-6">
                        <h3 className="mb-4">Брондаулар статистикасы</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Расталған</span>
                            <span className="body-s font-semibold text-[#2ECC71]">{dashboardStats.stats.confirmedBookings || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Аяқталған</span>
                            <span className="body-s font-semibold text-[#2ECC71]">{dashboardStats.stats.completedBookings || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Болдырылған</span>
                            <span className="body-s font-semibold text-[#E74C3C]">{dashboardStats.stats.cancelledBookings || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Күтуде</span>
                            <span className="body-s font-semibold text-[#F39C12]">{dashboardStats.stats.pendingBookings || 0}</span>
                          </div>
                          {dashboardStats.stats.cancellationRate !== undefined && (
                            <div className="flex justify-between pt-2 border-t border-[#D9D9D9]">
                              <span className="caption-r text-[#808080]">Болдыру %</span>
                              <span className="body-s font-semibold">{dashboardStats.stats.cancellationRate}%</span>
                            </div>
                          )}
                          {dashboardStats.stats.bookingsNeedingAttention !== undefined && dashboardStats.stats.bookingsNeedingAttention > 0 && (
                            <div className="flex justify-between pt-2 border-t border-[#D9D9D9]">
                              <span className="caption-r text-[#808080]">Назар аудару керек</span>
                              <span className="body-s font-semibold text-[#E74C3C]">{dashboardStats.stats.bookingsNeedingAttention}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Quick Stats */}
                {dashboardStats.quickStats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <div className="p-6">
                        <h3 className="mb-4">Брондаулар</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бүгін</span>
                            <span className="body-s font-semibold">{dashboardStats?.quickStats?.bookings?.today || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бұл апта</span>
                            <span className="body-s font-semibold">{dashboardStats?.quickStats?.bookings?.week || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бұл ай</span>
                            <span className="body-s font-semibold">{dashboardStats?.quickStats?.bookings?.month || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div className="p-6">
                        <h3 className="mb-4">Табыс</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бүгін</span>
                            <span className="body-s font-semibold">{formatCurrency(Number(dashboardStats?.quickStats?.revenue?.today || 0))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бұл апта</span>
                            <span className="body-s font-semibold">{formatCurrency(Number(dashboardStats?.quickStats?.revenue?.week || 0))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бұл ай</span>
                            <span className="body-s font-semibold">{formatCurrency(Number(dashboardStats?.quickStats?.revenue?.month || 0))}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div className="p-6">
                        <h3 className="mb-4">Пайдаланушылар</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бүгін</span>
                            <span className="body-s font-semibold">{dashboardStats?.quickStats?.users?.today || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бұл апта</span>
                            <span className="body-s font-semibold">{dashboardStats?.quickStats?.users?.week || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="caption-r text-[#808080]">Бұл ай</span>
                            <span className="body-s font-semibold">{dashboardStats?.quickStats?.users?.month || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Recent Bookings */}
                <Card>
                  <div className="p-6">
                    <h2 className="mb-4">Соңғы брондаулар</h2>
                    <div className="space-y-3">
                      {dashboardStats.recentBookings?.length > 0 ? (
                        dashboardStats.recentBookings.map((booking: any) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg">
                            <div>
                              <p className="body-s text-[#1A1A1A]">{booking.arena?.title}</p>
                              <p className="caption-r text-[#808080]">{booking.user?.fullName}</p>
                            </div>
                            <p className="caption-r text-[#808080]">{formatDate(booking.createdAt)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="body-r text-[#808080] text-center py-4">Брондаулар жоқ</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Recent Users */}
                <Card>
                  <div className="p-6">
                    <h2 className="mb-4">Соңғы пайдаланушылар</h2>
                    <div className="space-y-3">
                      {dashboardStats.recentUsers?.length > 0 ? (
                        dashboardStats.recentUsers.map((user: any) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-lg">
                            <div>
                              <p className="body-s text-[#1A1A1A]">{user.fullName}</p>
                              <p className="caption-r text-[#808080]">{user.email}</p>
                            </div>
                            <Tag variant={user.role === 'ADMIN' ? 'error' : user.role === 'OWNER' ? 'info' : 'default'}>
                              {user.role}
                            </Tag>
                          </div>
                        ))
                      ) : (
                        <p className="body-r text-[#808080] text-center py-4">Пайдаланушылар жоқ</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-4 flex gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#808080]" />
                <input
                  type="text"
                  placeholder="Іздеу..."
                  value={usersSearch}
                  onChange={(e) => {
                    setUsersSearch(e.target.value);
                    setUsersPagination({ ...usersPagination, page: 1 });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#1A1A1A]">{user.fullName}</h3>
                            <Tag variant={user.role === 'ADMIN' ? 'error' : user.role === 'OWNER' ? 'info' : 'default'}>
                              {user.role}
                            </Tag>
                            {user.isVerified && (
                              <Tag variant="success">
                                <CheckCircle size={14} className="mr-1" />
                                Расталған
                              </Tag>
                            )}
                          </div>
                          <p className="body-s text-[#808080] mb-1">{user.email}</p>
                          {user.phone && <p className="body-s text-[#808080]">{user.phone}</p>}
                          <p className="caption-r text-[#808080] mt-2">
                            Брондаулар: {user._count?.bookings || 0} | Ареналар: {user._count?.ownedArenas || 0}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              // Only super admin can assign ADMIN role
                              if (newRole === 'ADMIN' && currentUser && !currentUser.isSuperAdmin) {
                                setError('Тек негізгі админ ADMIN рөлін тағайындай алады');
                                return;
                              }
                              handleUpdateUserRole(user.id, newRole, user.isSuperAdmin);
                            }}
                            disabled={user.isSuperAdmin}
                            className="px-3 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71] disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="USER">USER</option>
                            <option value="OWNER">OWNER</option>
                            <option value="ADMIN" disabled={currentUser && !currentUser.isSuperAdmin}>
                              ADMIN
                            </option>
                          </select>
                          {user.isSuperAdmin && (
                            <span className="text-xs text-[#2ECC71] font-medium ml-2 px-2 py-1 bg-[#EAFBF3] rounded">
                              Основной админ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {users.length === 0 && !loading && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="body-r text-[#808080]">Пайдаланушылар табылмады</p>
                    </div>
                  </Card>
                )}
                {renderPagination(usersPagination, setUsersPagination)}
              </div>
            )}
          </div>
        )}

        {/* Arenas Tab */}
        {activeTab === 'arenas' && (
          <div>
            <div className="mb-4 flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#808080]" />
                <input
                  type="text"
                  placeholder="Іздеу..."
                  value={arenasSearch}
                  onChange={(e) => {
                    setArenasSearch(e.target.value);
                    setArenasPagination({ ...arenasPagination, page: 1 });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                />
              </div>
              <select
                value={arenaStatusFilter}
                onChange={(e) => {
                  setArenaStatusFilter(e.target.value);
                  setArenasPagination({ ...arenasPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлық статустар</option>
                <option value="active">Белсенді</option>
                <option value="maintenance">Техникалық қызмет</option>
                <option value="closed">Жабық</option>
              </select>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('addArena')}
              >
                + Арена қосу
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {arenas.map((arena) => (
                  <Card key={arena.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#1A1A1A]">{arena.title}</h3>
                            <Tag variant={
                              arena.status === 'active' ? 'success' :
                              arena.status === 'maintenance' ? 'warning' : 'error'
                            }>
                              {arena.status === 'active' ? 'Белсенді' :
                               arena.status === 'maintenance' ? 'Техникалық қызмет' : 'Жабық'}
                            </Tag>
                          </div>
                          <p className="body-s text-[#808080] mb-1">{arena.address}</p>
                          <p className="body-s text-[#808080] mb-1">Спорт түрі: {arena.sportType}</p>
                          <p className="body-s text-[#808080] mb-1">Баға: {Number(arena.pricePerHour)} ₸/сағ</p>
                          <p className="caption-r text-[#808080] mt-2">
                            Иесі: {arena.owner?.fullName} ({arena.owner?.email})
                          </p>
                          <p className="caption-r text-[#808080]">
                            Брондаулар: {arena._count?.bookings || 0} | Рейтингтер: {arena._count?.ratings || 0}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditArena(arena)}
                            title="Өңдеу"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await api.admin.verifyArena(arena.id);
                                loadArenas();
                              } catch (err: any) {
                                setError(err.message || 'Верификация қатесі');
                              }
                            }}
                            title="Верификациялау"
                          >
                            <CheckCircle size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const stats = await api.admin.getArenaStats(arena.id);
                                alert(`Статистика:\nБрондаулар: ${stats.stats.bookings}\nТабыс: ${formatCurrency(stats.stats.revenue)}\nРейтингтер: ${stats.stats.ratings}\nОрташа рейтинг: ${stats.stats.avgRating}`);
                              } catch (err: any) {
                                setError(err.message || 'Статистика қатесі');
                              }
                            }}
                            title="Статистика"
                          >
                            <BarChart3 size={16} />
                          </Button>
                          <select
                            value={arena.status}
                            onChange={(e) => handleUpdateArenaStatus(arena.id, e.target.value)}
                            className="px-3 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                          >
                            <option value="active">Белсенді</option>
                            <option value="maintenance">Техникалық қызмет</option>
                            <option value="closed">Жабық</option>
                          </select>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteArena(arena.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {arenas.length === 0 && !loading && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="body-r text-[#808080]">Ареналар табылмады</p>
                    </div>
                  </Card>
                )}
                {renderPagination(arenasPagination, setArenasPagination)}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div className="mb-4 flex gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#808080]" />
                <input
                  type="text"
                  placeholder="Іздеу..."
                  value={bookingsSearch}
                  onChange={(e) => {
                    setBookingsSearch(e.target.value);
                    setBookingsPagination({ ...bookingsPagination, page: 1 });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                />
              </div>
              <select
                value={bookingStatusFilter}
                onChange={(e) => {
                  setBookingStatusFilter(e.target.value);
                  setBookingsPagination({ ...bookingsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлық статустар</option>
                <option value="pending">Күтуде</option>
                <option value="confirmed">Расталған</option>
                <option value="cancelled">Болдырылған</option>
                <option value="completed">Аяқталған</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#1A1A1A]">{booking.arena?.title}</h3>
                            <Tag variant={
                              booking.status === 'confirmed' ? 'success' :
                              booking.status === 'pending' ? 'warning' :
                              booking.status === 'cancelled' ? 'error' : 'default'
                            }>
                              {booking.status === 'confirmed' ? 'Расталған' :
                               booking.status === 'pending' ? 'Күтуде' :
                               booking.status === 'cancelled' ? 'Болдырылған' :
                               booking.status === 'completed' ? 'Аяқталған' : booking.status}
                            </Tag>
                          </div>
                          <p className="body-s text-[#808080] mb-1">
                            Пайдаланушы: {booking.user?.fullName} ({booking.user?.email})
                          </p>
                          <p className="body-s text-[#808080] mb-1">
                            Басталу: {formatDate(booking.startDatetime)} - {new Date(booking.startDatetime).toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="body-s text-[#808080] mb-1">
                            Аяқталу: {formatDate(booking.endDatetime)} - {new Date(booking.endDatetime).toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {booking.totalAmount && (
                            <p className="body-s text-[#808080]">
                              Сома: {formatCurrency(Number(booking.totalAmount))}
                            </p>
                          )}
                          {booking.adminMarkedCompleted && (
                            <p className="caption-r text-[#2ECC71] mt-2">
                              ✓ Админмен аяқталған деп белгіленген
                            </p>
                          )}
                          {booking.adminNotes && (
                            <p className="caption-r text-[#808080] mt-1">
                              Ескерту: {booking.adminNotes}
                            </p>
                          )}
                          {/* Показываем предупреждение, если бронирование завершилось, но не отмечено */}
                          {new Date(booking.endDatetime) <= new Date() && 
                           !booking.adminMarkedCompleted && 
                           (booking.status === 'confirmed' || booking.status === 'pending') && (
                            <div className="mt-2 p-2 bg-[#FFF4E6] border border-[#F39C12] rounded-lg">
                              <p className="caption-r text-[#F39C12] mb-2">
                                ⚠ Сеанс аяқталды, бірақ аяқталған деп белгіленбеген
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {new Date(booking.endDatetime) <= new Date() && 
                           !booking.adminMarkedCompleted && 
                           (booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const notes = prompt('Ескерту енгізіңіз (міндетті емес):\n(Сеанс аяқталды, отмена болмады)');
                                  await api.admin.markBookingCompleted(booking.id, notes || undefined);
                                  loadBookings();
                                  setError('');
                                } catch (err: any) {
                                  setError(err.message || 'Брондауды белгілеу қатесі');
                                }
                              }}
                            >
                              Аяқталған деп белгілеу
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {bookings.length === 0 && !loading && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="body-r text-[#808080]">Брондаулар табылмады</p>
                    </div>
                  </Card>
                )}
                {renderPagination(bookingsPagination, setBookingsPagination)}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            {/* Payment Stats */}
            {paymentStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Жалпы</p>
                    <p className="text-xl font-bold">{paymentStats.total || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Сәтті</p>
                    <p className="text-xl font-bold text-[#2ECC71]">{paymentStats.succeeded || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Күтуде</p>
                    <p className="text-xl font-bold text-[#F39C12]">{paymentStats.pending || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Жалпы табыс</p>
                    <p className="text-xl font-bold">{formatCurrency(Number(paymentStats.totalRevenue || 0))}</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex gap-4 flex-wrap">
              <select
                value={paymentFilters.status}
                onChange={(e) => {
                  setPaymentFilters({ ...paymentFilters, status: e.target.value });
                  setPaymentsPagination({ ...paymentsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлық статустар</option>
                <option value="pending">Күтуде</option>
                <option value="succeeded">Сәтті</option>
                <option value="failed">Сәтсіз</option>
                <option value="refunded">Қайтарылған</option>
              </select>
              <select
                value={paymentFilters.provider}
                onChange={(e) => {
                  setPaymentFilters({ ...paymentFilters, provider: e.target.value });
                  setPaymentsPagination({ ...paymentsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлық провайдерлер</option>
                <option value="stripe">Stripe</option>
                <option value="kaspi">Kaspi</option>
                <option value="cash">Қолма-қол</option>
              </select>
              <input
                type="date"
                value={paymentFilters.startDate}
                onChange={(e) => {
                  setPaymentFilters({ ...paymentFilters, startDate: e.target.value });
                  setPaymentsPagination({ ...paymentsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                placeholder="Басталу күні"
              />
              <input
                type="date"
                value={paymentFilters.endDate}
                onChange={(e) => {
                  setPaymentFilters({ ...paymentFilters, endDate: e.target.value });
                  setPaymentsPagination({ ...paymentsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                placeholder="Аяқталу күні"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#1A1A1A]">{formatCurrency(Number(payment?.amount || 0))}</h3>
                            <Tag variant={
                              payment.status === 'succeeded' ? 'success' :
                              payment.status === 'pending' ? 'warning' :
                              payment.status === 'failed' ? 'error' : 'default'
                            }>
                              {payment.status === 'succeeded' ? 'Сәтті' :
                               payment.status === 'pending' ? 'Күтуде' :
                               payment.status === 'failed' ? 'Сәтсіз' :
                               payment.status === 'refunded' ? 'Қайтарылған' : payment.status}
                            </Tag>
                            <Tag variant="info">{payment.provider}</Tag>
                          </div>
                          <p className="body-s text-[#808080] mb-1">
                            Пайдаланушы: {payment.user?.fullName} ({payment.user?.email})
                          </p>
                          <p className="body-s text-[#808080] mb-1">
                            Арена: {payment.booking?.arena?.title}
                          </p>
                          <p className="caption-r text-[#808080]">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        {payment.status === 'succeeded' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateRefund(payment.id)}
                          >
                            Қайтарым
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {payments.length === 0 && !loading && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="body-r text-[#808080]">Төлемдер табылмады</p>
                    </div>
                  </Card>
                )}
                {renderPagination(paymentsPagination, setPaymentsPagination)}
              </div>
            )}

            {/* Refunds Section */}
            <div className="mt-8">
              <h2 className="mb-4">Қайтарымдар</h2>
              <div className="space-y-4">
                {refunds.map((refund) => (
                  <Card key={refund.id}>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="body-s text-[#1A1A1A]">{formatCurrency(Number(refund?.amount || 0))}</p>
                          <p className="caption-r text-[#808080]">
                            {refund.reason || 'Себеп көрсетілмеген'}
                          </p>
                          <p className="caption-r text-[#808080]">{formatDate(refund.createdAt)}</p>
                        </div>
                        <Tag variant={
                          refund.status === 'processed' ? 'success' :
                          refund.status === 'pending' ? 'warning' : 'error'
                        }>
                          {refund.status === 'processed' ? 'Өңделген' :
                           refund.status === 'pending' ? 'Күтуде' : 'Сәтсіз'}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                ))}
                {renderPagination(refundsPagination, setRefundsPagination)}
              </div>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div>
            {/* Rating Stats */}
            {ratingStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Жалпы</p>
                    <p className="text-xl font-bold">{ratingStats.total || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Орташа рейтинг</p>
                    <p className="text-xl font-bold">{ratingStats.avgRating || '0.00'}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Пікірмен</p>
                    <p className="text-xl font-bold">{ratingStats.withComments || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Пікірсіз</p>
                    <p className="text-xl font-bold">{(ratingStats.total || 0) - (ratingStats.withComments || 0)}</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Арена ID..."
                value={ratingFilters.arenaId}
                onChange={(e) => {
                  setRatingFilters({ ...ratingFilters, arenaId: e.target.value });
                  setRatingsPagination({ ...ratingsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              />
              <input
                type="text"
                placeholder="Пайдаланушы ID..."
                value={ratingFilters.userId}
                onChange={(e) => {
                  setRatingFilters({ ...ratingFilters, userId: e.target.value });
                  setRatingsPagination({ ...ratingsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              />
              <select
                value={ratingFilters.stars}
                onChange={(e) => {
                  setRatingFilters({ ...ratingFilters, stars: e.target.value });
                  setRatingsPagination({ ...ratingsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлық жұлдыздар</option>
                <option value="5">5 жұлдыз</option>
                <option value="4">4 жұлдыз</option>
                <option value="3">3 жұлдыз</option>
                <option value="2">2 жұлдыз</option>
                <option value="1">1 жұлдыз</option>
              </select>
              <select
                value={ratingFilters.hasComment}
                onChange={(e) => {
                  setRatingFilters({ ...ratingFilters, hasComment: e.target.value });
                  setRatingsPagination({ ...ratingsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлығы</option>
                <option value="true">Пікірмен</option>
                <option value="false">Пікірсіз</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <Card key={rating.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < rating.stars ? 'text-[#F39C12] fill-[#F39C12]' : 'text-[#D9D9D9]'}
                                />
                              ))}
                            </div>
                            <span className="body-s font-semibold">{rating.stars}/5</span>
                          </div>
                          {rating.comment && (
                            <p className="body-s text-[#1A1A1A] mb-2">{rating.comment}</p>
                          )}
                          <p className="body-s text-[#808080] mb-1">
                            Пайдаланушы: {rating.user?.fullName} ({rating.user?.email})
                          </p>
                          <p className="body-s text-[#808080] mb-1">
                            Арена: {rating.arena?.title}
                          </p>
                          <p className="caption-r text-[#808080]">
                            {formatDate(rating.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRating(rating.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {ratings.length === 0 && !loading && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="body-r text-[#808080]">Рейтингтер табылмады</p>
                    </div>
                  </Card>
                )}
                {renderPagination(ratingsPagination, setRatingsPagination)}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            {/* Notification Stats */}
            {notificationStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Жалпы</p>
                    <p className="text-xl font-bold">{notificationStats.total || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Оқылған</p>
                    <p className="text-xl font-bold text-[#2ECC71]">{notificationStats.read || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Оқылмаған</p>
                    <p className="text-xl font-bold text-[#F39C12]">{notificationStats.unread || 0}</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <p className="caption-r text-[#808080] mb-1">Түрлер</p>
                    <p className="text-xl font-bold">{notificationStats.byType?.length || 0}</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex gap-4 flex-wrap">
              <select
                value={notificationFilters.type}
                onChange={(e) => {
                  setNotificationFilters({ ...notificationFilters, type: e.target.value });
                  setNotificationsPagination({ ...notificationsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлық түрлер</option>
                <option value="booking_confirmed">Брондау расталды</option>
                <option value="booking_cancelled">Брондау болдырылды</option>
                <option value="payment_succeeded">Төлем сәтті</option>
                <option value="payment_failed">Төлем сәтсіз</option>
              </select>
              <select
                value={notificationFilters.channel}
                onChange={(e) => {
                  setNotificationFilters({ ...notificationFilters, channel: e.target.value });
                  setNotificationsPagination({ ...notificationsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлық арналар</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
              <select
                value={notificationFilters.isRead}
                onChange={(e) => {
                  setNotificationFilters({ ...notificationFilters, isRead: e.target.value });
                  setNotificationsPagination({ ...notificationsPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              >
                <option value="">Барлығы</option>
                <option value="true">Оқылған</option>
                <option value="false">Оқылмаған</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#1A1A1A]">{notification.type}</h3>
                            <Tag variant={notification.isRead ? 'default' : 'info'}>
                              {notification.isRead ? 'Оқылған' : 'Оқылмаған'}
                            </Tag>
                            <Tag variant="info">{notification.channel}</Tag>
                          </div>
                          <p className="body-s text-[#808080] mb-1">
                            Пайдаланушы: {notification.user?.fullName} ({notification.user?.email})
                          </p>
                          <p className="caption-r text-[#808080]">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {notifications.length === 0 && !loading && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="body-r text-[#808080]">Хабарландырулар табылмады</p>
                    </div>
                  </Card>
                )}
                {renderPagination(notificationsPagination, setNotificationsPagination)}
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div>
            {/* Suspicious Activity */}
            {suspiciousActivity && (
              <div className="mb-6 space-y-4">
                {suspiciousActivity.failedLogins && suspiciousActivity.failedLogins.length > 0 && (
                  <Card>
                    <div className="p-6">
                      <h3 className="mb-4 flex items-center gap-2">
                        <AlertCircle className="text-[#E74C3C]" />
                        Сәтсіз кірулер
                      </h3>
                      <div className="space-y-2">
                        {suspiciousActivity.failedLogins.map((item: any, index: number) => (
                          <div key={index} className="p-3 bg-[#FEE] rounded-lg">
                            <p className="body-s">Пайдаланушы ID: {item.userId || 'Белгісіз'}</p>
                            <p className="caption-r text-[#808080]">IP: {item.ipAddress}</p>
                            <p className="caption-r text-[#808080]">Әрекеттер: {item.attempts}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
                {suspiciousActivity.suspiciousIPs && suspiciousActivity.suspiciousIPs.length > 0 && (
                  <Card>
                    <div className="p-6">
                      <h3 className="mb-4 flex items-center gap-2">
                        <AlertCircle className="text-[#F39C12]" />
                        Күдікті IP адрестер
                      </h3>
                      <div className="space-y-2">
                        {suspiciousActivity.suspiciousIPs.map((item: any, index: number) => (
                          <div key={index} className="p-3 bg-[#FFF4E6] rounded-lg">
                            <p className="body-s">IP: {item.ipAddress}</p>
                            <p className="caption-r text-[#808080]">Әрекеттер: {item.actions}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Пайдаланушы ID..."
                value={auditFilters.userId}
                onChange={(e) => {
                  setAuditFilters({ ...auditFilters, userId: e.target.value });
                  setAuditPagination({ ...auditPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              />
              <input
                type="text"
                placeholder="Әрекет..."
                value={auditFilters.action}
                onChange={(e) => {
                  setAuditFilters({ ...auditFilters, action: e.target.value });
                  setAuditPagination({ ...auditPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              />
              <input
                type="text"
                placeholder="Ресурс..."
                value={auditFilters.resource}
                onChange={(e) => {
                  setAuditFilters({ ...auditFilters, resource: e.target.value });
                  setAuditPagination({ ...auditPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              />
              <input
                type="text"
                placeholder="IP адрес..."
                value={auditFilters.ipAddress}
                onChange={(e) => {
                  setAuditFilters({ ...auditFilters, ipAddress: e.target.value });
                  setAuditPagination({ ...auditPagination, page: 1 });
                }}
                className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <Card key={log.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#1A1A1A]">{log.action}</h3>
                            <Tag variant="info">{log.resource}</Tag>
                          </div>
                          {log.user && (
                            <p className="body-s text-[#808080] mb-1">
                              Пайдаланушы: {log.user.fullName} ({log.user.email})
                            </p>
                          )}
                          {log.ipAddress && (
                            <p className="body-s text-[#808080] mb-1">IP: {log.ipAddress}</p>
                          )}
                          {log.resourceId && (
                            <p className="body-s text-[#808080] mb-1">Ресурс ID: {log.resourceId}</p>
                          )}
                          <p className="caption-r text-[#808080]">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {auditLogs.length === 0 && !loading && (
                  <Card>
                    <div className="p-8 text-center">
                      <p className="body-r text-[#808080]">Аудит логтары табылмады</p>
                    </div>
                  </Card>
                )}
                {renderPagination(auditPagination, setAuditPagination)}
              </div>
            )}
          </div>
        )}

        {/* Add Arena Tab */}
        {activeTab === 'addArena' && (
          <div>
            <div className="mb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('arenas')}
              >
                ← Артқа
              </Button>
            </div>

            <Card>
              <div className="p-6">
                <h2 className="mb-6">Жаңа арена қосу</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Атауы *</label>
                    <input
                      type="text"
                      value={newArena.title}
                      onChange={(e) => setNewArena({ ...newArena, title: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      placeholder="Арена атауы"
                    />
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Сипаттама</label>
                    <textarea
                      value={newArena.description}
                      onChange={(e) => setNewArena({ ...newArena, description: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      rows={4}
                      placeholder="Арена сипаттамасы"
                    />
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Спорт түрі *</label>
                    <select
                      value={newArena.sportType}
                      onChange={(e) => setNewArena({ ...newArena, sportType: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                    >
                      <option value="football">Футбол</option>
                      <option value="basketball">Баскетбол</option>
                      <option value="volleyball">Волейбол</option>
                      <option value="tennis">Теннис</option>
                      <option value="badminton">Бадминтон</option>
                      <option value="table-tennis">Ас үстелі теннисі</option>
                      <option value="other">Басқа</option>
                    </select>
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Мекен-жайы *</label>
                    <input
                      type="text"
                      value={newArena.address}
                      onChange={(e) => setNewArena({ ...newArena, address: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      placeholder="Қала, көше, үй нөмірі"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Ендік (Latitude)</label>
                      <input
                        type="number"
                        step="any"
                        value={newArena.latitude}
                        onChange={(e) => setNewArena({ ...newArena, latitude: e.target.value })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        placeholder="51.1605"
                      />
                    </div>
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Бойлық (Longitude)</label>
                      <input
                        type="number"
                        step="any"
                        value={newArena.longitude}
                        onChange={(e) => setNewArena({ ...newArena, longitude: e.target.value })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        placeholder="71.4704"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Сағаттық бағасы (₸) *</label>
                    <input
                      type="number"
                      value={newArena.pricePerHour}
                      onChange={(e) => setNewArena({ ...newArena, pricePerHour: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      placeholder="5000"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Уақыт белдеуі</label>
                    <select
                      value={newArena.timezone}
                      onChange={(e) => setNewArena({ ...newArena, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                    >
                      <option value="Asia/Almaty">Asia/Almaty</option>
                      <option value="Asia/Aqtobe">Asia/Aqtobe</option>
                      <option value="Asia/Aqtau">Asia/Aqtau</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setActiveTab('arenas')}
                      className="flex-1"
                    >
                      Болдырмау
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCreateArena}
                      className="flex-1"
                      disabled={loading || !newArena.title || !newArena.address || !newArena.pricePerHour}
                    >
                      {loading ? 'Жүктелуде...' : 'Арена қосу'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Arena Tab */}
        {activeTab === 'editArena' && editingArena && (
          <div>
            <div className="mb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveTab('arenas');
                  setEditingArena(null);
                  setArenaImages([]);
                }}
              >
                ← Артқа
              </Button>
            </div>

            <Card>
              <div className="p-6">
                <h2 className="mb-6">Аренаны өңдеу</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Атауы *</label>
                    <input
                      type="text"
                      value={editingArena.title}
                      onChange={(e) => setEditingArena({ ...editingArena, title: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      placeholder="Арена атауы"
                    />
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Сипаттама</label>
                    <textarea
                      value={editingArena.description || ''}
                      onChange={(e) => setEditingArena({ ...editingArena, description: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      rows={4}
                      placeholder="Арена сипаттамасы"
                    />
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Спорт түрі *</label>
                    <select
                      value={editingArena.sportType}
                      onChange={(e) => setEditingArena({ ...editingArena, sportType: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                    >
                      <option value="football">Футбол</option>
                      <option value="basketball">Баскетбол</option>
                      <option value="volleyball">Волейбол</option>
                      <option value="tennis">Теннис</option>
                      <option value="badminton">Бадминтон</option>
                      <option value="table-tennis">Ас үстелі теннисі</option>
                      <option value="other">Басқа</option>
                    </select>
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Мекен-жайы *</label>
                    <input
                      type="text"
                      value={editingArena.address}
                      onChange={(e) => setEditingArena({ ...editingArena, address: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      placeholder="Қала, көше, үй нөмірі"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Ендік (Latitude)</label>
                      <input
                        type="number"
                        step="any"
                        value={editingArena.latitude}
                        onChange={(e) => setEditingArena({ ...editingArena, latitude: e.target.value })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        placeholder="51.1605"
                      />
                    </div>
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Бойлық (Longitude)</label>
                      <input
                        type="number"
                        step="any"
                        value={editingArena.longitude}
                        onChange={(e) => setEditingArena({ ...editingArena, longitude: e.target.value })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        placeholder="71.4704"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Сағаттық бағасы (₸) *</label>
                    <input
                      type="number"
                      value={editingArena.pricePerHour}
                      onChange={(e) => setEditingArena({ ...editingArena, pricePerHour: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                      placeholder="5000"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Статус</label>
                    <select
                      value={editingArena.status}
                      onChange={(e) => setEditingArena({ ...editingArena, status: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                    >
                      <option value="active">Белсенді</option>
                      <option value="maintenance">Техникалық қызмет</option>
                      <option value="closed">Жабық</option>
                    </select>
                  </div>

                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Уақыт белдеуі</label>
                    <select
                      value={editingArena.timezone}
                      onChange={(e) => setEditingArena({ ...editingArena, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                    >
                      <option value="Asia/Almaty">Asia/Almaty</option>
                      <option value="Asia/Aqtobe">Asia/Aqtobe</option>
                      <option value="Asia/Aqtau">Asia/Aqtau</option>
                    </select>
                  </div>

                  {/* Images Section */}
                  <div>
                    <label className="block body-s text-[#1A1A1A] mb-2">Суреттер</label>
                    
                    {/* Existing Images */}
                    {arenaImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {arenaImages.map((image: any, index: number) => (
                          <div
                            key={image.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/html', image.id);
                              e.currentTarget.style.opacity = '0.5';
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              e.currentTarget.style.border = '2px dashed #2ECC71';
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.style.border = '';
                            }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.currentTarget.style.border = '';
                              const draggedImageId = e.dataTransfer.getData('text/html');
                              
                              if (draggedImageId === image.id) return;
                              
                              const draggedIndex = arenaImages.findIndex((img: any) => img.id === draggedImageId);
                              if (draggedIndex === -1) return;
                              
                              const newImages = [...arenaImages];
                              const [removed] = newImages.splice(draggedIndex, 1);
                              newImages.splice(index, 0, removed);
                              
                              setArenaImages(newImages);
                              
                              // Save new order to backend
                              if (editingArena) {
                                try {
                                  setError('');
                                  await api.reorderArenaImages(
                                    editingArena.id,
                                    newImages.map((img: any) => img.id)
                                  );
                                } catch (err: any) {
                                  setError(err.message || 'Суреттердің ретін өзгерту қатесі');
                                  // Revert on error
                                  setArenaImages(arenaImages);
                                }
                              }
                            }}
                            className="relative group cursor-move"
                            title="Суретті тартып, ретін өзгерту"
                          >
                            <img
                              src={image.url}
                              alt={image.altText || 'Arena image'}
                              className="w-full h-32 object-cover rounded-lg border border-[#D9D9D9]"
                              draggable={false}
                            />
                            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              #{index + 1}
                            </div>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!editingArena) return;
                                
                                if (!confirm('Бұл суретті жоюға сенімдісіз бе?')) {
                                  return;
                                }
                                
                                try {
                                  setError('');
                                  await api.deleteArenaImage(editingArena.id, image.id);
                                  setArenaImages(arenaImages.filter((img: any) => img.id !== image.id));
                                } catch (err: any) {
                                  setError(err.message || 'Суретті жою қатесі');
                                }
                              }}
                              className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-bl-lg rounded-tr-lg p-2 shadow-xl z-20 flex items-center justify-center transition-all hover:scale-110 border-2 border-white cursor-pointer min-w-[32px] min-h-[32px]"
                              title="Суретті жою"
                              aria-label="Суретті жою"
                            >
                              <XIcon size={20} strokeWidth={3.5} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload New Images */}
                    <div className="border-2 border-dashed border-[#D9D9D9] rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleUploadImages(e.target.files);
                          }
                        }}
                        className="hidden"
                        id="arena-image-upload"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="arena-image-upload"
                        className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload size={32} className="text-[#808080]" />
                        <span className="body-s text-[#808080]">
                          {uploadingImages ? 'Жүктелуде...' : 'Бірнеше суретті таңдау (Ctrl+Click)'}
                        </span>
                        <span className="caption-r text-[#808080]">
                          PNG, JPG, JPEG (макс. 5MB)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => {
                        setActiveTab('arenas');
                        setEditingArena(null);
                        setArenaImages([]);
                      }}
                      className="flex-1"
                    >
                      Болдырмау
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleUpdateArena}
                      className="flex-1"
                      disabled={loading || !editingArena.title || !editingArena.address || !editingArena.pricePerHour}
                    >
                      {loading ? 'Жүктелуде...' : 'Сақтау'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ECC71]"></div>
              </div>
            ) : settings ? (
              <Card>
                <div className="p-6">
                  <h2 className="mb-6">Жүйе баптаулары</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Платформа комиссиясы (%)</label>
                      <input
                        type="number"
                        value={settings.platformCommission || 10}
                        onChange={(e) => setSettings({ ...settings, platformCommission: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Минималды комиссия</label>
                      <input
                        type="number"
                        value={settings.minCommission || 0}
                        onChange={(e) => setSettings({ ...settings, minCommission: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Минималды брондау уақыты (сағат)</label>
                      <input
                        type="number"
                        value={settings.bookingSettings?.minBookingDuration || 1}
                        onChange={(e) => setSettings({
                          ...settings,
                          bookingSettings: {
                            ...settings.bookingSettings,
                            minBookingDuration: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block body-s text-[#1A1A1A] mb-2">Максималды брондау уақыты (сағат)</label>
                      <input
                        type="number"
                        value={settings.bookingSettings?.maxBookingDuration || 6}
                        onChange={(e) => setSettings({
                          ...settings,
                          bookingSettings: {
                            ...settings.bookingSettings,
                            maxBookingDuration: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:border-[#2ECC71]"
                        min="1"
                      />
                    </div>
                    <div className="pt-4">
                      <Button onClick={() => handleUpdateSettings(settings)}>
                        Баптауларды сақтау
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="p-8 text-center">
                  <p className="body-r text-[#808080]">Баптаулар жүктелуде...</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

