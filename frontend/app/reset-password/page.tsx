'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  surfaceContainerLow: '#f0f3ff',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3d4a3d',
  outline: '#6d7b6c',
  error: '#ba1a1a',
};

function isStrongEnough(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

function subscribeToUrlChanges() {
  return () => undefined;
}

function getResetContextSnapshot() {
  const params = new URLSearchParams(window.location.search);

  return `${params.get('token') || ''}\n${params.get('email') || ''}`;
}

function getServerResetContextSnapshot() {
  return '\n';
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const resetContext = useSyncExternalStore(
    subscribeToUrlChanges,
    getResetContextSnapshot,
    getServerResetContextSnapshot
  );
  const [token, email] = resetContext.split('\n');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!token || !email) {
      setError(t('auth.resetTokenMissing'));
      return;
    }

    if (!isStrongEnough(password)) {
      setError(t('auth.passwordRule'));
      return;
    }

    if (password !== passwordConfirmation) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      router.replace('/login?reset=success');
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError, t('auth.resetPasswordFailed')));
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = isSubmitting || !token || !email;

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
                {t('auth.resetPasswordTitle')}
              </h1>
              <p style={{ color: colors.onSurfaceVariant, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {t('auth.resetPasswordSubtitle')}
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
              {(!token || !email) && (
                <div
                  role="alert"
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '14px',
                    borderRadius: '16px',
                    backgroundColor: '#fff2f2',
                    color: colors.error,
                    fontSize: '13px',
                    fontWeight: 700,
                    lineHeight: 1.5,
                    marginBottom: '22px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>
                    error
                  </span>
                  {t('auth.resetTokenMissing')}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <PasswordField
                  label={t('auth.newPassword')}
                  value={password}
                  onChange={setPassword}
                  disabled={disabled}
                />
                <PasswordField
                  label={t('auth.confirmPassword')}
                  value={passwordConfirmation}
                  onChange={setPasswordConfirmation}
                  disabled={disabled}
                />

                {error && (
                  <p style={{ margin: 0, color: colors.error, fontSize: '13px', fontWeight: 700, lineHeight: 1.5 }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-gradient"
                  disabled={disabled}
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
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.72 : 1,
                  }}
                >
                  {isSubmitting ? t('common.processing') : t('auth.updatePassword')}
                </button>
              </form>

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
                  {t('auth.backToLogin')}
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

function PasswordField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ color: colors.onSurfaceVariant, fontSize: '14px', fontWeight: 700, marginLeft: '4px' }}>
        {label}
      </span>
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span
          className="material-symbols-outlined"
          style={{ position: 'absolute', left: '16px', color: colors.outline, fontSize: '20px' }}
        >
          lock
        </span>
        <input
          type="password"
          value={value}
          autoComplete="new-password"
          required
          disabled={disabled}
          placeholder={label}
          onChange={(event) => onChange(event.target.value)}
          style={{
            width: '100%',
            padding: '16px 16px 16px 48px',
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: '16px',
            border: 'none',
            fontSize: '14px',
            color: colors.onSurface,
            boxSizing: 'border-box',
            opacity: disabled ? 0.7 : 1,
          }}
        />
      </span>
    </label>
  );
}
