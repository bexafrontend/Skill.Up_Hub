'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, Star, Clock, Heart, Trash2, LogOut, Building2, Bell, Wallet, DollarSign } from 'lucide-react';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { UserProfile, JobPost, JobCategory } from '@/types';
import CreateJobModal from '@/components/employer/CreateJobModal';
import JobCard from '@/components/shared/JobCard';
import WorkerRatingModal from '@/components/employer/WorkerRatingModal';
import PayCommissionModal from '@/components/employer/PayCommissionModal';

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'workers'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{ jobId: string; workerId: string } | null>(null);
  const [payCommissionJob, setPayCommissionJob] = useState<JobPost | null>(null);

  const userId = (session?.user as any)?.id;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`/api/users?userId=${userId}`);
    const data = await res.json();
    if (!data.user) {
      router.push('/onboarding');
      return;
    }
    if (data.user.role !== 'employer') {
      router.push(`/dashboard/${data.user.role}`);
      return;
    }
    setProfile(data.user);
  }, [userId, router]);

  const fetchJobs = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`/api/jobs?employerId=${userId}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && userId) {
      fetchProfile();
      fetchJobs();
    }
  }, [status, userId, fetchProfile, fetchJobs, router]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Bu e'lonni o'chirmoqchimisiz?")) return;
    await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
    toast.success("E'lon o'chirildi");
    fetchJobs();
  };

  const handleJobCreated = () => {
    setShowCreateModal(false);
    fetchJobs();
    toast.success("E'lon muvaffaqiyatli joylashtirildi! 🎉");
  };

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff < 0) return "Muddati o'tgan";
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} kun qoldi`;
    if (hours > 0) return `${hours} soat qoldi`;
    return 'Tez orada tugaydi';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Navbar */}
      <nav
        style={{
          background: 'rgba(30,41,59,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #334155',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Briefcase size={18} color="white" />
            </div>
            <span className="text-xl font-bold text-white">SkillUp Hub</span>
            <span className="badge ml-2">Ish beruvchi</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={session?.user?.image || `https://ui-avatars.com/api/?name=${profile?.firstName}`}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{profile?.firstName} {profile?.lastName}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{profile?.companyName}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
            >
              <LogOut size={16} />
              Chiqish
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-8 mb-8"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Xush kelibsiz, {profile?.firstName}! 👋
              </h1>
              <p style={{ color: '#94a3b8' }}>
                <Building2 size={14} className="inline mr-1" />
                {profile?.companyName} · {profile?.companyPhone}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Yangi e'lon
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            {[
              { label: "Jami e'lonlar", value: jobs.length, icon: Briefcase, color: '#6366f1' },
              { label: "Faol e'lonlar", value: jobs.filter(j => new Date(j.expiresAt) > new Date()).length, icon: Clock, color: '#10b981' },
              { label: "Jami liklar", value: jobs.reduce((s, j) => s + j.likes, 0), icon: Heart, color: '#ef4444' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: '#64748b' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 12, border: '1px solid #334155', width: 'fit-content' }}>
          {[
            { id: 'posts', label: "Mening e'lonlarim" },
            { id: 'workers', label: "Top ishchilar" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: activeTab === tab.id ? '#818cf8' : '#64748b',
                border: activeTab === tab.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* My Posts */}
        {activeTab === 'posts' && (
          <div>
            {jobs.length === 0 ? (
              <div className="card p-16 text-center">
                <Briefcase size={48} style={{ color: '#334155', margin: '0 auto 16px' }} />
                <p className="text-lg font-medium" style={{ color: '#475569' }}>
                  Hali e'lonlar yo'q
                </p>
                <p className="mb-6" style={{ color: '#334155', fontSize: '14px' }}>
                  Birinchi e'loningizni joylashtiring
                </p>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                  <Plus size={16} className="inline mr-2" />
                  E'lon yaratish
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job: any) => {
                  const isExpired = new Date(job.expiresAt) < new Date();
                  const pendingCommission = job.budget && !job.commissionPaid;
                  return (
                    <div
                      key={job.id}
                      className="card p-6"
                      style={{
                        opacity: isExpired ? 0.6 : 1,
                        border: pendingCommission ? '1px solid rgba(245,158,11,0.4)' : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-bold text-white text-lg">{job.title}</h3>
                            {pendingCommission ? (
                              <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                To'lov kutilmoqda
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                                Muddati o'tgan
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                Faol
                              </span>
                            )}
                            <span className="badge">{job.category}</span>
                          </div>
                          <p className="mb-4 text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                            {job.description.slice(0, 150)}{job.description.length > 150 ? '...' : ''}
                          </p>

                          {pendingCommission && (
                            <div
                              className="mb-4 p-3 rounded-lg flex items-center justify-between flex-wrap gap-2"
                              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
                            >
                              <span style={{ color: '#fbbf24', fontSize: '13px' }}>
                                Komissiya: {job.commissionAmount?.toLocaleString()} {job.currency} to'lanmagan
                              </span>
                              <button
                                onClick={() => setPayCommissionJob(job)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{ background: '#f59e0b', color: '#000' }}
                              >
                                Hozir to'lash
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-6 text-sm" style={{ color: '#64748b' }}>
                            <span className="flex items-center gap-1">
                              <Heart size={14} style={{ color: '#ef4444' }} />
                              {job.likes} like
                            </span>
                            <span className="flex items-center gap-1">
                              <Star size={14} style={{ color: '#f59e0b' }} />
                              {job.averageRating.toFixed(1)} / 5
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatTimeLeft(job.expiresAt)}
                            </span>
                            {job.budget && (
                              <span className="font-semibold" style={{ color: '#10b981' }}>
                                {job.budget.toLocaleString()} {job.currency}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 rounded-lg transition-all"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Rating stars display */}
                      <div className="flex mt-3 gap-1">
                        {[1,2,3,4,5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= Math.round(job.averageRating) ? '#f59e0b' : 'none'}
                            style={{ color: star <= Math.round(job.averageRating) ? '#f59e0b' : '#334155' }}
                          />
                        ))}
                        <span className="text-xs ml-1" style={{ color: '#64748b' }}>
                          ({job.ratingCount} baho)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Top Workers */}
        {activeTab === 'workers' && (
          <TopWorkers
            onRate={(jobId, workerId) => setRatingModal({ jobId, workerId })}
          />
        )}
      </div>

      {showCreateModal && profile && (
        <CreateJobModal
          employerId={userId}
          employerName={`${profile.firstName} ${profile.lastName}`}
          companyName={profile.companyName || ''}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleJobCreated}
        />
      )}

      {ratingModal && (
        <WorkerRatingModal
          jobId={ratingModal.jobId}
          workerId={ratingModal.workerId}
          employerId={userId}
          onClose={() => setRatingModal(null)}
          onRated={() => {
            setRatingModal(null);
            toast.success('Baho berildi!');
          }}
        />
      )}

      {payCommissionJob && (
        <PayCommissionModal
          job={payCommissionJob}
          employerId={userId}
          onClose={() => setPayCommissionJob(null)}
          onConfirmed={() => {
            setPayCommissionJob(null);
            fetchJobs();
            toast.success("To'lov tasdiqlandi! E'lon chop etildi 🎉");
          }}
        />
      )}
    </div>
  );
}

function TopWorkers({ onRate }: { onRate: (jobId: string, workerId: string) => void }) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [showCard, setShowCard] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/workers')
      .then(r => r.json())
      .then(d => setWorkers(d.workers || []));
  }, []);

  if (workers.length === 0) {
    return (
      <div className="card p-16 text-center">
        <p style={{ color: '#475569' }}>Hali ishchilar ro'yxatga olinmagan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workers.map((worker, i) => (
        <div key={worker.id} className="card card-hover p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={worker.avatar || `https://ui-avatars.com/api/?name=${worker.firstName}+${worker.lastName}&background=6366f1&color=fff`}
                alt="avatar"
                className="w-12 h-12 rounded-xl object-cover"
              />
              {i < 3 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: ['#f59e0b', '#94a3b8', '#cd7c2f'][i], color: 'white' }}>
                  {i + 1}
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-white">{worker.firstName} {worker.lastName}</div>
              <div className="text-sm" style={{ color: '#6366f1' }}>{worker.workField}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-4">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={14}
                fill={s <= Math.round((worker.totalRating / (worker.ratingCount || 1))) ? '#f59e0b' : 'none'}
                style={{ color: s <= Math.round((worker.totalRating / (worker.ratingCount || 1))) ? '#f59e0b' : '#334155' }} />
            ))}
            <span className="text-xs ml-1" style={{ color: '#64748b' }}>
              {worker.totalRating} ball ({worker.ratingCount} baho)
            </span>
          </div>

          {worker.portfolioImages?.length > 0 && (
            <div className="flex gap-1 mb-4">
              {worker.portfolioImages.slice(0, 3).map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-14 h-14 object-cover rounded-lg" />
              ))}
            </div>
          )}

          {worker.cardNumber && (
            <button
              onClick={() => setShowCard(showCard === worker.id ? null : worker.id)}
              className="w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg font-medium transition-all"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <DollarSign size={14} />
              {showCard === worker.id ? 'Kartani yashirish' : "To'lov karta raqami"}
            </button>
          )}

          {showCard === worker.id && worker.cardNumber && (
            <div className="mt-2 p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #334155' }}>
              <p className="font-mono font-bold text-white tracking-wider">{worker.cardNumber}</p>
              <p style={{ color: '#64748b', fontSize: '12px' }}>{worker.cardHolderName}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
