'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Briefcase, User, AlertTriangle, ChevronRight, Building2, Phone, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { JobCategory } from '@/types';

const JOB_CATEGORIES: JobCategory[] = [
  'Dasturchi',
  'Designer',
  'Video Editor',
  'Mobile Developer',
  'Marketing',
  'Writer',
  'Other',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Dasturchi': '💻',
  'Designer': '🎨',
  'Video Editor': '🎬',
  'Mobile Developer': '📱',
  'Marketing': '📊',
  'Writer': '✍️',
  'Other': '⚡',
};

type Step = 'basic' | 'role' | 'employer-setup' | 'worker-setup' | 'blocked';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<Step>('basic');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<'employer' | 'worker' | null>(null);

  // Employer fields
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyCategories, setCompanyCategories] = useState<JobCategory[]>([]);

  // Worker fields
  const [workField, setWorkField] = useState<JobCategory | ''>('');
  const [hasPortfolio, setHasPortfolio] = useState(true);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const handleBasicSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !age) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    if (parseInt(age) < 12) {
      setStep('blocked');
      return;
    }
    setStep('role');
  };

  const handleRoleSelect = (selectedRole: 'employer' | 'worker') => {
    setRole(selectedRole);
    setStep(selectedRole === 'employer' ? 'employer-setup' : 'worker-setup');
  };

  const toggleCategory = (cat: JobCategory) => {
    setCompanyCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPortfolioImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFinish = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    setIsLoading(true);
    try {
      const payload: any = {
        userId,
        email: session?.user?.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: parseInt(age),
        role,
        avatar: session?.user?.image || null,
        createdAt: new Date().toISOString(),
        totalRating: 0,
        ratingCount: 0,
        likedJobs: [],
      };

      if (role === 'employer') {
        if (!companyName.trim() || !companyPhone.trim()) {
          toast.error("Kompaniya ma'lumotlarini kiriting");
          setIsLoading(false);
          return;
        }
        payload.companyName = companyName.trim();
        payload.companyPhone = companyPhone.trim();
        payload.companyCategories = companyCategories;
      } else {
        if (!workField) {
          toast.error("Ish sohasini tanlang");
          setIsLoading(false);
          return;
        }
        if (!cardNumber.trim() || !cardHolderName.trim()) {
          toast.error("To'lov olish uchun karta ma'lumotlarini kiriting");
          setIsLoading(false);
          return;
        }
        payload.workField = workField;
        payload.hasPortfolio = hasPortfolio;
        payload.portfolioImages = hasPortfolio ? portfolioImages : [];
        payload.cardNumber = cardNumber.trim();
        payload.cardHolderName = cardHolderName.trim();
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Profil muvaffaqiyatli yaratildi! 🎉");
        router.push(`/dashboard/${role}`);
      } else {
        toast.error("Xatolik yuz berdi, qayta urinib ko'ring");
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f172a' }}>
      <div className="w-full max-w-lg">
        {/* Step: Blocked */}
        {step === 'blocked' && (
          <div className="card p-10 text-center fade-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <AlertTriangle size={32} style={{ color: '#ef4444' }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Kirish mumkin emas</h2>
            <p className="text-lg" style={{ color: '#94a3b8' }}>
              Kechirasiz, siz 12 yoshdan kichik ekansiz
            </p>
            <p className="mt-2" style={{ color: '#64748b', fontSize: '14px' }}>
              SkillUp Hub faqat 12 va undan katta yoshdagilar uchun mo'ljallangan
            </p>
          </div>
        )}

        {/* Step: Basic Info */}
        {step === 'basic' && (
          <div className="card p-8 fade-in">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <User size={22} color="white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Profilingizni yarating</h2>
              <p className="mt-1" style={{ color: '#64748b', fontSize: '14px' }}>
                Boshlash uchun ma'lumotlaringizni kiriting
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Ism</label>
                <input
                  className="input-field"
                  placeholder="Ismingizni kiriting"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Familiya</label>
                <input
                  className="input-field"
                  placeholder="Familiyangizni kiriting"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Yosh</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Yoshingizni kiriting"
                  min="1"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <button onClick={handleBasicSubmit} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                Davom etish <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step: Role */}
        {step === 'role' && (
          <div className="card p-8 fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Salom, {firstName}! 👋
              </h2>
              <p style={{ color: '#64748b' }}>Platformada qanday rolda bo'lasiz?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect('employer')}
                className="p-6 rounded-2xl text-center transition-all card-hover"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                <div className="text-4xl mb-3">🏢</div>
                <div className="font-bold text-white mb-1">Ish beruvchi</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  Frilanser yollayman
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('worker')}
                className="p-6 rounded-2xl text-center transition-all card-hover"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <div className="text-4xl mb-3">💼</div>
                <div className="font-bold text-white mb-1">Ishchi</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  Ish qidiraman
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Employer Setup */}
        {step === 'employer-setup' && (
          <div className="card p-8 fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Building2 size={20} style={{ color: '#6366f1' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Kompaniya ma'lumotlari</h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Ish e'lon qilish uchun</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Kompaniya nomi</label>
                <input
                  className="input-field"
                  placeholder="Kompaniya nomini kiriting"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>Telefon raqam</label>
                <input
                  className="input-field"
                  placeholder="+998 90 123 45 67"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#94a3b8' }}>
                  Soha (bir nechtasini tanlash mumkin)
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: companyCategories.includes(cat) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${companyCategories.includes(cat) ? '#6366f1' : '#334155'}`,
                        color: companyCategories.includes(cat) ? '#818cf8' : '#94a3b8',
                      }}
                    >
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="btn-primary w-full mt-2"
              >
                {isLoading ? 'Saqlanmoqda...' : "Boshlash →"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Worker Setup */}
        {step === 'worker-setup' && (
          <div className="card p-8 fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <User size={20} style={{ color: '#10b981' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ishchi profili</h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>Portfolio va soha</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#94a3b8' }}>Ish sohangiz</label>
                <div className="grid grid-cols-2 gap-2">
                  {JOB_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setWorkField(cat)}
                      className="p-3 rounded-xl text-sm font-medium text-left transition-all"
                      style={{
                        background: workField === cat ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${workField === cat ? '#10b981' : '#334155'}`,
                        color: workField === cat ? '#34d399' : '#94a3b8',
                      }}
                    >
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium" style={{ color: '#94a3b8' }}>Portfolio rasmlari</label>
                  <button
                    onClick={() => setHasPortfolio(!hasPortfolio)}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: hasPortfolio ? '#10b981' : '#64748b' }}
                  >
                    {hasPortfolio ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    {hasPortfolio ? 'Bor' : "Menda portfolio yo'q"}
                  </button>
                </div>

                {hasPortfolio && (
                  <div>
                    <label
                      className="flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all"
                      style={{
                        border: '2px dashed #334155',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <ImageIcon size={28} style={{ color: '#475569', marginBottom: 8 }} />
                      <span style={{ color: '#64748b', fontSize: '14px' }}>Rasm yuklash uchun bosing</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    {portfolioImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {portfolioImages.map((img, i) => (
                          <div key={i} className="relative">
                            <img
                              src={img}
                              alt={`Portfolio ${i + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setPortfolioImages((prev) => prev.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                              style={{ background: '#ef4444', color: 'white' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <p className="text-sm font-medium" style={{ color: '#34d399' }}>
                  💳 To'lov olish uchun karta ma'lumotlari
                </p>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: -8 }}>
                  Ish beruvchilar to'lovni shu kartaga to'g'ridan-to'g'ri o'tkazadi
                </p>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                    Karta raqami
                  </label>
                  <input
                    className="input-field"
                    placeholder="8600 1234 5678 9012"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                    Karta egasi (F.I.Sh.)
                  </label>
                  <input
                    className="input-field"
                    placeholder="ISMINGIZ FAMILIYANGIZ"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="btn-primary w-full mt-2"
              >
                {isLoading ? 'Saqlanmoqda...' : "Dashboardga o'tish →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
