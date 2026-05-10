'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/auth';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

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

  .icon-filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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
    font-family: 'Inter', sans-serif;
    background-color: #f9f9ff;
    color: #111c2d;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const colors = {
  primary: '#006e2f',
  primaryContainer: '#22c55e',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#004b1e',
  secondary: '#2f6a3c',
  secondaryContainer: '#afefb4',
  surface: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainer: '#e7eeff',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3d4a3d',
  outlineVariant: '#bccbb9',
  outline: '#6d7b6c',
  background: '#f9f9ff',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
};

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
          fontFamily: 'Inter, sans-serif',
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
  const { register, error: authError, clearError } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    whatsapp: '',
    pekerjaan: '',
    address: '',
  });
  const errorMessage = localError || authError;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError('');
    clearError();

    if (!agreed) {
      setLocalError('Anda harus menyetujui Syarat & Ketentuan terlebih dahulu.');
      return;
    }

    if (form.password !== form.password_confirmation) {
      setLocalError('Konfirmasi password tidak sama.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(form);
    } catch (error) {
      setLocalError(getAuthErrorMessage(error, 'Register gagal. Periksa data yang diisi.'));
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
          {/* Background blobs */}
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
            {/* Header */}
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
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  color: colors.onSurface,
                  marginBottom: '8px',
                  marginTop: 0,
                }}
              >
                Buat Akun Baru
              </h2>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: colors.onSurfaceVariant,
                  margin: 0,
                }}
              >
                Kelola properti Anda dengan sentuhan layanan premium.
              </p>
            </div>

            {/* Card */}
            <div
              className="glass-card"
              style={{
                borderRadius: '24px',
                padding: '40px',
                border: `1px solid rgba(188, 203, 185, 0.15)`,
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <InputField
                  label="Nama Lengkap"
                  icon="person"
                  placeholder="Masukkan nama lengkap"
                  type="text"
                  value={form.full_name}
                  onChange={(full_name) => setForm((current) => ({ ...current, full_name }))}
                  disabled={isSubmitting}
                />
                <InputField
                  label="Email"
                  icon="mail"
                  placeholder="contoh@email.com"
                  type="email"
                  value={form.email}
                  onChange={(email) => setForm((current) => ({ ...current, email }))}
                  disabled={isSubmitting}
                />

                {/* Password Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <InputField
                    label="Password"
                    icon="lock"
                    placeholder="••••••••"
                    type="password"
                    value={form.password}
                    onChange={(password) => setForm((current) => ({ ...current, password }))}
                    disabled={isSubmitting}
                  />
                  <InputField
                    label="Konfirmasi"
                    icon="shield"
                    placeholder="••••••••"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(password_confirmation) =>
                      setForm((current) => ({ ...current, password_confirmation }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <InputField
                  label="WhatsApp"
                  icon="call"
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(whatsapp) => setForm((current) => ({ ...current, whatsapp }))}
                  disabled={isSubmitting}
                />

                <InputField
                  label="Pekerjaan"
                  icon="work"
                  placeholder="Masukkan pekerjaan"
                  type="text"
                  value={form.pekerjaan}
                  onChange={(pekerjaan) => setForm((current) => ({ ...current, pekerjaan }))}
                  disabled={isSubmitting}
                />

                <InputField
                  label="Alamat"
                  icon="home"
                  placeholder="Masukkan alamat"
                  type="text"
                  value={form.address}
                  onChange={(address) => setForm((current) => ({ ...current, address }))}
                  disabled={isSubmitting}
                />

                {/* Terms */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0 4px' }}>
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    disabled={isSubmitting}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{
                      marginTop: '2px',
                      accentColor: colors.primary,
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <label
                    htmlFor="terms"
                    style={{
                      fontSize: '12px',
                      color: colors.onSurfaceVariant,
                      lineHeight: '1.6',
                      cursor: 'pointer',
                    }}
                  >
                    Saya menyetujui{' '}
                    <a
                      href="#"
                      style={{
                        color: colors.primary,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      Syarat &amp; Ketentuan
                    </a>{' '}
                    serta{' '}
                    <a
                      href="#"
                      style={{
                        color: colors.primary,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      Kebijakan Privasi
                    </a>{' '}
                    yang berlaku di KosHandayani.
                  </label>
                </div>

                {errorMessage && (
                  <p
                    style={{
                      margin: 0,
                      color: colors.error,
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    {errorMessage}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="primary-gradient"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    color: colors.onPrimary,
                    fontFamily: 'Manrope, sans-serif',
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
                  {isSubmitting ? 'Memproses...' : 'Daftar'}
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Footer Link */}
              <div
                style={{
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: `1px solid rgba(188, 203, 185, 0.1)`,
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '14px', color: colors.onSurfaceVariant, margin: 0 }}>
                  Sudah punya akun?{' '}
                  <Link
                    href="/login"
                    style={{
                      color: colors.primary,
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginLeft: '4px',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>

            {/* Copyright */}
            <p
              style={{
                marginTop: '32px',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                color: colors.outline,
                lineHeight: '1.5',
                maxWidth: '320px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              © 2024 KosHandayani. Digital Concierge Property Management.
            </p>
          </div>
        </main>

        {/* Support Bubble */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
          <button
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              padding: '16px',
              borderRadius: '9999px',
              boxShadow: '0 8px 24px rgba(17, 28, 45, 0.15)',
              color: colors.primary,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = colors.surfaceContainerHigh)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = colors.surfaceContainerLowest)
            }
          >
            <span className="material-symbols-outlined">support_agent</span>
          </button>
        </div>
      </div>
    </>
  );
}
