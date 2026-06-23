'use client';

import { signIn } from 'next-auth/react';
import { GitBranch, Globe, Briefcase, Users, Star, TrendingUp, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0f172a' }}>
      {/* Header */}
      <header
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #334155',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Briefcase size={18} color="white" />
            </div>
            <span className="text-xl font-bold text-white">SkillUp Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => signIn('github')}
              className="btn-secondary flex items-center gap-2"
            >
              <GitBranch size={16} />
              GitHub
            </button>
            <button
              onClick={() => signIn('google')}
              className="btn-primary flex items-center gap-2"
            >
              <Globe size={16} />
              Google bilan kirish
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
        >
          <Zap size={14} style={{ color: '#6366f1' }} />
          <span style={{ color: '#818cf8', fontSize: '13px', fontWeight: 600 }}>
            O'zbekistonning #1 Frilanserlik Platformasi
          </span>
        </div>

        <h1 className="text-6xl font-bold mb-6 leading-tight" style={{ color: '#f8fafc' }}>
          Ish toping yoki
          <br />
          <span className="gradient-text">Mutaxassis yollang</span>
        </h1>

        <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: '#94a3b8', lineHeight: 1.7 }}>
          SkillUp Hub — dasturchilar, dizaynerlar, video muharrirlar va boshqa frilanserlarni ish beruvchilar
          bilan bog'laydigan O'zbekiston platformasi
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => signIn('google')}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
          >
            <Globe size={20} />
            Google bilan boshlash
          </button>
          <button
            onClick={() => signIn('github')}
            className="btn-secondary flex items-center gap-3 text-lg px-8 py-4"
          >
            <GitBranch size={20} />
            GitHub bilan boshlash
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
          {[
            { value: '500+', label: "Frilanserlar" },
            { value: '200+', label: "E'lonlar" },
            { value: '4.8★', label: "O'rtacha reyting" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          borderTop: '1px solid #1e293b',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            Nima uchun SkillUp Hub?
          </h2>
          <p className="text-center mb-16" style={{ color: '#64748b' }}>
            O'zbekiston uchun maxsus yaratilgan platforma
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                color: '#6366f1',
                title: "Ishonchli tizim",
                desc: "Google va GitHub orqali xavfsiz kirish",
              },
              {
                icon: Star,
                color: '#f59e0b',
                title: "Reyting tizimi",
                desc: "Ish beruvchilar frilanserlarni baholaydi",
              },
              {
                icon: TrendingUp,
                color: '#10b981',
                title: "Real vaqt yangilanishi",
                desc: "Eng yangi e'lonlarni darhol ko'ring",
              },
              {
                icon: Users,
                color: '#8b5cf6',
                title: "Portfolio",
                desc: "Ishlaringizni namoyish eting",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card card-hover p-6"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  <feature.icon size={22} style={{ color: feature.color }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#f1f5f9' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div
          className="p-12 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}
        >
          <h2 className="text-4xl font-bold mb-4 text-white">
            Bugun boshlang!
          </h2>
          <p className="mb-8 text-lg" style={{ color: '#94a3b8' }}>
            Bepul ro'yxatdan o'ting va frilanserlik dunyosiga kiriting
          </p>
          <button
            onClick={() => signIn('google')}
            className="btn-primary text-lg px-10 py-4"
          >
            Bepul boshlash →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '24px 0' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p style={{ color: '#475569', fontSize: '14px' }}>
            © 2024 SkillUp Hub. O'zbekiston uchun yaratilgan 🇺🇿
          </p>
        </div>
      </footer>
    </div>
  );
}
