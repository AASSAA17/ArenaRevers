import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Eye, Share2, Calendar } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { ArenaCard } from './ArenaCard';
import { api } from '../utils/api';
import { ArenaDetailsModal } from './ArenaDetailsModal';

interface Favorite {
  id: string;
  arena: {
    id: string;
    title: string;
    address: string;
    pricePerHour: number;
    sportType: string;
    latitude?: number;
    longitude?: number;
    images: Array<{ id: string; url: string }>;
    avgRating: number;
  };
  createdAt: string;
}

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getFavorites();
      setFavorites(response.favorites || []);
    } catch (err: any) {
      setError(err.message || 'Таңдаулыларды жүктеу қатесі');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (arenaId: string) => {
    try {
      await api.removeFavorite(arenaId);
      setFavorites(favorites.filter(fav => fav.arena.id !== arenaId));
    } catch (err: any) {
      setError(err.message || 'Таңдаулыдан алып тастау қатесі');
    }
  };

  const handleViewDetails = (arenaId: string) => {
    setSelectedArenaId(arenaId);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="body-r text-[#808080]">Жүктелуде...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Таңдаулы ареналар</h1>
          <p className="body-r text-[#808080]">
            Сіз сақтаған ареналар ({favorites.length})
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="body-s">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={48} className="text-[#D9D9D9]" />
              </div>
              <h3 className="mb-2">Таңдаулылар жоқ</h3>
              <p className="body-r text-[#808080] mb-6 max-w-md mx-auto">
                Сіз әлі таңдаулыларға арена қосмадыңыз. Ареналарды көріп, сізге ұнағандарын таңдаулыларға қосыңыз.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.hash = 'home'}
              >
                Ареналарды көру
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative">
                <ArenaCard
                  id={favorite.arena.id}
                  image={favorite.arena.images?.[0]?.url || ''}
                  title={favorite.arena.title}
                  location={favorite.arena.address}
                  price={Number(favorite.arena.pricePerHour)}
                  rating={favorite.arena.avgRating || 0}
                  latitude={favorite.arena.latitude ? Number(favorite.arena.latitude) : undefined}
                  longitude={favorite.arena.longitude ? Number(favorite.arena.longitude) : undefined}
                  isFavorite={true}
                  onFavoriteChange={(isFav) => {
                    if (!isFav) {
                      handleRemoveFavorite(favorite.arena.id);
                    }
                  }}
                  onViewDetails={() => handleViewDetails(favorite.arena.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arena Details Modal */}
      {selectedArenaId && (
        <ArenaDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedArenaId(null);
          }}
          arenaId={selectedArenaId}
          onBook={() => {
            setIsDetailsModalOpen(false);
            setSelectedArenaId(null);
            window.location.hash = 'home';
          }}
        />
      )}
    </div>
  );
}

