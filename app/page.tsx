'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LandingPage from '@/components/shared/LandingPage';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Rol endi sessiya token'ida keshlangan (ko'ring: [...nextauth]/route.ts),
      // shuning uchun bu yerda alohida /api/users so'rovi kutish shart emas —
      // darrov yo'naltiramiz, bu "Yo'naltirilmoqda..." spinnerini qisqartiradi.
      const role = (session.user as any).role;
      router.replace(role ? `/dashboard/${role}` : '/onboarding');

      // Xavfsizlik uchun: agar biror sababdan (masalan sekin tarmoq) yo'naltirish
      // ishlamay qolsa, foydalanuvchi abadiy "Yo'naltirilmoqda..." ekranida
      // qotib qolmasligi uchun 4 soniyadan keyin majburan sahifani yangilaymiz.
      const failSafe = setTimeout(() => {
        window.location.href = role ? `/dashboard/${role}` : '/onboarding';
      }, 4000);
      return () => clearTimeout(failSafe);
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0f172a'}}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p style={{color: '#64748b'}}>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0f172a'}}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p style={{color: '#64748b'}}>Yo'naltirilmoqda...</p>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
