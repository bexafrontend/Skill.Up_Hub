'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  jobId: string;
  workerId: string;
  employerId: string;
  onClose: () => void;
  onRated: () => void;
}

export default function WorkerRatingModal({ jobId, workerId, employerId, onClose, onRated }: Props) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) {
      toast.error('Baho berish uchun yulduz tanlang');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, workerId, employerId, stars }),
      });

      const data = await res.json();
      if (res.ok) {
        onRated();
      } else {
        toast.error(data.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Server xatosi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card p-8 w-full max-w-sm text-center fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
          style={{ color: '#64748b' }}
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Ishchiga baho bering</h2>
        <p className="mb-6" style={{ color: '#64748b', fontSize: '14px' }}>
          0 dan 5 gacha yulduz bering
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setStars(s)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                fill={s <= (hovered || stars) ? '#f59e0b' : 'none'}
                style={{ color: s <= (hovered || stars) ? '#f59e0b' : '#334155' }}
              />
            </button>
          ))}
        </div>

        {stars > 0 && (
          <p className="mb-4 text-sm font-medium" style={{ color: '#f59e0b' }}>
            {['', 'Yomon', "Qoniqarli emas", 'Normal', 'Yaxshi', 'Ajoyib!'][stars]}
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Bekor</button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || stars === 0}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Yuklanmoqda...' : 'Baho berish'}
          </button>
        </div>
      </div>
    </div>
  );
}
