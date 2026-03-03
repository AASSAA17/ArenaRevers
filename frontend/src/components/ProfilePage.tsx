import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, X, FileText, Download } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { api } from '../utils/api';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    phone: string;
  };
  onUpdateProfile: (user: { name: string; email: string; phone: string }) => void;
  onLogout: () => void;
}

export function ProfilePage({ user, onUpdateProfile, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoadingReceipts(true);
      const bookingsResponse = await api.getBookings();
      if (bookingsResponse.bookings) {
        // Filter only paid or confirmed bookings (all bookings that have been paid)
        const paidBookings = bookingsResponse.bookings.filter((b: any) => 
          b.paymentStatus === 'paid' || (b.status === 'confirmed' && b.paymentStatus !== 'unpaid')
        );
        setReceipts(paidBookings);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleDownloadReceipt = async (bookingId: string) => {
    try {
      await api.downloadReceipt(bookingId);
    } catch (error: any) {
      alert(error.message || 'Чекті жүктеу қатесі');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1>Менің профилім</h1>
          <Button variant="destructive" size="md" onClick={onLogout}>
            Шығу
          </Button>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2>Жеке ақпарат</h2>
            {!isEditing ? (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} className="mr-2" />
                Өзгерту
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X size={16} className="mr-2" />
                  Болдырмау
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  <Save size={16} className="mr-2" />
                  Сақтау
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Аты-жөні"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-lg">
                <User size={20} className="text-[#808080]" />
                <div>
                  <p className="caption-r text-[#808080]">Аты-жөні</p>
                  <p className="body-r text-[#1A1A1A]">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-lg">
                <Mail size={20} className="text-[#808080]" />
                <div>
                  <p className="caption-r text-[#808080]">Email</p>
                  <p className="body-r text-[#1A1A1A]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#F5F5F5] rounded-lg">
                <Phone size={20} className="text-[#808080]" />
                <div>
                  <p className="caption-r text-[#808080]">Телефон</p>
                  <p className="body-r text-[#1A1A1A]">{user.phone}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-[#2ECC71] mb-2">{receipts.length}</div>
              <p className="body-s text-[#808080]">Жалпы брондаулар</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-[#2ECC71] mb-2">{receipts.length}</div>
              <p className="body-s text-[#808080]">Келер брондаулар</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-[#2ECC71] mb-2">
                {receipts.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0)} ₸
              </div>
              <p className="body-s text-[#808080]">Жалпы шығын</p>
            </div>
          </Card>
        </div>

        {/* Receipts Section */}
        <Card>
          <div className="mb-6">
            <h2>Чектер</h2>
            <p className="body-s text-[#808080] mt-1">
              Төленген брондаулардың чектерін жүктеңіз
            </p>
          </div>

          {loadingReceipts ? (
            <div className="text-center py-8">
              <p className="body-r text-[#808080]">Жүктелуде...</p>
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={48} className="text-[#D9D9D9] mx-auto mb-4" />
              <p className="body-r text-[#808080]">Чектер жоқ</p>
              <p className="body-s text-[#808080] mt-2">
                Төленген брондаулардың чектері мұнда пайда болады
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt: any) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-lg hover:bg-[#E5E5E5] transition-colors"
                >
                  <div className="flex-1">
                    <p className="body-r text-[#1A1A1A] mb-1">
                      {receipt.arena?.title || 'Арена'}
                    </p>
                    <p className="body-s text-[#808080]">
                      {new Date(receipt.startDatetime).toLocaleDateString('kk-KZ')} • {Number(receipt.totalAmount).toFixed(0)} ₸
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadReceipt(receipt.id)}
                  >
                    <Download size={16} className="mr-2" />
                    Чекті жүктеу
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
