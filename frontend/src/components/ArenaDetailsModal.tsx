import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Calendar, Clock, DollarSign, Share2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { api } from '../utils/api';

interface ArenaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  arenaId: string;
  onBook?: () => void;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onAuthRequired?: () => void;
}

interface ArenaDetails {
  id: string;
  title: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  pricePerHour: number;
  sportType: string;
  images: Array<{ id: string; url: string; altText?: string }>;
  avgRating: number;
  ratingCount: number;
  owner?: {
    fullName: string;
  };
}

export function ArenaDetailsModal({ 
  isOpen, 
  onClose, 
  arenaId, 
  onBook,
  onFavoriteChange,
  onAuthRequired
}: ArenaDetailsModalProps) {
  const [arena, setArena] = useState<ArenaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ratings, setRatings] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && arenaId) {
      loadArenaDetails();
      checkFavorite();
      loadRatings();
    }
  }, [isOpen, arenaId]);

  const loadArenaDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getArenaById(arenaId);
      setArena(response.arena);
    } catch (err: any) {
      setError(err.message || 'Арена деректерін жүктеу қатесі');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const result = await api.checkFavorite(arenaId);
        setIsFavorite(result.isFavorite || false);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const loadRatings = async () => {
    try {
      const response = await api.getArenaRatings(arenaId, 1, 5);
      setRatings(response.ratings || []);
    } catch (error) {
      // Silently fail
    }
  };

  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    try {
      if (isFavorite) {
        await api.removeFavorite(arenaId);
        setIsFavorite(false);
        if (onFavoriteChange) {
          onFavoriteChange(false);
        }
      } else {
        await api.addFavorite(arenaId);
        setIsFavorite(true);
        if (onFavoriteChange) {
          onFavoriteChange(true);
        }
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (!arena) return;

    const shareData = {
      title: arena.title,
      text: `${arena.title} - ${arena.address}`,
      url: window.location.origin + `#arena-${arenaId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Сілтеме алмасу буферіне көшірілді');
    }
  };

  const handleViewOnMap = () => {
    if (!arena) return;
    
    if (arena.latitude && arena.longitude) {
      const url = `https://www.google.com/maps?q=${arena.latitude},${arena.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(arena.address)}`;
      window.open(url, '_blank');
    }
  };

  const nextImage = () => {
    if (arena && arena.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % arena.images.length);
    }
  };

  const prevImage = () => {
    if (arena && arena.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + arena.images.length) % arena.images.length);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-[20px] p-8">
          <p className="body-r">Жүктелуде...</p>
        </div>
      </div>
    );
  }

  if (error || !arena) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[20px] p-8 max-w-md">
          <p className="body-r text-red-500 mb-4">{error || 'Арена табылмады'}</p>
          <Button variant="primary" onClick={onClose}>
            Жабу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[20px] w-full max-w-4xl my-8 shadow-[0px_4px_24px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#D9D9D9] p-6 flex items-center justify-between rounded-t-[20px] z-10">
          <h2>{arena.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-[#F5F5F5] text-[#808080] hover:bg-[#E5E5E5]'
              }`}
            >
              <Heart 
                size={20} 
                className={isFavorite ? 'fill-red-600 text-red-600' : 'text-[#808080]'} 
                style={isFavorite ? { fill: '#dc2626', stroke: '#dc2626' } : { fill: 'none', stroke: '#808080' }}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-[#F5F5F5] text-[#808080] hover:bg-[#E5E5E5] transition-colors"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#F5F5F5] text-[#808080] hover:bg-[#E5E5E5] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Images Gallery */}
          {arena.images && arena.images.length > 0 && (
            <div className="relative">
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={arena.images[currentImageIndex]?.url || ''}
                  alt={arena.images[currentImageIndex]?.altText || arena.title}
                  className="w-full h-full object-cover"
                />
                {arena.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {arena.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-[#2ECC71]" />
              <div>
                <p className="caption-r text-[#808080]">Мекен-жайы</p>
                <p className="body-r text-[#1A1A1A]">{arena.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-[#2ECC71]" />
              <div>
                <p className="caption-r text-[#808080]">Бағасы</p>
                <p className="body-r text-[#1A1A1A]">{Number(arena.pricePerHour).toFixed(0)} ₸/сағат</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star size={20} className="text-[#2ECC71]" />
              <div>
                <p className="caption-r text-[#808080]">Рейтинг</p>
                <p className="body-r text-[#1A1A1A]">
                  {arena.avgRating.toFixed(1)} ({arena.ratingCount} пікір)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-[#2ECC71]" />
              <div>
                <p className="caption-r text-[#808080]">Спорт түрі</p>
                <p className="body-r text-[#1A1A1A]">{arena.sportType}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {arena.description && (
            <div>
              <h3 className="mb-2">Сипаттама</h3>
              <p className="body-r text-[#4D4D4D]">{arena.description}</p>
            </div>
          )}

          {/* Recent Ratings */}
          {ratings.length > 0 && (
            <div>
              <h3 className="mb-4">Соңғы пікірлер</h3>
              <div className="space-y-4">
                {ratings.map((rating: any) => (
                  <div key={rating.id} className="border-b border-[#D9D9D9] pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= rating.stars
                                ? 'fill-[#2ECC71] text-[#2ECC71]'
                                : 'text-[#D9D9D9]'
                            }
                          />
                        ))}
                      </div>
                      <span className="body-s text-[#808080]">
                        {rating.user?.fullName || 'Аноним'}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="body-s text-[#4D4D4D]">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#D9D9D9]">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleViewOnMap}
              className="flex-1"
            >
              <MapPin size={20} className="mr-2" />
              Картада көру
            </Button>
            {onBook && (
              <Button
                variant="primary"
                size="lg"
                onClick={onBook}
                className="flex-1"
              >
                Брондау
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

