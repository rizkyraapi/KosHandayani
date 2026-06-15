'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EmailVerificationSuccessPage() {
  const { t } = useLanguage();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#f9f9ff',
        color: '#111c2d',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 18px 50px rgba(17,28,45,0.08)',
          border: '1px solid rgba(188,203,185,0.2)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: '#dcfce7',
            color: '#006e2f',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 34 }}>verified</span>
        </div>
        <h1 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 900 }}>
          {t('emailVerification.successTitle')}
        </h1>
        <p style={{ margin: '12px 0 24px', color: '#3d4a3d', lineHeight: 1.7 }}>
          {t('emailVerification.successDescription')}
        </p>
        <Link
          href="/tenant/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 44,
            padding: '0 18px',
            borderRadius: 12,
            background: '#006e2f',
            color: '#ffffff',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          {t('emailVerification.backToDashboard')}
        </Link>
      </section>
    </main>
  );
}
