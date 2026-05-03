'use client';
import { useState } from 'react';

// Inject Google Fonts and Material Symbols into document head
const fontLink1 = document.createElement('link');
fontLink1.rel = 'stylesheet';
fontLink1.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap';
document.head.appendChild(fontLink1);

const fontLink2 = document.createElement('link');
fontLink2.rel = 'stylesheet';
fontLink2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
document.head.appendChild(fontLink2);

// Inject global styles
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  :root {
    --color-on-error: #ffffff;
    --color-on-primary-fixed: #002109;
    --color-on-background: #111c2d;
    --color-surface-variant: #d8e3fb;
    --color-inverse-on-surface: #ecf1ff;
    --color-tertiary: #9e4036;
    --color-on-surface: #111c2d;
    --color-outline-variant: #bccbb9;
    --color-on-error-container: #93000a;
    --color-surface-container-high: #dee8ff;
    --color-on-secondary-container: #346e40;
    --color-secondary-fixed: #b2f2b7;
    --color-tertiary-fixed-dim: #ffb4a9;
    --color-tertiary-container: #ff8b7c;
    --color-outline: #6d7b6c;
    --color-on-tertiary: #ffffff;
    --color-error: #ba1a1a;
    --color-secondary-fixed-dim: #96d59d;
    --color-on-tertiary-container: #76231b;
    --color-on-secondary-fixed: #002109;
    --color-on-primary-container: #004b1e;
    --color-surface-tint: #006e2f;
    --color-background: #f9f9ff;
    --color-secondary-container: #afefb4;
    --color-secondary: #2f6a3c;
    --color-primary-container: #22c55e;
    --color-surface-container-highest: #d8e3fb;
    --color-surface-bright: #f9f9ff;
    --color-primary-fixed: #6bff8f;
    --color-on-surface-variant: #3d4a3d;
    --color-surface-dim: #cfdaf2;
    --color-on-tertiary-fixed: #410001;
    --color-error-container: #ffdad6;
    --color-tertiary-fixed: #ffdad5;
    --color-surface-container-lowest: #ffffff;
    --color-on-primary-fixed-variant: #005321;
    --color-primary-fixed-dim: #4ae176;
    --color-surface-container: #e7eeff;
    --color-primary: #006e2f;
    --color-inverse-primary: #4ae176;
    --color-on-secondary: #ffffff;
    --color-on-tertiary-fixed-variant: #7f2a21;
    --color-inverse-surface: #263143;
    --color-surface-container-low: #f0f3ff;
    --color-surface: #f9f9ff;
    --color-on-secondary-fixed-variant: #145126;
    --color-on-primary: #ffffff;
  }

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
    font-feature-settings: 'liga';
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--color-background);
    color: var(--color-on-background);
    min-height: 100vh;
  }

  h1, h2, h3, .headline {
    font-family: 'Manrope', sans-serif;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }

  .page-bg { background-color: #f9f9ff; }
  .sidebar-bg { background-color: #f8fafc; }

  .nav-active {
    background-color: #f0fdf4;
    color: #15803d;
    font-weight: 600;
  }

  .text-primary { color: var(--color-primary); }
  .text-on-surface { color: var(--color-on-surface); }
  .text-on-surface-variant { color: var(--color-on-surface-variant); }
  .text-tertiary { color: var(--color-tertiary); }
  .text-on-primary { color: var(--color-on-primary); }
  .bg-primary { background-color: var(--color-primary); }
  .bg-background { background-color: var(--color-background); }
  .bg-surface { background-color: var(--color-surface); }
  .bg-surface-container-lowest { background-color: var(--color-surface-container-lowest); }
  .bg-surface-container-low { background-color: var(--color-surface-container-low); }
  .bg-surface-container { background-color: var(--color-surface-container); }
  .bg-surface-container-high { background-color: var(--color-surface-container-high); }
  .bg-surface-container-highest { background-color: var(--color-surface-container-highest); }
  .bg-tertiary-container { background-color: var(--color-tertiary-container); }
  .border-outline-variant { border-color: var(--color-outline-variant); }
  .border-primary { border-color: var(--color-primary); }
  .border-surface-container-high { border-color: var(--color-surface-container-high); }

  .gradient-btn {
    background: linear-gradient(to right, var(--color-primary), var(--color-primary-container));
  }
`;
document.head.appendChild(style);

// ─── Data ─────────────────────────────────────────────────────────────────────

const navItems = [
  { icon: 'home', label: 'Dashboard', active: false },
  { icon: 'door_front', label: 'Kamar Saya', active: false },
  { icon: 'request_quote', label: 'Tagihan', active: true },
  { icon: 'history', label: 'Riwayat', active: false },
  { icon: 'account_circle', label: 'Profil', active: false },
];

const billItems = [
  { label: 'Sewa Kamar 204', amount: 'Rp 2.100.000' },
  { label: 'Biaya Kebersihan & Wifi', amount: 'Rp 150.000' },
  { label: 'Biaya Layanan', amount: 'Gratis', isGratis: true },
];

const paymentMethods = [
  { icon: 'account_balance', label: 'Transfer Bank' },
  { icon: 'smartphone', label: 'E-Wallet' },
  { icon: 'qr_code_2', label: 'QRIS' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const Icon = ({
  name,
  className = '',
  filled = false,
  style: extraStyle = {},
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: filled
        ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
        : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      ...extraStyle,
    }}
  >
    {name}
  </span>
);

function Sidebar() {
  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '16rem',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        borderRight: 'none',
        zIndex: 40,
      }}
      className="hidden-mobile"
    >
      <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.05em',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          KosHandayani
        </h1>
        <p
          style={{
            fontSize: '0.625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#94a3b8',
            fontWeight: 700,
          }}
        >
          Tenant Area
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: item.active ? 600 : 500,
              transition: 'all 0.15s',
              transform: 'scale(0.95)',
              textDecoration: 'none',
              ...(item.active
                ? {
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                  }
                : {
                    color: '#64748b',
                  }),
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon name={item.icon} filled={item.active} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: '0.75rem',
        }}
      >
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '9999px',
            backgroundColor: '#dee8ff',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxHlmogJT2E4aPWpZrwi8tDGS-f5SPJOAG6IzqDRlvMsTCf6v9mOSeE_oQx7sSj5ku0MZ5UPQ_sW9O1mQK5NfHnbjiHuW8CgV9oUiFi72IKkb9_R0E6kfEpQG97bCp-_WCZaTQGvd4W6CIpZu94A8zInMrCVeqHDcQG3ciZk2Rd1jAXSIH3dOzJkyHGwkzi6KFQR52Y5OnRWDNF_E_lW83OR3_AVyV_pcq_leeRnMUllzNgjyZIa_gGN3UU90HBQsJhj8NDyLGgTbT"
            alt="Budi Santoso"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Budi Santoso
          </p>
          <p style={{ fontSize: '0.625rem', color: '#3d4a3d' }}>Kamar 204 • Emerald</p>
        </div>
      </div>
    </aside>
  );
}

function BillSummaryCard() {
  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '2rem',
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      >
        <Icon name="receipt_long" style={{ fontSize: '6rem' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2.5rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: 'rgba(255,139,124,0.2)',
                color: '#9e4036',
                fontSize: '0.625rem',
                fontWeight: 700,
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
              }}
            >
              Menunggu Pembayaran
            </span>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#111c2d',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              Sewa Bulan September
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#3d4a3d' }}>Periode: 1 Sep - 30 Sep 2024</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#3d4a3d' }}>Total Tagihan</p>
            <p
              style={{
                fontSize: '1.875rem',
                fontWeight: 900,
                color: '#006e2f',
                letterSpacing: '-0.05em',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              Rp 2.250.000
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: '#f0f3ff',
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            <p
              style={{
                fontSize: '0.625rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#3d4a3d',
                marginBottom: '0.25rem',
              }}
            >
              Jatuh Tempo
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9e4036' }}>
              <Icon name="event" style={{ fontSize: '1.125rem' }} />
              <span style={{ fontWeight: 700 }}>5 Sept 2024</span>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#f0f3ff',
              padding: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            <p
              style={{
                fontSize: '0.625rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#3d4a3d',
                marginBottom: '0.25rem',
              }}
            >
              ID Transaksi
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111c2d' }}>
              <Icon name="fingerprint" style={{ fontSize: '1.125rem' }} />
              <span style={{ fontWeight: 700 }}>INV-928374-24</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentMethodSection() {
  const [selected, setSelected] = useState(0);

  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      }}
    >
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'Manrope, sans-serif',
          color: '#111c2d',
        }}
      >
        <Icon name="account_balance_wallet" style={{ color: '#006e2f' }} />
        Pilih Metode Pembayaran
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#3d4a3d',
              marginBottom: '0.5rem',
            }}
          >
            Opsi Pembayaran
          </label>
          <div style={{ position: 'relative' }}>
            <select
              style={{
                width: '100%',
                backgroundColor: '#f0f3ff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '1rem 3rem 1rem 1.25rem',
                appearance: 'none',
                color: '#111c2d',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                cursor: 'pointer',
                outline: 'none',
              }}
              onChange={(e) => setSelected(parseInt(e.target.value))}
            >
              <option value={0}>Transfer Bank (BCA, Mandiri, BNI)</option>
              <option value={1}>E-Wallet (OVO, GoPay, Dana)</option>
              <option value={2}>QRIS (Scan Barcode)</option>
            </select>
            <div
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <Icon name="expand_more" />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {paymentMethods.map((method, idx) => (
            <div
              key={method.label}
              onClick={() => setSelected(idx)}
              style={{
                border: `2px solid ${selected === idx ? '#006e2f' : '#dee8ff'}`,
                backgroundColor: selected === idx ? 'rgba(0,110,47,0.05)' : '#ffffff',
                padding: '1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: selected === idx ? 1 : 0.6,
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (selected !== idx) {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (selected !== idx) {
                  (e.currentTarget as HTMLElement).style.opacity = '0.6';
                }
              }}
            >
              <Icon
                name={method.icon}
                style={{ color: selected === idx ? '#006e2f' : '#111c2d' }}
              />
              <span style={{ fontSize: '0.625rem', fontWeight: 700 }}>{method.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConfirmationSidebar() {
  return (
    <div style={{ position: 'sticky', top: '2rem' }}>
      <section
        style={{
          backgroundColor: '#f0f3ff',
          borderRadius: '0.75rem',
          padding: '2rem',
          border: '1px solid #ffffff',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '2rem',
            fontFamily: 'Manrope, sans-serif',
            color: '#111c2d',
          }}
        >
          Ringkasan Konfirmasi
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '2.5rem' }}>
          {billItems.map((item, idx) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: idx < billItems.length - 1 ? '1px solid rgba(188,203,185,0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: '#3d4a3d' }}>{item.label}</span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: item.isGratis ? '#006e2f' : '#111c2d',
                }}
              >
                {item.amount}
              </span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
            }}
          >
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111c2d', fontFamily: 'Manrope, sans-serif' }}>
              Total Bayar
            </span>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#111c2d',
                letterSpacing: '-0.05em',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              Rp 2.250.000
            </span>
          </div>
        </div>

        <button
          style={{
            width: '100%',
            background: 'linear-gradient(to right, #006e2f, #22c55e)',
            color: '#ffffff',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            fontWeight: 700,
            fontSize: '1.125rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,110,47,0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          <Icon name="security" filled />
          Bayar Sekarang
        </button>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(255,255,255,0.4)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <Icon name="verified_user" style={{ color: '#006e2f', fontSize: '1.25rem', flexShrink: 0 }} />
          <p
            style={{
              fontSize: '0.6875rem',
              lineHeight: 1.6,
              color: '#3d4a3d',
            }}
          >
            Pembayaran Anda dilindungi oleh sistem keamanan 256-bit SSL. Struk digital akan diterbitkan otomatis setelah verifikasi.
          </p>
        </div>
      </section>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(216,227,251,0.3)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111c2d' }}>Butuh Bantuan?</p>
          <p style={{ fontSize: '0.625rem', color: '#3d4a3d' }}>Hubungi Digital Concierge kami</p>
        </div>
        <button
          style={{
            backgroundColor: '#ffffff',
            padding: '0.75rem',
            borderRadius: '9999px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <Icon name="support_agent" style={{ color: '#006e2f' }} />
        </button>
      </div>
    </div>
  );
}

function MobileNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
      }}
      className="show-mobile"
    >
      <button
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#64748b',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Icon name="home" />
        <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>Beranda</span>
      </button>

      <button
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#006e2f',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Icon name="request_quote" filled />
        <span style={{ fontSize: '0.625rem', fontWeight: 700 }}>Tagihan</span>
      </button>

      <div style={{ marginTop: '-2.5rem' }}>
        <button
          style={{
            width: '3.5rem',
            height: '3.5rem',
            backgroundColor: '#006e2f',
            color: '#ffffff',
            borderRadius: '9999px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="add" />
        </button>
      </div>

      <button
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#64748b',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Icon name="history" />
        <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>Riwayat</span>
      </button>

      <button
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          color: '#64748b',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Icon name="account_circle" />
        <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>Profil</span>
      </button>
    </nav>
  );
}

// ─── Responsive styles injected ───────────────────────────────────────────────
const responsiveStyle = document.createElement('style');
responsiveStyle.textContent = `
  .hidden-mobile {
    display: flex;
  }
  .show-mobile {
    display: none;
  }
  .main-content {
    margin-left: 16rem;
    padding: 3rem;
  }
  .bento-grid {
    display: grid;
    grid-template-columns: 7fr 5fr;
    gap: 2rem;
    align-items: start;
  }
  @media (max-width: 768px) {
    .hidden-mobile {
      display: none !important;
    }
    .show-mobile {
      display: flex !important;
    }
    .main-content {
      margin-left: 0;
      padding: 1.5rem;
      padding-bottom: 6rem;
    }
    .bento-grid {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(responsiveStyle);

// ─── Page Component ────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <div style={{ backgroundColor: '#f9f9ff', minHeight: '100vh', color: '#111c2d' }}>
      <Sidebar />

      <main className="main-content" style={{ maxWidth: '80rem', marginRight: 'auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '3rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#006e2f',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            <Icon name="arrow_back" style={{ fontSize: '0.875rem' }} />
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Kembali ke Dashboard
            </span>
          </div>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#111c2d',
              marginBottom: '0.5rem',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            Pembayaran Sewa
          </h2>
          <p
            style={{
              color: '#3d4a3d',
              maxWidth: '32rem',
              lineHeight: 1.6,
            }}
          >
            Selesaikan pembayaran Anda sebelum jatuh tempo untuk kenyamanan layanan Digital Concierge kami.
          </p>
        </header>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <BillSummaryCard />
            <PaymentMethodSection />
          </div>

          {/* Right Column */}
          <ConfirmationSidebar />
        </div>

        {/* Footer */}
        <footer
          style={{
            width: '100%',
            paddingTop: '3rem',
            paddingBottom: '3rem',
            marginTop: '5rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#64748b' }}>
            © 2024 KosHandayani. Digital Concierge Property Management.
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#475569';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </footer>
      </main>

      <MobileNav />
    </div>
  );
}
