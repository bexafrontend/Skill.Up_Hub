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
      // Check if user has completed onboarding
      const userId = (session.user as any).id;
      if (userId) {
        fetch(`/api/users?userId=${userId}`)
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.role) {
              router.push(`/dashboard/${data.user.role}`);
            } else {
              router.push('/onboarding');
            }
          });
      }
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
