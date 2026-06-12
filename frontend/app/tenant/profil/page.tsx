'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { changePassword, getProfile, updateProfile, type ChangePasswordPayload, type ProfilePayload } from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Inject Google Fonts and Material Symbols into <head>
function useGlobalStyles() {
  useEffect(() => {
    const links = [
      'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
    ];
    links.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const el = document.createElement('link');
        el.rel = 'stylesheet';
        el.href = href;
        document.head.appendChild(el);
      }
    });

    const styleId = 'page-tsx-global-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* ── Custom Tailwind color tokens (CSS vars used via inline styles) ── */
        :root {
          --color-primary: #006e2f;
          --color-on-primary: #ffffff;
          --color-primary-fixed: #6bff8f;
          --color-primary-fixed-dim: #4ae176;
          --color-primary-container: #22c55e;
          --color-on-primary-container: #004b1e;
          --color-on-primary-fixed: #002109;
          --color-on-primary-fixed-variant: #005321;
          --color-secondary: #2f6a3c;
          --color-on-secondary: #ffffff;
              {
                [
                  { label: 'Bergabung Sejak', value: 'Jan 2023' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ color: '#64748b' }}>{row.label}</div>
                    <div style={{ fontWeight: 700 }}>{row.value}</div>
                  </div>
                ))
              }
          --color-on-tertiary-container: #76231b;
          --color-tertiary-fixed: #ffdad5;
          --color-tertiary-fixed-dim: #ffb4a9;
          --color-on-tertiary-fixed: #410001;
          --color-on-tertiary-fixed-variant: #7f2a21;
          --color-background: #f9f9ff;
          --color-on-background: #111c2d;
          --color-surface: #f9f9ff;
          --color-on-surface: #111c2d;
          --color-surface-variant: #d8e3fb;
          --color-on-surface-variant: #3d4a3d;
          --color-surface-container-lowest: #ffffff;
          --color-surface-container-low: #f0f3ff;
          --color-surface-container: #e7eeff;
          --color-surface-container-high: #dee8ff;
          --color-surface-container-highest: #d8e3fb;
          --color-surface-dim: #cfdaf2;
          --color-surface-bright: #f9f9ff;
          --color-surface-tint: #006e2f;
          --color-outline: #6d7b6c;
          --color-outline-variant: #bccbb9;
          --color-inverse-surface: #263143;
          --color-inverse-on-surface: #ecf1ff;
          --color-inverse-primary: #4ae176;
          --color-error: #ba1a1a;
          --color-on-error: #ffffff;
          --color-error-container: #ffdad6;
          --color-on-error-container: #93000a;
        }

        /* ── Material Symbols ── */
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined', sans-serif;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-size: 24px;
          line-height: 1;
          display: inline-block;
          vertical-align: middle;
          user-select: none;
        }

        /* ── Typography ── */
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4 { font-family: 'Manrope', sans-serif; }

        /* ── Utility shadow ── */
        .surface-shift-shadow { box-shadow: 0 12px 40px rgba(17, 28, 45, 0.06); }

        /* ── Responsive sidebar behaviour ── */
        @media (max-width: 1023px) {
          .sidebar { transform: translateX(-100%); position: fixed; }
          .main-content { margin-left: 0 !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
}

// ── Color constants (match the Tailwind config above) ──────────────────────
const C = {
  primary: '#006e2f',
  onPrimary: '#ffffff',
  primaryContainer: '#22c55e',
  onPrimaryContainer: '#004b1e',
  secondary: '#2f6a3c',
  onSecondaryContainer: '#346e40',
  secondaryContainer: '#afefb4',
  secondaryFixedDim: '#96d59d',
  background: '#f9f9ff',
  onBackground: '#111c2d',
  surface: '#f9f9ff',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3d4a3d',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  outlineVariant: '#bccbb9',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
};

function getApiErrorMessages(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const validationMessages = data?.errors ? Object.values(data.errors).flat() : [];

    if (validationMessages.length > 0) {
      return validationMessages;
    }

    if (data?.message) {
      return [data.message];
    }
  }

  return [getAuthErrorMessage(error, fallback)];
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SideNav() {
  const { t } = useLanguage();
  const navItems = [
    { icon: 'dashboard', labelKey: 'common.dashboard', active: false },
    { icon: 'domain', labelKey: 'owner.applications.branch', active: false },
    { icon: 'group', labelKey: 'common.tenants', active: false },
    { icon: 'payments', labelKey: 'common.payments', active: false },
    { icon: 'analytics', labelKey: 'common.reports', active: false },
    { icon: 'settings', labelKey: 'tenant.profile.settings', active: true },
  ];

  return (
    <aside
      className="sidebar"
      style={{
        height: '100vh',
        width: '16rem',
        position: 'fixed',
        left: 0,
        top: 0,
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        borderRight: '1px solid #f1f5f9',
        zIndex: 40,
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <div
        style={{
          fontSize: '1.1rem',
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 800,
          color: '#15803d',
          marginBottom: '2rem',
        }}
      >
        KosHandayani Admin
      </div>

      {/* Owner card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc95Wl--k9fDDk6Es5AP9W5GT1kW04aN3RGcy2g2RVpbQk7PSc9n11afN8g67JPB5LwlcbaRjtCBN6u_WefqFUd9ZGeoJD5CiVYakLInaup6cW84LRmY9h5it8rgf6_8x5_eA4VCA0fkOGlAlZ5IsFT18kcyjGvHMWg-794e8h_zbezL2pU6HSsQYJCKweXt0FnT31MmUhR1JtvS8c1A-ezMC0SWU4ZJvJASpqHXk-2RntV77GcT5RKqbaCTwo0hOrvrGX7rSjzoYt"
          alt="Owner Avatar"
          style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', objectFit: 'cover' }}
        />
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, color: C.onBackground }}>
            Super Admin
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Owner Avatar</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => (
          <a
            key={item.labelKey}
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: item.active ? 700 : 500,
              fontFamily: 'Inter, sans-serif',
              color: item.active ? C.primary : '#64748b',
              background: item.active ? '#f0fdf4' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!item.active) (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              if (!item.active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            }}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {t(item.labelKey)}
          </a>
        ))}
      </nav>

      {/* Add Room CTA */}
      <button
        style={{
          marginTop: '1rem',
          marginBottom: '2rem',
          padding: '0.5rem 1rem',
          background: C.primary,
          color: C.onPrimary,
          borderRadius: '0.5rem',
          fontWeight: 700,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.15s',
        }}
        onMouseDown={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)')}
        onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          add
        </span>
        {t('owner.rooms.addShort')} {t('common.room')}
      </button>

      {/* Bottom links */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {[
          { icon: 'help', labelKey: 'common.help' },
          { icon: 'logout', labelKey: 'common.logout' },
        ].map((item) => (
          <a
            key={item.labelKey}
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              color: '#64748b',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {t(item.labelKey)}
          </a>
        ))}
      </div>
    </aside>
  );
}

function ProfileIdentityCard({
  fullName,
  email,
  isComplete,
  photoUrl,
  isDisabled,
  onPhotoChange,
}: {
  fullName: string;
  email: string;
  isComplete: boolean;
  photoUrl: string;
  isDisabled: boolean;
  onPhotoChange: (file: File) => void;
}) {
  const defaultPhotoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Tenant')}&background=006e2f&color=ffffff&size=256&bold=true`;

  return (
    <div
      className="surface-shift-shadow"
      style={{
        background: C.surfaceContainerLowest,
        padding: '2rem',
        borderRadius: '0.75rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* BG accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '6rem',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, transparent 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Avatar */}
        <div style={{ display: 'inline-block', position: 'relative', marginBottom: '1rem' }}>
          <img
            src={photoUrl || defaultPhotoUrl}
            alt="Profile photo"
            style={{
              width: '8rem',
              height: '8rem',
              borderRadius: '9999px',
              objectFit: 'cover',
              border: '4px solid white',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          />
          <label
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              padding: '0.5rem',
              background: 'white',
              borderRadius: '9999px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              color: C.primary,
              border: '1px solid #f1f5f9',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              lineHeight: 1,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
              photo_camera
            </span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              disabled={isDisabled}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];

                if (file) {
                  onPhotoChange(file);
                }
              }}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.onBackground, marginBottom: '0.25rem' }}>
          {fullName || 'Tenant'}
        </h2>
        <p style={{ color: C.onSurfaceVariant, fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>
          {email || 'Tenant'}
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            background: C.secondaryContainer,
            color: C.onSecondaryContainer,
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span style={{ width: '0.375rem', height: '0.375rem', background: C.primary, borderRadius: '9999px', display: 'inline-block' }} />
          {isComplete ? 'Profil Lengkap' : 'Belum Lengkap'}
        </div>
      </div>

      {/* Meta info */}
      <div
        style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {[
          { label: 'ID Pengguna', value: '#KSH-9921' },
          { label: 'Bergabung Sejak', value: 'Jan 2023' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: C.onSurfaceVariant }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: C.onBackground }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityCard({
  form,
  isOpen,
  isSubmitting,
  errors,
  success,
  onToggle,
  onChange,
  onSubmit,
}: {
  form: ChangePasswordPayload;
  isOpen: boolean;
  isSubmitting: boolean;
  errors: string[];
  success: string;
  onToggle: () => void;
  onChange: (field: keyof ChangePasswordPayload, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="surface-shift-shadow"
      style={{
        background: C.surfaceContainerLowest,
        padding: '1.5rem',
        borderRadius: '0.75rem',
      }}
    >
      <h3
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: C.onBackground,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: C.primary }}>
          security
        </span>
        Keamanan Akun
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onToggle}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#f8fafc')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#94a3b8' }}>
              lock
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: C.onSurfaceVariant }}>
              Ganti Kata Sandi
            </span>
          </div>
          <span className="material-symbols-outlined" style={{ color: '#cbd5e1' }}>
            {isOpen ? 'expand_less' : 'chevron_right'}
          </span>
        </button>

        {isOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {errors.length > 0 && (
              <div
                style={{
                  padding: '0.875rem',
                  borderRadius: '0.75rem',
                  background: C.errorContainer,
                  color: C.error,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                {errors.map((message) => (
                  <div key={message}>{message}</div>
                ))}
              </div>
            )}

            {success && (
              <div
                style={{
                  padding: '0.875rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(175,239,180,0.35)',
                  color: C.onSecondaryContainer,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {success}
              </div>
            )}

            <FormField
              label="Password Saat Ini"
              type="password"
              value={form.current_password}
              icon="lock"
              disabled={isSubmitting}
              onChange={(value) => onChange('current_password', value)}
            />
            <FormField
              label="Password Baru"
              type="password"
              value={form.new_password}
              icon="key"
              disabled={isSubmitting}
              onChange={(value) => onChange('new_password', value)}
            />
            <FormField
              label="Konfirmasi Password Baru"
              type="password"
              value={form.new_password_confirmation}
              icon="verified_user"
              disabled={isSubmitting}
              onChange={(value) => onChange('new_password_confirmation', value)}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: C.primary,
                color: C.onPrimary,
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0,110,47,0.2)',
              }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function PersonalInfoForm({
  form,
  isEditing,
  isFetching,
  isSaving,
  error,
  success,
  onChange,
  onEdit,
  onSubmit,
  onReset,
}: {
  form: ProfilePayload & { email: string };
  isEditing: boolean;
  isFetching: boolean;
  isSaving: boolean;
  error: string;
  success: string;
  onChange: (field: keyof ProfilePayload, value: string) => void;
  onEdit: () => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const isDisabled = isFetching || isSaving || !isEditing;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="surface-shift-shadow"
      style={{
        background: C.surfaceContainerLowest,
        padding: '2.5rem',
        borderRadius: '0.75rem',
      }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            background: 'rgba(0,110,47,0.1)',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: C.primary }}>
            person
          </span>
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.onBackground }}>Informasi Pribadi</h3>
          <p style={{ fontSize: '0.875rem', color: C.onSurfaceVariant }}>
            Kelola data diri Anda untuk keperluan administrasi kos.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: C.errorContainer,
            color: C.error,
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            background: 'rgba(175,239,180,0.35)',
            color: C.onSecondaryContainer,
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          {success}
        </div>
      )}

      {/* Form grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem 2rem',
        }}
      >
        <FormField
          label="Nama Lengkap"
          type="text"
          value={form.full_name}
          disabled={isDisabled}
          onChange={(value) => onChange('full_name', value)}
        />
        <FormField label="Email" type="email" value={form.email} icon="mail" disabled />
        <FormField
          label="Nomor WhatsApp"
          type="text"
          value={form.whatsapp}
          icon="call"
          disabled={isDisabled}
          onChange={(value) => onChange('whatsapp', value)}
        />
        <FormField
          label="Pekerjaan"
          type="text"
          value={form.pekerjaan}
          disabled={isDisabled}
          onChange={(value) => onChange('pekerjaan', value)}
        />
        <FormFieldTextarea
          label="Alamat Asal"
          value={form.address}
          icon="location_on"
          disabled={isDisabled}
          fullWidth
          onChange={(value) => onChange('address', value)}
        />
      </div>

      {/* Info banner */}
      <div
        style={{
          marginTop: '3rem',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          background: 'rgba(175,239,180,0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          border: '1px solid rgba(175,239,180,0.3)',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: C.secondaryFixedDim, flexShrink: 0 }}>
          info
        </span>
        <p style={{ fontSize: '0.75rem', color: C.onSecondaryContainer, lineHeight: 1.6 }}>
          Informasi di atas digunakan untuk keperluan verifikasi identitas dan kontrak sewa menyewa di
          KosHandayani. Pastikan data yang Anda masukkan adalah benar dan masih berlaku.
        </p>
      </div>

      {/* Footer actions */}
      <div
        style={{
          marginTop: '2.5rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid #f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >


        {isEditing ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                color: '#64748b',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onClick={onReset}
              disabled={isFetching || isSaving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isFetching || isSaving}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                background: C.primary,
                color: C.onPrimary,
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: isFetching || isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0,110,47,0.2)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 20px 25px -5px rgba(0,110,47,0.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 15px -3px rgba(0,110,47,0.2)';
              }}
              onMouseDown={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)')}
              onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)')}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            disabled={isFetching || isSaving}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              background: C.primary,
              color: C.onPrimary,
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: isFetching || isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0,110,47,0.2)',
              transition: 'all 0.15s',
            }}
          >
            Edit Profil
          </button>
        )}
      </div>
    </form>
  );
}

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  icon?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

function FormField({ label, type, value, icon, disabled = false, onChange }: FormFieldProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: icon ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem',
    borderRadius: '0.75rem',
    background: C.surfaceContainerLow,
    border: 'none',
    color: C.onBackground,
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'background 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: C.onSurfaceVariant }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '1.25rem',
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          style={inputStyle}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.background = C.surfaceContainerLowest;
            (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(0,110,47,0.2)`;
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.background = C.surfaceContainerLow;
            (e.target as HTMLInputElement).style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

interface FormFieldTextareaProps {
  label: string;
  value: string;
  icon?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

function FormFieldTextarea({ label, value, icon, disabled = false, onChange }: FormFieldTextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 700, color: C.onSurfaceVariant }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '0.75rem',
              color: '#94a3b8',
              fontSize: '1.25rem',
            }}
          >
            {icon}
          </span>
        )}
        <textarea
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: icon ? '0.75rem 1rem 0.75rem 2.75rem' : '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: C.surfaceContainerLow,
            border: 'none',
            color: C.onBackground,
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            (e.target as HTMLTextAreaElement).style.background = C.surfaceContainerLowest;
            (e.target as HTMLTextAreaElement).style.boxShadow = `0 0 0 2px rgba(0,110,47,0.2)`;
          }}
          onBlur={(e) => {
            (e.target as HTMLTextAreaElement).style.background = C.surfaceContainerLow;
            (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

function SecondaryCard({
  icon,
  title,
  subtitle,
  actionLabel,
}: {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel: string;
}) {
  return (
    <div
      className="surface-shift-shadow"
      style={{
        background: C.surfaceContainerLowest,
        padding: '1.5rem',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        minWidth: '260px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '9999px',
            background: C.surfaceContainerLow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#94a3b8' }}>
            {icon}
          </span>
        </div>
        <div>
          <h4 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: C.onBackground, fontSize: '1rem' }}>
            {title}
          </h4>
          <p style={{ fontSize: '0.75rem', color: C.onSurfaceVariant }}>{subtitle}</p>
        </div>
      </div>
      <button
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          background: C.surfaceContainerLow,
          color: C.onSurface,
          fontWeight: 700,
          fontSize: '0.75rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = C.surfaceContainerHigh)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = C.surfaceContainerLow)}
      >
        {actionLabel}
      </button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Page() {
  useGlobalStyles();
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState<ProfilePayload & { email: string }>({
    full_name: '',
    email: '',
    whatsapp: '',
    pekerjaan: '',
    address: '',
  });
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const isComplete = Boolean(form.whatsapp && form.pekerjaan && form.address);

  const loadProfile = async () => {
    try {
      setError('');
      setIsFetching(true);
      const profile = await getProfile();
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        whatsapp: profile.whatsapp || '',
        pekerjaan: profile.pekerjaan || '',
        address: profile.address || '',
      });
      setSelectedPhoto(null);
      setPhotoPreviewUrl(profile.profile_photo_url || '');
    } catch (profileError) {
      setError(getAuthErrorMessage(profileError, t('messages.loadProfileFailed')));
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadProfile);
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handlePhotoChange = (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError(t('tenant.profile.photoTypeError'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t('tenant.profile.photoSizeError'));
      return;
    }

    setError('');
    setSuccess('');
    setSelectedPhoto(file);
    setPhotoPreviewUrl((previousUrl) => {
      if (previousUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl);
      }

      return URL.createObjectURL(file);
    });
  };

  const saveProfile = async () => {
    try {
      setError('');
      setSuccess('');
      setIsSaving(true);
      const profile = await updateProfile({
        full_name: form.full_name,
        whatsapp: form.whatsapp,
        pekerjaan: form.pekerjaan,
        address: form.address,
        profile_photo: selectedPhoto,
      });
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        whatsapp: profile.whatsapp || '',
        pekerjaan: profile.pekerjaan || '',
        address: profile.address || '',
      });
      setSelectedPhoto(null);
      setPhotoPreviewUrl(profile.profile_photo_url || '');
      setIsEditing(false);
      setSuccess(t('tenant.profile.updateSuccess'));
      await refreshUser();
    } catch (profileError) {
      setError(getAuthErrorMessage(profileError, t('messages.saveProfileFailed')));
    } finally {
      setIsSaving(false);
    }
  };

  const submitPasswordChange = async () => {
    try {
      setPasswordErrors([]);
      setPasswordSuccess('');
      setIsChangingPassword(true);

      const response = await changePassword(passwordForm);

      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setPasswordSuccess(response.message || t('messages.passwordChanged'));
    } catch (passwordError) {
      setPasswordErrors(getApiErrorMessages(passwordError, t('tenant.profile.passwordChangeFailed')));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ background: C.background, color: C.onBackground, minHeight: '100vh' }}>
      <SideNav />

      {/* Main content: offset by sidebar width on lg+ */}
      <main
        className="main-content"
        style={{
          marginLeft: '16rem',
          padding: '2rem',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <header
          style={{
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: C.primary,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              {t('tenant.profile.myAccount')}
            </span>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                color: C.onBackground,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {t('tenant.profile.title')}
            </h1>
          </div>

        </header>

        {/* Bento grid – top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.5rem',
          }}
        >
          {/* Left column: identity + security */}
          <div
            style={{
              gridColumn: 'span 12',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
            className="lg-col-4"
          >
            <ProfileIdentityCard
              fullName={form.full_name}
              email={form.email}
              isComplete={isComplete}
              photoUrl={photoPreviewUrl}
              isDisabled={isFetching || isSaving || !isEditing}
              onPhotoChange={handlePhotoChange}
            />
            <SecurityCard
              form={passwordForm}
              isOpen={isPasswordFormOpen}
              isSubmitting={isChangingPassword}
              errors={passwordErrors}
              success={passwordSuccess}
              onToggle={() => setIsPasswordFormOpen((current) => !current)}
              onChange={(field, value) => {
                setPasswordErrors([]);
                setPasswordSuccess('');
                setPasswordForm((current) => ({ ...current, [field]: value }));
              }}
              onSubmit={submitPasswordChange}
            />
          </div>

          {/* Right column: personal info form */}
          <div style={{ gridColumn: 'span 12' }} className="lg-col-8">
            <PersonalInfoForm
              form={form}
              isEditing={isEditing}
              isFetching={isFetching}
              isSaving={isSaving}
              error={error}
              success={success}
              onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
              onEdit={() => setIsEditing(true)}
              onSubmit={saveProfile}
              onReset={() => {
                setIsEditing(false);
                void loadProfile();
              }}
            />
          </div>
        </div>

        {/* Secondary bento cards */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          <SecondaryCard
            icon="notifications"
            title={t('tenant.profile.notifications')}
            subtitle={t('tenant.profile.notificationsSubtitle')}
            actionLabel={t('tenant.profile.configure')}
          />
          <SecondaryCard
            icon="credit_card"
            title={t('tenant.profile.paymentMethods')}
            subtitle={t('tenant.profile.paymentMethodsSubtitle')}
            actionLabel={t('tenant.profile.manage')}
          />
        </div>
      </main>

      {/* Responsive grid styles */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-col-4 { grid-column: span 4 !important; }
          .lg-col-8 { grid-column: span 8 !important; }
          .sidebar { transform: translateX(0) !important; }
          .main-content { margin-left: 16rem !important; }
        }
        @media (max-width: 1023px) {
          .sidebar { transform: translateX(-100%); }
          .main-content { margin-left: 0 !important; padding: 1.25rem !important; }
          .lg-col-4, .lg-col-8 { grid-column: span 12 !important; }
        }
      `}</style>
    </div>
  );
}
