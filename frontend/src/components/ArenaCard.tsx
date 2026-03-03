import React, { useState, useEffect } from 'react';
import { MapPin, Star, Heart, Share2, Eye, AlertCircle, Wrench } from 'lucide-react';
import { Button } from './Button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { api } from '../utils/api';
import { toast } from 'sonner';

interface ArenaCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  latitude?: number;
  longitude?: number;
  status?: 'active' | 'maintenance' | 'closed';
  onBook?: () => void;
  onViewDetails?: () => void;
  isFavorite?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onAuthRequired?: () => void;
}

export function ArenaCard({ 
  id, 
  image, 
  title, 
  location, 
  price, 
  rating, 
  latitude,
  longitude,
  status = 'active',
  onBook,
  onViewDetails,
  isFavorite: initialIsFavorite,
  onFavoriteChange,
  onAuthRequired
}: ArenaCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false);

  useEffect(() => {
    // Check if arena is in favorites
    const checkFavorite = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsCheckingFavorite(true);
          const result = await api.checkFavorite(id);
          setIsFavorite(result.isFavorite || false);
          if (onFavoriteChange) {
            onFavoriteChange(result.isFavorite || false);
          }
        }
      } catch (error) {
        // Silently fail - user might not be logged in
      } finally {
        setIsCheckingFavorite(false);
      }
    };

    checkFavorite();
  }, [id, onFavoriteChange]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast.error('Таңдаулыға қосу үшін кіру керек');
      }
      return;
    }

    try {
      if (isFavorite) {
        await api.removeFavorite(id);
        setIsFavorite(false);
        if (onFavoriteChange) {
          onFavoriteChange(false);
        }
        toast.success('Таңдаулыдан алып тасталды');
      } else {
        await api.addFavorite(id);
        setIsFavorite(true);
        if (onFavoriteChange) {
          onFavoriteChange(true);
        }
        toast.success('Таңдаулыға қосылды');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message || 'Қате орын алды');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: title,
      text: `${title} - ${location}`,
      url: window.location.origin + `#arena-${id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Сілтеме алмасу буферіне көшірілді');
    }
  };

  const handleViewOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latitude && longitude) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else {
      // Fallback to address search
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(url, '_blank');
    }
  };

  const isUnavailable = status === 'maintenance' || status === 'closed';
  const statusText = status === 'maintenance' 
    ? 'Техникалық проблемалар' 
    : status === 'closed' 
    ? 'Қолжетімсіз' 
    : '';

  return (
    <div className={`bg-white rounded-xl overflow-hidden hover:shadow-[0px_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 transform hover:scale-[1.02] animate-in fade-in ${isUnavailable ? 'opacity-75' : ''}`}>
      <div className="relative h-48 overflow-hidden group">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className={`w-full h-full object-cover ${isUnavailable ? 'grayscale' : ''}`}
        />
        <div className="absolute top-3 right-3 bg-[#2ECC71] text-white px-3 py-1 rounded-full">
          <span className="body-s">{price} ₸/сағат</span>
        </div>
        {isUnavailable && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full flex items-center gap-1 ${
            status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500'
          } text-white`}>
            {status === 'maintenance' ? <Wrench size={14} /> : <AlertCircle size={14} />}
            <span className="body-s">{statusText}</span>
          </div>
        )}
        
        {/* Action buttons overlay */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite 
                ? 'bg-red-500/90 hover:bg-red-600/90' 
                : 'bg-white/90 text-[#808080] hover:bg-white'
            }`}
            title={isFavorite ? 'Таңдаулыдан алып тастау' : 'Таңдаулыға қосу'}
          >
            <Heart 
              size={18} 
              className={isFavorite ? 'fill-red-600 text-red-600' : 'text-[#808080]'} 
              style={isFavorite ? { fill: '#dc2626', stroke: '#dc2626' } : { fill: 'none', stroke: '#808080' }}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 text-[#808080] hover:bg-white transition-colors"
            title="Бөлісу"
          >
            <Share2 size={18} />
          </button>
          {latitude && longitude && (
            <button
              onClick={handleViewOnMap}
              className="p-2 rounded-full bg-white/90 text-[#808080] hover:bg-white transition-colors"
              title="Картада көру"
            >
              <MapPin size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <h3>{title}</h3>
        
        <div className="flex items-center gap-2 text-[#808080]">
          <MapPin size={16} />
          <span className="body-s">{location}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={20}
              className={i < Math.floor(rating) ? 'fill-[#2ECC71] text-[#2ECC71]' : 'text-[#D9D9D9]'}
            />
          ))}
          <span className="body-s text-[#4D4D4D] ml-2">{rating.toFixed(1)}</span>
        </div>
        
        <div className="flex gap-2">
          {onViewDetails && (
            <Button 
              variant="secondary" 
              size="md" 
              onClick={onViewDetails} 
              className="flex-1"
            >
              <Eye size={16} className="mr-2" />
              Көру
            </Button>
          )}
          <Button 
            variant="primary" 
            size="md" 
            onClick={onBook} 
            className="flex-1"
            disabled={isUnavailable}
            title={isUnavailable ? statusText : ''}
          >
            {isUnavailable ? 'Брондау мүмкін емес' : 'Брондау'}
          </Button>
        </div>
      </div>
    </div>
  );
}
