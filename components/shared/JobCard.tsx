'use client';

import { Heart, Clock, Star, Phone, Building2 } from 'lucide-react';
import { JobPost } from '@/types';

interface Props {
  job: JobPost;
  userId?: string;
  likedJobs?: string[];
  onLike?: (jobId: string) => void;
  showEmployerActions?: boolean;
}

export default function JobCard({ job, userId, likedJobs, onLike, showEmployerActions }: Props) {
  const isLiked = likedJobs?.includes(job.id);
  const isExpired = new Date(job.expiresAt) < new Date();

  const formatTimeLeft = () => {
    const diff = new Date(job.expiresAt).getTime() - Date.now();
    if (diff < 0) return "Muddati o'tgan";
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} kun qoldi`;
    return `${hours} soat qoldi`;
  };

  return (
    <div className={`card p-5 ${!isExpired ? 'card-hover' : ''}`} style={{ opacity: isExpired ? 0.7 : 1 }}>
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {job.companyName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{job.title}</h3>
          <div className="flex items-center gap-1 text-sm" style={{ color: '#64748b' }}>
            <Building2 size={12} />
            {job.companyName}
          </div>
        </div>
        <span className="badge">{job.category}</span>
      </div>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: '#94a3b8' }}>
        {job.description.slice(0, 150)}{job.description.length > 150 ? '...' : ''}
      </p>

      <div className="flex items-center gap-4 mb-4 flex-wrap text-sm">
        {job.budget && (
          <span style={{ color: '#10b981', fontWeight: 600 }}>
            {job.budget.toLocaleString()} {job.currency}
          </span>
        )}
        <span className="flex items-center gap-1" style={{ color: '#64748b' }}>
          <Clock size={12} />
          {formatTimeLeft()}
        </span>
        <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
          <Star size={12} fill={job.averageRating > 0 ? '#f59e0b' : 'none'} />
          {job.averageRating.toFixed(1)}
        </span>
      </div>

      {onLike && (
        <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid #1e293b' }}>
          <button
            onClick={() => onLike(job.id)}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: isLiked ? '#ef4444' : '#64748b' }}
          >
            <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
            {job.likes}
          </button>
        </div>
      )}
    </div>
  );
}
