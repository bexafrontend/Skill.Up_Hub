'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Home, FileText, Trophy, User, LogOut, Heart, Bookmark, Phone,
  Star, Clock, TrendingUp, Briefcase, ChevronRight, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UserProfile, JobPost } from '@/types';

type NavTab = 'home' | 'elonlar' | 'reyting' | 'profil';

export default function WorkerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const userId = (session?.user as any)?.id;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`/api/users?userId=${userId}`);
    const data = await res.json();
    if (!data.user) { router.push('/onboarding'); return; }
    if (data.user.role !== 'worker') { router.push(`/dashboard/${data.user.role}`); return; }
    setProfile(data.user);
  }, [userId, router]);

  const fetchJobs = useCallback(async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data.jobs || []);
    setIsLoading(false);
  }, []);

  const fetchTopWorkers = useCallback(async () => {
    const res = await fetch('/api/workers');
    const data = await res.json();
    setTopWorkers(data.workers || []);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && userId) {
      fetchProfile();
      fetchJobs();
      fetchTopWorkers();
    }
  }, [status, userId, fetchProfile, fetchJobs, fetchTopWorkers, router]);

  const handleLike = async (jobId: string) => {
    if (!userId) return;
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like', userId }),
    });
    const data = await res.json();
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const likedBy = data.liked
          ? [...(j.likedBy || []), userId]
          : (j.likedBy || []).filter((id: string) => id !== userId);
        return { ...j, likes: likedBy.length, likedBy };
      })
    );
    setProfile((prev) => {
      if (!prev) return prev;
      const likedJobs = data.liked
        ? [...(prev.likedJobs || []), jobId]
        : (prev.likedJobs || []).filter((id) => id !== jobId);
      return { ...prev, likedJobs };
    });
    toast(data.liked ? '❤️ Liked!' : 'Like olib tashlandi');
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} kun oldin`;
    if (hours > 0) return `${hours} soat oldin`;
    return 'Hozirgina';
  };

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff < 0) return "Muddati o'tgan";
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} kun`;
    return `${hours} soat`;
  };

  const filteredJobs = jobs.filter((j) =>
    !searchQuery ||
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const likedJobs = jobs.filter((j) => (profile?.likedJobs || []).includes(j.id));

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'elonlar', label: "E'lonlar", icon: FileText },
    { id: 'reyting', label: 'Reyting', icon: Trophy },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0f172a' }}>
      {/* Top Header */}
      <header
        style={{
          background: 'rgba(30,41,59,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #334155',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Briefcase size={16} color="white" />
            </div>
            <span className="font-bold text-white">SkillUp Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge">Ishchi</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 rounded-lg"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="fade-in">
            {/* Welcome */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">
                Salom, {profile?.firstName}! 👋
              </h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: 4 }}>
                Bugun {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "E'lonlar", value: jobs.length, color: '#6366f1', icon: FileText },
                { label: "Liklarim", value: profile?.likedJobs?.length || 0, color: '#ef4444', icon: Heart },
                { label: "Reytingim", value: `${profile?.totalRating || 0}★`, color: '#f59e0b', icon: Star },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Jobs Feed */}
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} style={{ color: '#6366f1' }} />
              So'nggi e'lonlar
            </h2>
            <JobsFeed
              jobs={filteredJobs.slice(0, 5)}
              userId={userId}
              profile={profile}
              onLike={handleLike}
              formatTimeAgo={formatTimeAgo}
              formatTimeLeft={formatTimeLeft}
            />
          </div>
        )}

        {/* ELONLAR TAB */}
        {activeTab === 'elonlar' && (
          <div className="fade-in">
            <div className="mb-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                <input
                  className="input-field pl-10"
                  placeholder="E'lon qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <p className="text-sm mb-4" style={{ color: '#64748b' }}>
              {filteredJobs.length} ta e'lon topildi
            </p>

            <JobsFeed
              jobs={filteredJobs}
              userId={userId}
              profile={profile}
              onLike={handleLike}
              formatTimeAgo={formatTimeAgo}
              formatTimeLeft={formatTimeLeft}
            />
          </div>
        )}

        {/* REYTING TAB */}
        {activeTab === 'reyting' && (
          <div className="fade-in">
            <h2 className="font-bold text-white mb-6 flex items-center gap-2 text-xl">
              <Trophy size={22} style={{ color: '#f59e0b' }} />
              Top Ishchilar Reytingi
            </h2>

            {topWorkers.length === 0 ? (
              <div className="card p-12 text-center">
                <Trophy size={40} style={{ color: '#334155', margin: '0 auto 12px' }} />
                <p style={{ color: '#475569' }}>Hali reyting yo'q</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topWorkers.map((worker, i) => {
                  const avgRating = worker.ratingCount > 0
                    ? (worker.totalRating / worker.ratingCount).toFixed(1)
                    : '0.0';
                  return (
                    <div
                      key={worker.id}
                      className="card p-4 flex items-center gap-4"
                      style={{
                        border: i === 0 ? '1px solid rgba(245,158,11,0.4)' : undefined,
                        background: i === 0 ? 'rgba(245,158,11,0.05)' : undefined,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                        style={{
                          background: ['linear-gradient(135deg,#f59e0b,#d97706)', 'linear-gradient(135deg,#94a3b8,#64748b)', 'linear-gradient(135deg,#cd7c2f,#92400e)'][i] || 'rgba(99,102,241,0.15)',
                          color: i < 3 ? 'white' : '#6366f1',
                        }}
                      >
                        {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                      </div>

                      <img
                        src={worker.avatar || `https://ui-avatars.com/api/?name=${worker.firstName}+${worker.lastName}&background=6366f1&color=fff`}
                        alt="avatar"
                        className="w-10 h-10 rounded-xl object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">
                          {worker.firstName} {worker.lastName}
                          {worker.id === userId && <span className="ml-2 text-xs" style={{ color: '#6366f1' }}>(Siz)</span>}
                        </div>
                        <div className="text-sm" style={{ color: '#64748b' }}>{worker.workField}</div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold" style={{ color: '#f59e0b' }}>
                          ⭐ {worker.totalRating}
                        </div>
                        <div className="text-xs" style={{ color: '#64748b' }}>
                          avg {avgRating} ({worker.ratingCount})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Top liked posts */}
            <h2 className="font-bold text-white mt-8 mb-4 flex items-center gap-2 text-xl">
              <Heart size={20} style={{ color: '#ef4444' }} />
              Eng Ko'p Liked E'lonlar
            </h2>
            <div className="space-y-3">
              {[...jobs].sort((a, b) => b.likes - a.likes).slice(0, 5).map((job) => (
                <div key={job.id} className="card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{job.title}</div>
                    <div className="text-sm" style={{ color: '#64748b' }}>{job.companyName}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#ef4444' }}>
                    <Heart size={14} fill="#ef4444" /> {job.likes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFIL TAB */}
        {activeTab === 'profil' && profile && (
          <div className="fade-in">
            {/* Profile Card */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={session?.user?.image || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=6366f1&color=fff&size=80`}
                  alt="avatar"
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <div className="badge mt-1">{profile.workField}</div>
                  <div className="text-sm mt-1" style={{ color: '#64748b' }}>{session?.user?.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Jami reyting", value: profile.totalRating || 0, color: '#f59e0b' },
                  { label: "Baholar soni", value: profile.ratingCount || 0, color: '#6366f1' },
                  { label: "Liked e'lonlar", value: profile.likedJobs?.length || 0, color: '#ef4444' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Stars */}
            {(profile.ratingCount || 0) > 0 && (
              <div className="card p-4 mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>O'rtacha reyting</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={20}
                        fill={s <= Math.round((profile.totalRating || 0) / (profile.ratingCount || 1)) ? '#f59e0b' : 'none'}
                        style={{ color: s <= Math.round((profile.totalRating || 0) / (profile.ratingCount || 1)) ? '#f59e0b' : '#334155' }}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-white">
                    {((profile.totalRating || 0) / (profile.ratingCount || 1)).toFixed(1)}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>
                    ({profile.ratingCount} baho)
                  </span>
                </div>
              </div>
            )}

            {/* To'lov kartasi */}
            <div className="card p-4 mb-4">
              <p className="font-medium text-white mb-3 flex items-center gap-2">
                💳 To'lov kartasi
              </p>
              {profile.cardNumber ? (
                <div>
                  <p className="font-mono font-bold text-white tracking-wider">{profile.cardNumber}</p>
                  <p style={{ color: '#64748b', fontSize: '13px' }}>{profile.cardHolderName}</p>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Karta ma'lumotlari kiritilmagan
                </p>
              )}
            </div>

            {/* Portfolio */}
            <div className="card p-4 mb-4">
              <p className="font-medium text-white mb-3">Portfolio</p>
              {!profile.hasPortfolio ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>Portfolio mavjud emas</p>
              ) : profile.portfolioImages && profile.portfolioImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profile.portfolioImages.map((img, i) => (
                    <img key={i} src={img} alt={`Portfolio ${i+1}`} className="w-full h-24 object-cover rounded-xl" />
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px' }}>Rasm yuklanmagan</p>
              )}
            </div>

            {/* Liked Posts */}
            <div className="card p-4">
              <p className="font-medium text-white mb-3 flex items-center gap-2">
                <Heart size={16} style={{ color: '#ef4444' }} />
                Yoqtirgan e'lonlarim
              </p>
              {likedJobs.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>Hali like qilingan e'lon yo'q</p>
              ) : (
                <div className="space-y-2">
                  {likedJobs.map((job) => (
                    <div key={job.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #1e293b' }}>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{job.title}</div>
                        <div className="text-xs" style={{ color: '#64748b' }}>{job.companyName}</div>
                      </div>
                      <span className="badge text-xs">{job.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid #334155',
          padding: '8px 0 env(safe-area-inset-bottom)',
          zIndex: 100,
        }}
      >
        <div className="max-w-2xl mx-auto flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as NavTab)}
              className="flex-1 flex flex-col items-center gap-1 py-2 transition-all"
              style={{ color: activeTab === item.id ? '#6366f1' : '#475569' }}
            >
              <item.icon size={20} />
              <span style={{ fontSize: '10px', fontWeight: activeTab === item.id ? 700 : 500 }}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="w-1 h-1 rounded-full" style={{ background: '#6366f1' }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function JobsFeed({ jobs, userId, profile, onLike, formatTimeAgo, formatTimeLeft }: {
  jobs: JobPost[];
  userId: string;
  profile: UserProfile | null;
  onLike: (id: string) => void;
  formatTimeAgo: (d: string) => string;
  formatTimeLeft: (d: string) => string;
}) {
  const CATEGORY_COLORS: Record<string, string> = {
    'Dasturchi': '#6366f1',
    'Designer': '#ec4899',
    'Video Editor': '#8b5cf6',
    'Mobile Developer': '#06b6d4',
    'Marketing': '#f59e0b',
    'Writer': '#10b981',
    'Other': '#64748b',
  };

  if (jobs.length === 0) {
    return (
      <div className="card p-12 text-center">
        <FileText size={40} style={{ color: '#334155', margin: '0 auto 12px' }} />
        <p style={{ color: '#475569' }}>E'lonlar yo'q</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const isLiked = (profile?.likedJobs || []).includes(job.id);
        const catColor = CATEGORY_COLORS[job.category] || '#64748b';
        const timeLeft = formatTimeLeft(job.expiresAt);
        const isExpiringSoon = new Date(job.expiresAt).getTime() - Date.now() < 86400000;

        return (
          <div key={job.id} className="card card-hover p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: `${catColor}30`, border: `1px solid ${catColor}50` }}
                >
                  {job.companyName[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{job.companyName}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{formatTimeAgo(job.createdAt)}</div>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0"
                style={{ background: `${catColor}20`, color: catColor }}
              >
                {job.category}
              </span>
            </div>

            {/* Content */}
            <h3 className="font-bold text-white mb-2">{job.title}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: '#94a3b8' }}>
              {job.description.slice(0, 120)}{job.description.length > 120 ? '...' : ''}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {job.budget && (
                <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#10b981' }}>
                  💰 {job.budget.toLocaleString()} {job.currency}
                </span>
              )}
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: isExpiringSoon ? '#f59e0b' : '#64748b' }}
              >
                <Clock size={12} />
                {timeLeft}
              </span>
              {job.averageRating > 0 && (
                <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                  <Star size={12} fill="#f59e0b" />
                  {job.averageRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid #1e293b' }}>
              <button
                onClick={() => onLike(job.id)}
                className="flex items-center gap-1.5 text-sm font-medium transition-all"
                style={{ color: isLiked ? '#ef4444' : '#64748b' }}
              >
                <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
                {job.likes}
              </button>

              <a
                href={`tel:${job.employerName}`}
                className="flex items-center gap-1.5 text-sm font-medium ml-auto px-4 py-1.5 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                <Phone size={14} />
                Bog'lanish
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
