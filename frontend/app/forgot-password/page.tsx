'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authService, getAuthErrorMessage } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const styles = `

  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .auth-page-root {
    font-family: var(--font-manrope), Manrope, sans-serif;
    background-color: #f9f9ff;
    color: #111c2d;
    min-height: 100vh;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.84);
    backdrop-filter: blur(24px);
    box-shadow: 0 12px 40px rgba(17, 28, 45, 0.06);
  }

  .primary-gradient {
    background: linear-gradient(135deg, #006e2f 0%, #22c55e 100%);
  }

  input:focus {
    outline: none !important;
    box-shadow: none !important;
  }
`;

const colors = {
  primary: '#006e2f',
  onPrimary: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3d4a3d',
  outline: '#6d7b6c',
  error: '#ba1a1a',
};

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const success = Boolean(message);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword({ email });
      setMessage(response.message || t('auth.resetLinkSentDescription'));
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError, t('auth.forgotPasswordFailed')));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page-root">
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '40%',
              height: '40%',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '9999px',
              filter: 'blur(120px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-5%',
              left: '-5%',
              width: '30%',
              height: '30%',
              background: 'rgba(222, 232, 255, 0.4)',
              borderRadius: '9999px',
              filter: 'blur(100px)',
              pointerEvents: 'none',
            }}
          />

          <section style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Image
                src="/KosHandayani_Logo.png"
                alt="KosHandayani Logo"
                width={220}
                height={68}
                style={{ width: 'auto', height: '56px', objectFit: 'contain' }}
                priority
              />
              <h1
                style={{
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontWeight: 800,
                  fontSize: '25px',
                  color: colors.onSurface,
                  margin: '18px 0 8px',
                }}
              >
                {success ? t('auth.resetLinkSentTitle') : t('auth.forgotPasswordTitle')}
              </h1>
              <p
                style={{
                  color: colors.onSurfaceVariant,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {success ? t('auth.resetLinkSentDescription') : t('auth.forgotPasswordSubtitle')}
              </p>
            </div>

            <div
              className="glass-card"
              style={{
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid rgba(188, 203, 185, 0.15)',
              }}
            >
              {success ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '24px',
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: '#e7f8eb',
                      color: colors.primary,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
                      mark_email_read
                    </span>
                  </div>
                  <p style={{ margin: 0, color: colors.onSurfaceVariant, fontSize: '14px', lineHeight: 1.65 }}>
                    {message}
                  </p>
                  <Link
                    href="/login"
                    className="primary-gradient"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      color: colors.onPrimary,
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontWeight: 800,
                      fontSize: '15px',
                      padding: '15px',
                      borderRadius: '16px',
                      textDecoration: 'none',
                    }}
                  >
                    {t('auth.backToLogin')}
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: colors.onSurfaceVariant, fontSize: '14px', fontWeight: 700, marginLeft: '4px' }}>
                      {t('auth.email')}
                    </span>
                    <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span
                        className="material-symbols-outlined"
                        style={{ position: 'absolute', left: '16px', color: colors.outline, fontSize: '20px' }}
                      >
                        mail
                      </span>
                      <input
                        type="email"
                        value={email}
                        autoComplete="email"
                        required
                        disabled={isSubmitting}
                        placeholder={t('auth.email')}
                        onChange={(event) => setEmail(event.target.value)}
                        style={{
                          width: '100%',
                          padding: '16px 16px 16px 48px',
                          backgroundColor: colors.surfaceContainerLow,
                          borderRadius: '16px',
                          border: 'none',
                          fontSize: '14px',
                          color: colors.onSurface,
                          boxSizing: 'border-box',
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                      />
                    </span>
                  </label>

                  {error && (
                    <p style={{ margin: 0, color: colors.error, fontSize: '13px', fontWeight: 700, lineHeight: 1.5 }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="primary-gradient"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      color: colors.onPrimary,
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontWeight: 800,
                      fontSize: '16px',
                      padding: '16px',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0, 110, 47, 0.3)',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? t('common.processing') : t('auth.sendResetLink')}
                  </button>
                </form>
              )}

              <div style={{ marginTop: '28px', textAlign: 'center' }}>
                <Link
                  href="/login"
                  style={{
                    color: colors.primary,
                    fontSize: '13px',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  {t('auth.rememberPassword')}
                </Link>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <LanguageSwitcher compact />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
