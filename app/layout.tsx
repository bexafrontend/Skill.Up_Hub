import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'SkillUp Hub — Uzbek Freelance Platform',
  description: "O'zbekiston uchun eng yaxshi frilanserlik platformasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }} className="antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
