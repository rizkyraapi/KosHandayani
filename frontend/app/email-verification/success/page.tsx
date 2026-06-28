'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Home, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const colors = {
  primary: '#006e2f',
  primaryDark: '#005321',
  primarySoft: '#e7f8eb',
  surface: '#ffffff',
  page: '#f9f9ff',
  text: '#111c2d',
  muted: '#3d4a3d',
  border: '#dfe8dc',
};

export default function EmailVerificationSuccessPage() {
  const { t } = useLanguage();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: colors.page,
        color: colors.text,
        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 520,
          background: colors.surface,
          borderRadius: 24,
          padding: '40px 34px',
          textAlign: 'center',
          boxShadow: '0 24px 70px rgba(17, 28, 45, 0.10)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Image
          src="/KosHandayani_Logo.png"
          alt="KosHandayani"
          width={190}
          height={58}
          priority
          style={{ width: 'auto', height: 48, objectFit: 'contain', margin: '0 auto 28px' }}
        />

        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            background: colors.primarySoft,
            color: colors.primary,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
            boxShadow: 'inset 0 0 0 1px rgba(0, 110, 47, 0.10)',
          }}
        >
          <CheckCircle2 size={42} strokeWidth={2.5} />
        </div>

        <p
          style={{
            margin: '0 0 10px',
            color: colors.primary,
            fontSize: 12,
            lineHeight: '18px',
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          KosHandayani
        </p>

        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-manrope), Manrope, sans-serif',
            fontSize: 'clamp(28px, 5vw, 36px)',
            lineHeight: 1.12,
            fontWeight: 900,
            letterSpacing: 0,
            color: colors.text,
          }}
        >
          {t('emailVerification.successTitle')}
        </h1>

        <p
          style={{
            margin: '16px auto 30px',
            maxWidth: 390,
            color: colors.muted,
            fontSize: 15,
            lineHeight: '25px',
            fontWeight: 500,
          }}
        >
          {t('emailVerification.successDescription')}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/login"
            style={{
              minHeight: 46,
              padding: '0 18px',
              borderRadius: 12,
              background: colors.primary,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 10px 24px rgba(0, 110, 47, 0.22)',
            }}
          >
            <LogIn size={18} />
            {t('common.login')}
          </Link>

          <Link
            href="/"
            style={{
              minHeight: 46,
              padding: '0 18px',
              borderRadius: 12,
              background: '#f4f8f2',
              color: colors.primaryDark,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: `1px solid ${colors.border}`,
            }}
          >
            <Home size={18} />
            {t('emailVerification.backToHome')}
          </Link>
        </div>
      </section>
    </main>
  );
}
