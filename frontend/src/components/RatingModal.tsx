import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from './Button';
import { api } from '../utils/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  arenaId: string;
  arenaName: string;
  bookingId?: string;
  onRatingSubmitted?: () => void;
}

export function RatingModal({ 
  isOpen, 
  onClose, 
  arenaId, 
  arenaName,
  bookingId,
  onRatingSubmitted 
}: RatingModalProps) {
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (stars === 0) {
      setError('Рейтинг таңдаңыз');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createRating(arenaId, {
        stars,
        comment: comment.trim() || undefined,
      });
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      
      // Reset form
      setStars(0);
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Рейтинг қосу қатесі');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStars(0);
    setComment('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-md shadow-[0px_4px_24px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="border-b border-[#D9D9D9] p-6 flex items-center justify-between">
          <h2>Рейтинг беру</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="body-r text-[#4D4D4D] mb-2">{arenaName}</p>
            <p className="caption-r text-[#808080]">Бұл аренаға рейтинг беріңіз</p>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block body-s text-[#1A1A1A] mb-3">Рейтинг *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoveredStar || stars)
                        ? 'fill-[#2ECC71] text-[#2ECC71]'
                        : 'text-[#D9D9D9]'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block body-s text-[#1A1A1A] mb-2">Пікір (міндетті емес)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Пікіріңізді жазыңыз..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-[#D9D9D9] focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#EAFBF3] resize-none"
              maxLength={500}
            />
            <p className="caption-r text-[#808080] mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <p className="body-s">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Болдырмау
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={loading || stars === 0}
            >
              {loading ? 'Жіберілуде...' : 'Жіберу'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

