'use client';
import { useEffect } from 'react';
import Navbar from '../../../../components/Navbar';

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap';
const MATERIAL_SYMBOLS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';

const COLORS = {
  surface: '#f9f9ff',
  'surface-container-lowest': '#ffffff',
  'on-secondary-fixed-variant': '#145126',
  'on-secondary-container': '#346e40',
  'inverse-on-surface': '#ecf1ff',
  error: '#ba1a1a',
  'primary-container': '#22c55e',
  'on-surface': '#111c2d',
  'on-secondary-fixed': '#002109',
  'inverse-surface': '#263143',
  'on-secondary': '#ffffff',
  'on-error': '#ffffff',
  'on-primary-fixed': '#002109',
  primary: '#006e2f',
  'surface-variant': '#d8e3fb',
  secondary: '#2f6a3c',
  'on-tertiary-container': '#76231b',
  'surface-bright': '#f9f9ff',
  'on-tertiary': '#ffffff',
  'surface-tint': '#006e2f',
  'on-primary-container': '#004b1e',
  'secondary-fixed-dim': '#96d59d',
  'secondary-fixed': '#b2f2b7',
  'surface-container-highest': '#d8e3fb',
  'on-surface-variant': '#3d4a3d',
  'inverse-primary': '#4ae176',
  'surface-container-high': '#dee8ff',
  tertiary: '#9e4036',
  'on-tertiary-fixed': '#410001',
  'on-error-container': '#93000a',
  'on-primary-fixed-variant': '#005321',
  'outline-variant': '#bccbb9',
  'secondary-container': '#afefb4',
  'surface-container-low': '#f0f3ff',
  'surface-dim': '#cfdaf2',
  background: '#f9f9ff',
  'tertiary-container': '#ff8b7c',
  'tertiary-fixed-dim': '#ffb4a9',
  'on-primary': '#ffffff',
  'surface-container': '#e7eeff',
  'error-container': '#ffdad6',
  'tertiary-fixed': '#ffdad5',
  'on-tertiary-fixed-variant': '#7f2a21',
  'on-background': '#111c2d',
  outline: '#6d7b6c',
  'primary-fixed-dim': '#4ae176',
  'primary-fixed': '#6bff8f',
};

const css = (v: string) => COLORS[v as keyof typeof COLORS] ?? v;

// ─── Inline Global Styles ────────────────────────────────────────────────────

const globalStyle = `
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    vertical-align: middle;
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
    -webkit-font-feature-settings: 'liga';
    font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }
  .glass-effect {
    backdrop-filter: blur(24px);
    background-color: rgba(255,255,255,0.8);
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: ${css('background')}; font-family: 'Inter', sans-serif; color: ${css('on-surface')}; }
  a { text-decoration: none; }
`;

// ─── Reusable Atoms ──────────────────────────────────────────────────────────

function Icon({ name, style }: { name: string; style?: React.CSSProperties }) {
  return (
    <span className="material-symbols-outlined" style={style}>
      {name}
    </span>
  );
}

// ─── Room Summary Card ────────────────────────────────────────────────────────

function RoomSummaryCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Main Card */}
      <div
        style={{
          backgroundColor: css('surface-container-lowest'),
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: `1px solid rgba(188,203,185,0.1)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Badge */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <span
            style={{
              backgroundColor: css('primary-container'),
              color: css('on-primary-container'),
              fontSize: '0.625rem',
              fontWeight: 700,
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Tersedia
          </span>
        </div>

        {/* Room Image */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5p0yhL0wrIhl76Qng8fHgoF5-MDldIbCh91Tsfeyiye5dSg-2i8Jye69m1aDDLjjxq5OZI5QBx1sgf62GuBbRKQAwupoMi5KtdAKbLzHloy_grZip8PC2xY_XwDNQ58138g7TjIFqIcICaMuyksrCtImVoIXEJDtw8jM00mYbpXqMtfzI2Vim9Ox8ApOVilG2XgnUTH4rrrxiwPxmwDA1zqXe-L1tcCVKaP6pLoaztIpKLwRUrJ-QW0snz0biDcYSw-Bi7MhYRn9Q"
          alt="Kamar Exclusive Plus"
          style={{
            width: '100%',
            height: '12rem',
            objectFit: 'cover',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        />

        <h2
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: css('on-surface'),
            letterSpacing: '-0.025em',
            marginBottom: '0.25rem',
          }}
        >
          Kamar Exclusive Plus
        </h2>

        <p
          style={{
            color: css('primary'),
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '1rem',
          }}
        >
          <Icon name="location_on" style={{ fontSize: '0.875rem' }} />
          Cabang Margonda
        </p>

        {/* Details */}
        <div
          style={{
            borderTop: `1px solid ${css('surface-container')}`,
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: css('on-surface-variant') }}>Fasilitas</span>
            <span style={{ fontWeight: 600, color: css('on-surface') }}>AC, WiFi, Kamar Mandi Dalam</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: css('on-surface-variant') }}>Ukuran</span>
            <span style={{ fontWeight: 600, color: css('on-surface') }}>4 x 4 Meter</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
            <span style={{ color: css('on-surface-variant'), fontWeight: 500 }}>Harga / Bulan</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: css('primary') }}>Rp 2.250.000</span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div
        style={{
          backgroundColor: css('surface-container-low'),
          borderRadius: '0.75rem',
          padding: '1.5rem',
        }}
      >
        <h3
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 700,
            fontSize: '1.125rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Icon name="info" style={{ color: css('primary') }} />
          Informasi Sewa
        </h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: css('on-surface-variant') }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Icon name="check_circle" style={{ fontSize: '0.875rem', marginTop: '2px' }} />
            Minimal sewa 3 bulan untuk mendapatkan harga promo.
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Icon name="check_circle" style={{ fontSize: '0.875rem', marginTop: '2px' }} />
            Deposit awal Rp 500.000 (dikembalikan saat selesai sewa).
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────

function InputField({
  label,
  type = 'text',
  placeholder,
  children,
}: {
  label: React.ReactNode;
  type?: string;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: css('surface-container-low'),
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    color: css('on-surface'),
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'background-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: css('on-surface-variant'),
          marginLeft: '0.25rem',
        }}
      >
        {label}
      </label>
      {children ?? (
        <input
          type={type}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={e => {
            e.currentTarget.style.boxShadow = `0 0 0 2px ${css('primary')}`;
            e.currentTarget.style.backgroundColor = css('surface-container-lowest');
          }}
          onBlur={e => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.backgroundColor = css('surface-container-low');
          }}
        />
      )}
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────

function SelectField({
  label,
  options,
  note,
  labelSuffix,
}: {
  label: string;
  options: string[];
  note?: string;
  labelSuffix?: React.ReactNode;
}) {
  const selectStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: css('surface-container-low'),
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    color: css('on-surface'),
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9375rem',
    outline: 'none',
    appearance: 'auto',
    transition: 'background-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: css('on-surface-variant'),
          marginLeft: '0.25rem',
        }}
      >
        {label}
        {labelSuffix}
      </label>
      <select
        style={selectStyle}
        onFocus={e => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${css('primary')}`;
          e.currentTarget.style.backgroundColor = css('surface-container-lowest');
        }}
        onBlur={e => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.backgroundColor = css('surface-container-low');
        }}
      >
        {options.map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
      {note && (
        <p style={{ fontSize: '0.625rem', color: `${css('on-surface-variant')}cc`, fontStyle: 'italic', padding: '0 0.25rem', lineHeight: 1.3 }}>
          {note}
        </p>
      )}
    </div>
  );
}

// ─── Upload Box ───────────────────────────────────────────────────────────────

function UploadBox({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{ position: 'relative', cursor: 'pointer' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: css('on-surface-variant'),
          marginBottom: '0.5rem',
          marginLeft: '0.25rem',
        }}
      >
        {label}
      </label>
      <div
        style={{
          border: `2px dashed rgba(188,203,185,0.4)`,
          borderRadius: '0.75rem',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '0.75rem',
          backgroundColor: css('surface-container-low'),
          transition: 'background-color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = css('surface-container');
          el.style.borderColor = `${css('primary')}66`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.backgroundColor = css('surface-container-low');
          el.style.borderColor = 'rgba(188,203,185,0.4)';
        }}
      >
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '9999px',
            backgroundColor: `${css('primary')}1a`,
            color: css('primary'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <Icon name={icon} style={{ fontSize: '1.875rem' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: css('on-surface') }}>
            Pilih File {label.split(' ').slice(-1)[0]}
          </p>
          <p style={{ fontSize: '0.625rem', color: css('on-surface-variant'), textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PNG, JPG up to 5MB
          </p>
        </div>
        <input type="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
      </div>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

function RentalForm() {
  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'Manrope, sans-serif',
    fontWeight: 700,
    fontSize: '1.25rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: `1px solid ${css('surface-container')}`,
    paddingBottom: '0.5rem',
  };

  return (
    <div
      style={{
        backgroundColor: css('surface-container-lowest'),
        borderRadius: '0.75rem',
        padding: 'clamp(1.5rem, 5vw, 2.5rem)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: `1px solid rgba(188,203,185,0.1)`,
      }}
    >
      <h1
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
          fontWeight: 800,
          color: css('on-surface'),
          letterSpacing: '-0.025em',
          marginBottom: '0.5rem',
        }}
      >
        Formulir Pengajuan Sewa
      </h1>
      <p style={{ color: css('on-surface-variant'), marginBottom: '2.5rem' }}>
        Lengkapi data diri Anda untuk memulai perjalanan hunian yang nyaman di KosHandayani.
      </p>

      <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Personal Info */}
        <section>
          <h3 style={sectionTitleStyle}>
            <Icon name="person" style={{ color: css('primary') }} />
            Data Pribadi
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))',
              gap: '1.5rem',
            }}
          >
            <InputField label="Nama Lengkap (Sesuai KTP)" placeholder="Contoh: Budi Santoso" />
            <InputField label="Nomor WhatsApp" type="tel" placeholder="0812xxxxxx" />
            <InputField label="Email Aktif" type="email" placeholder="email@domain.com" />
            <SelectField
              label="Pekerjaan"
              options={['Mahasiswa', 'Karyawan Swasta', 'PNS', 'Wiraswasta', 'Lainnya']}
            />
            <SelectField
              label="Durasi Sewa"
              options={['1 Bulan', '3 Bulan', '6 Bulan', '12 Bulan']}
              note="* Pembayaran durasi sewa yang dipilih bersifat non-refundable."
              labelSuffix={
                <Icon
                  name="info"
                  style={{ fontSize: '1rem', color: css('primary'), cursor: 'help' }}
                />
              }
            />
          </div>
        </section>

        {/* Document Uploads */}
        <section>
          <h3 style={sectionTitleStyle}>
            <Icon name="upload_file" style={{ color: css('primary') }} />
            Unggah Dokumen
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 18rem), 1fr))',
              gap: '1.5rem',
            }}
          >
            <UploadBox label="Foto KTP" icon="badge" />
            <UploadBox label="Foto Kartu Keluarga (KK)" icon="family_history" />
          </div>
        </section>

        {/* Terms */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: css('surface-container-low'),
          }}
        >
          <input
            id="terms"
            type="checkbox"
            style={{
              marginTop: '2px',
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '0.25rem',
              accentColor: css('primary'),
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          <label
            htmlFor="terms"
            style={{ fontSize: '0.875rem', color: css('on-surface-variant'), lineHeight: 1.6, cursor: 'pointer' }}
          >
            Saya menyetujui{' '}
            <a href="#" style={{ color: css('primary'), fontWeight: 700 }}>
              Syarat &amp; Ketentuan
            </a>{' '}
            serta{' '}
            <a href="#" style={{ color: css('primary'), fontWeight: 700 }}>
              Kebijakan Privasi
            </a>{' '}
            yang berlaku di KosHandayani. Saya menyatakan bahwa data yang saya berikan adalah benar.
          </label>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1rem',
          }}
        >
          <button
            type="button"
            style={{
              padding: '0.75rem 2rem',
              color: css('on-surface-variant'),
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9375rem',
              width: 'auto',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = css('surface-container-high'))}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}
          >
            Batal
          </button>
          <button
            type="submit"
            style={{
              padding: '1rem 2.5rem',
              background: `linear-gradient(to right, ${css('primary')}, ${css('primary-container')})`,
              color: css('on-primary'),
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9375rem',
              boxShadow: `0 8px 20px rgba(0,110,47,0.2)`,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
            onMouseDown={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)')}
            onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)')}
          >
            Kirim Pengajuan
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        width: '100%',
        padding: '2rem',
        marginTop: 'auto',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.75rem',
        color: '#64748b',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map(link => (
          <a
            key={link}
            href="#"
            style={{ color: '#94a3b8', transition: 'color 0.2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#475569')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8')}
          >
            {link}
          </a>
        ))}
      </div>
      <p>© 2024 KosHandayani. Digital Concierge Property Management.</p>
    </footer>
  );
}

// ─── Page Root ────────────────────────────────────────────────────────────────

export default function Page() {
  useEffect(() => {
    // Inject Google Fonts & Material Symbols links
    const links = [GOOGLE_FONTS_URL, MATERIAL_SYMBOLS_URL].map(href => {
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) return existing;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    // Set page title
    document.title = 'Form Pengajuan Sewa - KosHandayani';

    return () => {
      links.forEach(l => l?.remove());
    };
  }, []);

  return (
    <>
      <style>{globalStyle}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: css('background'),
          fontFamily: 'Inter, sans-serif',
          color: css('on-surface'),
        }}
      >
        <Navbar />

        <main
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: 'clamp(2rem, 6vw, 4rem) 1.5rem',
            width: '100%',
            flex: 1,
          }}
        >
          {/* Responsive two-column layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 22rem), 1fr))',
              gap: '2.5rem',
              alignItems: 'start',
            }}
            className="page-grid"
          >
            {/* Left column: Room summary — stacks first on mobile via order */}
            <div className="room-col">
              <RoomSummaryCard />
            </div>

            {/* Right column: Form */}
            <div className="form-col">
              <RentalForm />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Responsive grid overrides */}
      <style>{`
        @media (min-width: 1024px) {
          .page-grid {
            grid-template-columns: 1fr 2fr !important;
          }
        }
        @media (max-width: 640px) {
          button[type="submit"], button[type="button"] {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
