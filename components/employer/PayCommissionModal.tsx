'use client';

import { useState, useEffect } from 'react';
import { X, Wallet, Copy, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { JobPost } from '@/types';

interface Props {
  job: JobPost;
  employerId: string;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function PayCommissionModal({ job, employerId, onClose, onConfirmed }: Props) {
  const [adminCard, setAdminCard] = useState('4073 4200 3525 8254');
  const [adminCardHolder, setAdminCardHolder] = useState('SkillUp Hub');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/platform-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setAdminCard(d.settings.adminCardNumber);
          setAdminCardHolder(d.settings.adminCardHolder);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyCard = () => {
    navigator.clipboard.writeText(adminCard.replace(/\s/g, ''));
    setCopied(true);
    toast.success('Karta raqami nusxalandi!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_commission_paid', userId: employerId }),
      });
      if (res.ok) {
        onConfirmed();
      } else {
        toast.error('Xatolik yuz berdi');
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
      <div className="card w-full max-w-md fade-in">
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#334155' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Wallet size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h2 className="font-bold text-white">Komissiya to'lovi</h2>
              <p style={{ color: '#64748b', fontSize: '13px' }}>{job.title}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center py-2">
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: 4 }}>To'lov summasi</p>
            <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
              {job.commissionAmount?.toLocaleString()} <span className="text-lg">{job.currency}</span>
            </p>
            <p style={{ color: '#475569', fontSize: '12px', marginTop: 2 }}>
              ({job.budget?.toLocaleString()} {job.currency} ning 1%)
            </p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #334155' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#94a3b8' }}>
              Quyidagi kartaga to'lov qiling:
            </p>

            <div
              className="flex items-center justify-between p-3 rounded-lg mb-2"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <div>
                <p className="font-mono font-bold text-lg text-white tracking-wider">{adminCard}</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>{adminCardHolder}</p>
              </div>
              <button
                onClick={handleCopyCard}
                className="p-2 rounded-lg flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '12px' }}>
              Karta-kartaga o'tkazma orqali (Click, Payme yoki bank ilovangiz orqali) to'lang.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? "Tasdiqlanmoqda..." : <>To'ladim, e'lonni chop etish <ArrowRight size={16} /></>}
          </button>

          <p className="text-center" style={{ color: '#475569', fontSize: '11px' }}>
            "To'ladim" tugmasini bosish orqali to'lovni amalga oshirganingizni tasdiqlaysiz
          </p>
        </div>
      </div>
    </div>
  );
}
