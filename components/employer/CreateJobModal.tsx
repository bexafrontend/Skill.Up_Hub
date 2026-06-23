'use client';

import { useState, useEffect } from 'react';
import { X, Briefcase, Wallet, Copy, Check, ArrowRight, Info } from 'lucide-react';
import { JobCategory } from '@/types';
import toast from 'react-hot-toast';

const JOB_CATEGORIES: JobCategory[] = [
  'Dasturchi', 'Designer', 'Video Editor', 'Mobile Developer', 'Marketing', 'Writer', 'Other',
];

const COMMISSION_RATE = 0.01;

interface Props {
  employerId: string;
  employerName: string;
  companyName: string;
  onClose: () => void;
  onCreated: () => void;
}

type Step = 'form' | 'payment';

export default function CreateJobModal({ employerId, employerName, companyName, onClose, onCreated }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<JobCategory>('Dasturchi');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('UZS');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [adminCard, setAdminCard] = useState('4073 4200 3525 8254');
  const [adminCardHolder, setAdminCardHolder] = useState('SkillUp Hub');
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const minDeadline = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
  const numBudget = parseFloat(budget) || 0;
  const hasBudget = numBudget > 0;
  const commission = Math.round(numBudget * COMMISSION_RATE);

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

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !deadline) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    if (new Date(deadline) <= new Date()) {
      toast.error("Muddat kelajakda bo'lishi kerak");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId,
          employerName,
          companyName,
          title: title.trim(),
          description: description.trim(),
          category,
          budget: budget ? parseInt(budget) : null,
          currency,
          deadline,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Xatolik yuz berdi');
        setIsLoading(false);
        return;
      }

      if (hasBudget) {
        setCreatedJobId(data.id);
        setStep('payment');
      } else {
        onCreated();
      }
    } catch {
      toast.error('Server xatosi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(adminCard.replace(/\s/g, ''));
    setCopied(true);
    toast.success('Karta raqami nusxalandi!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPaid = async () => {
    if (!createdJobId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/jobs/${createdJobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_commission_paid', userId: employerId }),
      });
      if (res.ok) {
        toast.success("To'lov tasdiqlandi! E'lon chop etildi 🎉");
        onCreated();
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
      onClick={(e) => e.target === e.currentTarget && step === 'form' && onClose()}
    >
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        <div className="p-6 border-b" style={{ borderColor: '#334155' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: step === 'payment' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)' }}
              >
                {step === 'payment' ? (
                  <Wallet size={20} style={{ color: '#10b981' }} />
                ) : (
                  <Briefcase size={20} style={{ color: '#6366f1' }} />
                )}
              </div>
              <div>
                <h2 className="font-bold text-white">
                  {step === 'form' ? "Yangi e'lon" : "Komissiya to'lovi"}
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>{companyName}</p>
              </div>
            </div>
            {step === 'form' && (
              <button onClick={onClose} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {step === 'form' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                E'lon sarlavhasi *
              </label>
              <input
                className="input-field"
                placeholder="Masalan: React Developer kerak"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Tavsif *
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Loyiha haqida batafsil ma'lumot kiriting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Kategoriya</label>
              <div className="flex flex-wrap gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: category === cat ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${category === cat ? '#6366f1' : '#334155'}`,
                      color: category === cat ? '#818cf8' : '#94a3b8',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                  Byudjet (ixtiyoriy)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Miqdor"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Valyuta</label>
                <select
                  className="input-field"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="UZS">UZS (so'm)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            {hasBudget && (
              <div
                className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <div className="flex items-start gap-2">
                  <Info size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: '#fbbf24', fontSize: '13px', lineHeight: 1.5 }}>
                    Byudjetli e'lonlar uchun platforma komissiyasi (1%) oldindan to'lanadi.
                    To'lovdan keyin e'lon darhol chop etiladi.
                  </p>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span style={{ color: '#64748b' }}>To'lash kerak bo'lgan komissiya</span>
                  <span className="font-bold" style={{ color: '#f59e0b' }}>
                    {commission.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Muddat (amal qilish vaqti) *
              </label>
              <input
                className="input-field"
                type="datetime-local"
                min={minDeadline}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="mt-1 text-xs" style={{ color: '#475569' }}>
                Bu sanadan keyin e'lon avtomatik o'chiriladi
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-secondary flex-1">
                Bekor qilish
              </button>
              <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1">
                {isLoading
                  ? 'Yuklanmoqda...'
                  : hasBudget
                  ? <span className="flex items-center justify-center gap-2">Davom etish <ArrowRight size={16} /></span>
                  : "E'lon qilish"}
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="p-6 space-y-5">
            <div
              className="p-4 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
            >
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>
                E'loningiz saqlandi! Uni chop etish uchun quyidagi komissiyani to'lang.
                To'lov tasdiqlangandan so'ng e'lon barcha ishchilarga ko'rinadi.
              </p>
            </div>

            <div className="text-center py-2">
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: 4 }}>To'lov summasi</p>
              <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                {commission.toLocaleString()} <span className="text-lg">{currency}</span>
              </p>
              <p style={{ color: '#475569', fontSize: '12px', marginTop: 2 }}>
                ({numBudget.toLocaleString()} {currency} ning 1%)
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
              onClick={handleConfirmPaid}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? "Tasdiqlanmoqda..." : <>To'ladim, e'lonni chop etish <ArrowRight size={16} /></>}
            </button>

            <p className="text-center" style={{ color: '#475569', fontSize: '11px' }}>
              "To'ladim" tugmasini bosish orqali to'lovni amalga oshirganingizni tasdiqlaysiz
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
