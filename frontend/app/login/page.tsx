'use client';
import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAuthErrorMessage } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
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

  .glass-card {
    background: rgba(255, 255, 255, 0.8);
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

  .page-root {
    font-family: var(--font-manrope), Manrope, sans-serif;
    background-color: #f9f9ff;
    color: #111c2d;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const colors = {
  primary: '#006e2f',
  onPrimary: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainerHigh: '#dee8ff',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3d4a3d',
  outline: '#6d7b6c',
};

function subscribeToUrlChanges() {
  return () => undefined;
}

function getRegisteredSearchParam() {
  return new URLSearchParams(window.location.search).get('registered') === '1';
}

function getResetSuccessSearchParam() {
  return new URLSearchParams(window.location.search).get('reset') === 'success';
}

function getServerRegisteredSearchParam() {
  return false;
}

interface InputFieldProps {
  label: string;
  icon: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function InputField({ label, icon, placeholder, type = 'text', value, onChange, disabled }: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: colors.onSurfaceVariant,
          marginLeft: '4px',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span
          className="material-symbols-outlined"
          style={{
            position: 'absolute',
            left: '16px',
            color: colors.outline,
            fontSize: '20px',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            paddingLeft: '48px',
            paddingRight: '16px',
            paddingTop: '16px',
            paddingBottom: '16px',
            backgroundColor: focused ? colors.surfaceContainerLowest : colors.surfaceContainerLow,
            borderRadius: '16px',
            border: 'none',
            fontSize: '14px',
            color: colors.onSurface,
            transition: 'background-color 0.2s',
            boxSizing: 'border-box',
            opacity: disabled ? 0.7 : 1,
          }}
        />
      </div>
    </div>
  );
}

export default function Page() {
  const { login, error: authError, clearError } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registered = useSyncExternalStore(
    subscribeToUrlChanges,
    getRegisteredSearchParam,
    getServerRegisteredSearchParam
  );
  const resetSuccess = useSyncExternalStore(
    subscribeToUrlChanges,
    getResetSuccessSearchParam,
    getServerRegisteredSearchParam
  );

  const errorMessage = localError || authError;
  const successMessage = registered
    ? t('messages.registerSuccess')
    : resetSuccess
      ? t('messages.passwordResetSuccess')
      : '';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError('');
    clearError();
    setIsSubmitting(true);

    try {
      await login(form);
    } catch (error) {
      setLocalError(getAuthErrorMessage(error, t('auth.loginFailed')));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <main
          style={{
            flexGrow: 1,
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

          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Image
                  src="/KosHandayani_Logo.png"
                  alt="KosHandayani Logo"
                  width={220}
                  height={68}
                  style={{ width: 'auto', height: '56px', objectFit: 'contain' }}
                  priority
                />
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: colors.onSurface,
                  marginBottom: '8px',
                  marginTop: 0,
                }}
              >
                {t('auth.loginTitle')}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                  fontSize: '14px',
                  color: colors.onSurfaceVariant,
                  margin: 0,
                }}
              >
                {t('auth.loginSubtitle')}
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
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <InputField
                  label={t('auth.email')}
                  icon="person"
                  placeholder={t('auth.email')}
                  type="email"
                  value={form.email}
                  onChange={(email) => setForm((current) => ({ ...current, email }))}
                  disabled={isSubmitting}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.onSurfaceVariant,
                      marginLeft: '4px',
                    }}
                  >
                    {t('auth.password')}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: 'absolute',
                        left: '16px',
                        color: colors.outline,
                        fontSize: '20px',
                        pointerEvents: 'none',
                      }}
                    >
                      lock
                    </span>
                    <input
                      type="password"
                      placeholder={t('auth.password')}
                      value={form.password}
                      disabled={isSubmitting}
                      onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                      style={{
                        width: '100%',
                        paddingLeft: '48px',
                        paddingRight: '16px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        backgroundColor: colors.surfaceContainerLow,
                        borderRadius: '16px',
                        border: 'none',
                        fontSize: '14px',
                        color: colors.onSurface,
                        transition: 'background-color 0.2s',
                        boxSizing: 'border-box',
                        opacity: isSubmitting ? 0.7 : 1,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.backgroundColor = colors.surfaceContainerLowest;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.backgroundColor = colors.surfaceContainerLow;
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      color: colors.onSurfaceVariant,
                      fontSize: '13px',
                      fontWeight: 600,
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.remember}
                      disabled={isSubmitting}
                      onChange={(e) => setForm((current) => ({ ...current, remember: e.target.checked }))}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: colors.primary,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                    />
                    {t('auth.rememberMe')}
                  </label>

                  <Link
                    href="/forgot-password"
                    style={{
                      fontSize: '13px',
                      color: colors.primary,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                {resetSuccess && (
                  <div
                    role="status"
                    style={{
                      position: 'fixed',
                      top: '20px',
                      right: '20px',
                      zIndex: 40,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      maxWidth: '360px',
                      padding: '14px 16px',
                      borderRadius: '16px',
                      backgroundColor: '#f0fff4',
                      border: '1px solid #bbf7d0',
                      boxShadow: '0 18px 45px rgba(17,28,45,.12)',
                      color: colors.primary,
                      fontSize: '13px',
                      fontWeight: 800,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      check_circle
                    </span>
                    {t('messages.passwordResetSuccess')}
                  </div>
                )}

                {(errorMessage || successMessage) && (
                  <p
                    style={{
                      margin: 0,
                      color: errorMessage ? '#ba1a1a' : colors.primary,
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    {errorMessage || successMessage}
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
                    fontWeight: 700,
                    fontSize: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0, 110, 47, 0.3)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'filter 0.2s, transform 0.1s',
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseOut={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                  onMouseDown={(e) => {
                    if (!isSubmitting) e.currentTarget.style.transform = 'scale(0.97)';
                  }}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isSubmitting ? t('common.processing') : t('common.login')}
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    login
                  </span>
                </button>
              </form>

              <div
                style={{
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(188, 203, 185, 0.1)',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '14px', color: colors.onSurfaceVariant, margin: 0 }}>
                  {t('auth.noAccount')}{' '}
                  <Link
                    href="/register"
                    style={{
                      color: colors.primary,
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginLeft: '4px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {t('common.register')}
                  </Link>
                </p>
              </div>
            </div>

            <p
              style={{
                marginTop: '32px',
                textAlign: 'center',
                fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                fontSize: '12px',
                color: colors.outline,
                lineHeight: '1.5',
                maxWidth: '320px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              © 2026 KosHandayani. Digital Concierge Property Management.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <LanguageSwitcher compact />
            </div>
          </div>
        </main>

        <div style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
          <span
            aria-label={t('common.comingSoon')}
            role="status"
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              padding: '16px',
              borderRadius: '9999px',
              boxShadow: '0 8px 24px rgba(17, 28, 45, 0.15)',
              color: colors.primary,
              border: 'none',
              cursor: 'default',
              opacity: 0.72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined">support_agent</span>
          </span>
        </div>
      </div>
    </>
  );
}
