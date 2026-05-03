'use client';
import { useEffect } from 'react';

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
          --color-secondary-container: #afefb4;
          --color-on-secondary-container: #346e40;
          --color-secondary-fixed: #b2f2b7;
          --color-secondary-fixed-dim: #96d59d;
          --color-on-secondary-fixed: #002109;
          --color-on-secondary-fixed-variant: #145126;
          --color-tertiary: #9e4036;
          --color-on-tertiary: #ffffff;
          --color-tertiary-container: #ff8b7c;
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

// ── Sub-components ──────────────────────────────────────────────────────────

function SideNav() {
  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'domain', label: 'Cabang', active: false },
    { icon: 'group', label: 'Penyewa', active: false },
    { icon: 'payments', label: 'Keuangan', active: false },
    { icon: 'analytics', label: 'Laporan', active: false },
    { icon: 'settings', label: 'Pengaturan', active: true },
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
            key={item.label}
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
            {item.label}
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
        Tambah Kamar
      </button>

      {/* Bottom links */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {[
          { icon: 'help', label: 'Bantuan' },
          { icon: 'logout', label: 'Keluar' },
        ].map((item) => (
          <a
            key={item.label}
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
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
}

function ProfileIdentityCard() {
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0lfYZlq_0inQ9MQ_Y3foKOoO_r8bRgzE3BHVuhupx6Rl4Bh3krLnZNjKeSjc913T-ewcgmtm19qFVngvs76U3ASbhZrJG6bPFpPouXBnLjRkO-Cc5_r6vpzFmRBVRNBDdxKQFDAbM0HHa7lSv51Ga8-WQ0NJO9cUkuzVV48YKzLuNzAik4uWr-KXLQLPl6X4ChvKtvDvQhaE2up0vLLCV6_hfvV6ySJuDHJ2vpCa-tOIJiwdFwF0_vgCodsE8zVTAFWDH6xmBk4WU"
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
          <button
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
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
              photo_camera
            </span>
          </button>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: C.onBackground, marginBottom: '0.25rem' }}>
          Handayani Pratama
        </h2>
        <p style={{ color: C.onSurfaceVariant, fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>
          Super Admin / Tenant
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
          Terverifikasi
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

function SecurityCard() {
  const actions = [
    { icon: 'lock', label: 'Ganti Kata Sandi' },
    { icon: 'phonelink_setup', label: 'Autentikasi 2-Faktor' },
  ];

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
        {actions.map((action) => (
          <button
            key={action.label}
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
                {action.icon}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: C.onSurfaceVariant }}>
                {action.label}
              </span>
            </div>
            <span className="material-symbols-outlined" style={{ color: '#cbd5e1' }}>
              chevron_right
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonalInfoForm() {
  return (
    <div
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

      {/* Form grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem 2rem',
        }}
      >
        <FormField label="Nama Lengkap" type="text" defaultValue="Handayani Pratama" />
        <FormField label="Email" type="email" defaultValue="handayani@example.com" icon="mail" />
        <FormField label="Nomor WhatsApp" type="text" defaultValue="+62 812-3456-7890" icon="call" />
        <FormField label="Pekerjaan" type="text" defaultValue="Software Engineer" />
        <FormFieldTextarea
          label="Alamat Asal"
          defaultValue="Jl. Melati No. 45, Kebon Jeruk, Jakarta Barat"
          icon="location_on"
          fullWidth
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
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#ba1a1a',
            fontWeight: 700,
            fontSize: '0.875rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(186,26,26,0.08)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
            logout
          </span>
          Logout dari Semua Sesi
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
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
          >
            Batal
          </button>
          <button
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              background: C.primary,
              color: C.onPrimary,
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
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
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  type: string;
  defaultValue: string;
  icon?: string;
}

function FormField({ label, type, defaultValue, icon }: FormFieldProps) {
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
          defaultValue={defaultValue}
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
  defaultValue: string;
  icon?: string;
  fullWidth?: boolean;
}

function FormFieldTextarea({ label, defaultValue, icon }: FormFieldTextareaProps) {
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
          defaultValue={defaultValue}
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
              Akun Saya
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
              Profil Pengguna
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.75rem',
                border: `1px solid rgba(188,203,185,0.3)`,
                color: C.onSurfaceVariant,
                fontWeight: 600,
                fontSize: '0.875rem',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = C.surfaceContainerLow)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>
                edit
              </span>
              Edit Profil
            </button>
            <button
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.75rem',
                background: `linear-gradient(to right, ${C.primary}, ${C.primaryContainer})`,
                color: C.onPrimary,
                fontWeight: 700,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0,110,47,0.2)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
              onMouseDown={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)')}
              onMouseUp={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)')}
            >
              Simpan Perubahan
            </button>
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
            <ProfileIdentityCard />
            <SecurityCard />
          </div>

          {/* Right column: personal info form */}
          <div style={{ gridColumn: 'span 12' }} className="lg-col-8">
            <PersonalInfoForm />
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
            title="Notifikasi"
            subtitle="Kelola cara kami menghubungi Anda."
            actionLabel="Atur"
          />
          <SecondaryCard
            icon="credit_card"
            title="Metode Pembayaran"
            subtitle="Tautkan akun bank atau e-wallet."
            actionLabel="Kelola"
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
