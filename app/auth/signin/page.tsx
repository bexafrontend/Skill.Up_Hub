'use client';

import { signIn } from 'next-auth/react';
import { GitBranch, Globe, Briefcase } from 'lucide-react';

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0f172a' }}
    >
      <div className="card p-10 w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Briefcase size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">SkillUp Hub ga xush kelibsiz</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Davom etish uchun hisobingiz bilan kiring
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #334155',
              color: '#f1f5f9',
            }}
          >
            <Globe size={20} style={{ color: '#ea4335' }} />
            Google bilan kirish
          </button>

          <button
            onClick={() => signIn('github', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #334155',
              color: '#f1f5f9',
            }}
          >
            <GitBranch size={20} />
            GitHub bilan kirish
          </button>
        </div>

        <p className="text-center mt-6" style={{ color: '#475569', fontSize: '12px' }}>
          Kirish orqali siz platformaning foydalanish shartlariga rozilik bildirasiz
        </p>
      </div>
    </div>
  );
}
