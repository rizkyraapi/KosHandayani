'use client';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/* ─── Inject Google Fonts + Material Symbols into <head> ─── */
function useGlobalStyles() {
  useEffect(() => {
    // Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap';
    document.head.appendChild(fontLink);

    // Material Symbols
    const iconLink = document.createElement('link');
    iconLink.rel = 'stylesheet';
    iconLink.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(iconLink);

    // Base CSS
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --color-primary: #006e2f;
        --color-on-primary: #ffffff;
        --color-primary-container: #22c55e;
        --color-on-primary-container: #004b1e;
        --color-primary-fixed: #6bff8f;
        --color-primary-fixed-dim: #4ae176;
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
        --color-error: #ba1a1a;
        --color-on-error: #ffffff;
        --color-error-container: #ffdad6;
        --color-on-error-container: #93000a;
        --color-background: #f9f9ff;
        --color-on-background: #111c2d;
        --color-surface: #f9f9ff;
        --color-on-surface: #111c2d;
        --color-surface-variant: #d8e3fb;
        --color-on-surface-variant: #3d4a3d;
        --color-surface-bright: #f9f9ff;
        --color-surface-dim: #cfdaf2;
        --color-surface-container-lowest: #ffffff;
        --color-surface-container-low: #f0f3ff;
        --color-surface-container: #e7eeff;
        --color-surface-container-high: #dee8ff;
        --color-surface-container-highest: #d8e3fb;
        --color-outline: #6d7b6c;
        --color-outline-variant: #bccbb9;
        --color-inverse-surface: #263143;
        --color-inverse-on-surface: #ecf1ff;
        --color-inverse-primary: #4ae176;
        --color-surface-tint: #006e2f;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html { scroll-behavior: smooth; }

      body {
        font-family: 'Inter', sans-serif;
        background-color: var(--color-background);
        color: var(--color-on-surface);
        min-height: 100vh;
      }

      h1, h2, h3 { font-family: 'Manrope', sans-serif; }

      .material-symbols-outlined {
        font-family: 'Material Symbols Outlined';
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        font-style: normal;
        font-weight: normal;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
      }

      /* Tailwind-like utility classes used in this page */
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);

    // Page title
    document.title = 'Owner Dashboard - KosHandayani';

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(iconLink);
      document.head.removeChild(style);
    };
  }, []);
}

/* ─── Design Tokens ─── */
const colors = {
  primary: '#006e2f',
  onPrimary: '#ffffff',
  primaryContainer: '#22c55e',
  onPrimaryContainer: '#004b1e',
  primaryFixedDim: '#4ae176',
  secondary: '#2f6a3c',
  onSecondary: '#ffffff',
  secondaryContainer: '#afefb4',
  onSecondaryContainer: '#346e40',
  tertiary: '#9e4036',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ff8b7c',
  onTertiaryContainer: '#76231b',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  background: '#f9f9ff',
  onBackground: '#111c2d',
  surface: '#f9f9ff',
  onSurface: '#111c2d',
  surfaceVariant: '#d8e3fb',
  onSurfaceVariant: '#3d4a3d',
  surfaceBright: '#f9f9ff',
  surfaceDim: '#cfdaf2',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fb',
  outline: '#6d7b6c',
  outlineVariant: '#bccbb9',
  inverseSurface: '#263143',
  inverseOnSurface: '#ecf1ff',
  inversePrimary: '#4ae176',
};

/* ─── Icon helper ─── */
const Icon = ({ name, style }: { name: string; style?: React.CSSProperties }) => (
  <span className="material-symbols-outlined" style={style}>
    {name}
  </span>
);

/* ─── Sidebar ─── */
const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'bed', label: 'Data Kamar' },
  { icon: 'group', label: 'Data Penyewa' },
  { icon: 'payments', label: 'Tagihan' },
  { icon: 'receipt_long', label: '' },
  { icon: 'analytics', label: 'Laporan' },
];

function Sidebar() {
  const { logout, isLoading } = useAuth();

  return (
    <nav
      style={{
        width: 256,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        gap: 8,
        borderRight: 'none',
        zIndex: 40,
      }}
      className="sidebar-desktop"
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, padding: '0 8px' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
          KosHandayani
        </div>
        <p
          style={{
            fontSize: 11,
            color: '#64748b',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          Owner Dashboard
        </p>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {navItems.map((item, i) => (
          <a
            key={i}
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: item.active ? 600 : 400,
              color: item.active ? '#15803d' : '#64748b',
              backgroundColor: item.active ? '#dcfce7' : 'transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9';
                (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
              }
            }}
          >
            <Icon name={item.icon} />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div style={{ paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
        <button
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'rgba(226,232,240,0.5)',
            border: 'none',
            borderRadius: 12,
            color: '#334155',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            marginBottom: 16,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span>Semua Cabang</span>
          <Icon name="unfold_more" style={{ fontSize: 18 }} />
        </button>
        <button
          type="button"
          onClick={logout}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: '12px 16px',
            color: '#64748b',
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            transition: 'background-color 0.2s',
            fontSize: 14,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
        >
          <Icon name="logout" />
          <span style={{ fontFamily: 'Inter, sans-serif' }}>Logout</span>
        </button>
      </div>
    </nav>
  );
}

/* ─── Header ─── */
function Header() {
  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 40,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: colors.onSurface,
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          Ringkasan Properti
        </h1>
        <p style={{ color: colors.onSurfaceVariant, fontWeight: 500, marginTop: 4 }}>
          Selamat datang kembali, Pak Handayani.
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            backgroundColor: colors.surfaceContainerHigh,
            padding: '8px 16px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            className="animate-pulse"
            style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.primary }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.primary }}>Cabang 1: Aktif</span>
        </div>
        <img
          alt="Owner Avatar"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOAlhowiOCwfAGxtruf7iuxgxt6ZSUg6sUFNwtyXIeNxK70pJvtiGv88Pfhwr19JeEbCI7A8s0TN-IwKu1WV2tg3aUpKgjuyCNTL1pJmjiR16So7mYEwKa_9GHtoxZHTX7o8Q_yBctb5fLmFjACHKc9vT46FaD6S0hCoWDzJ_TbkQ9JFy6mKE5JOPushv9UhQUiv1TFTXKF3uY98vh_dYBv5dC0lwxZLnICXBlSBEjLjPC_OQrGceI-bE95UN-E8hlYsiwvUUPWaCn"
        />
      </div>
    </header>
  );
}

/* ─── Bento Stats ─── */
function StatsRow() {
  const barHeights = ['40%', '60%', '50%', '80%', '70%', '95%'];

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
        marginBottom: 32,
      }}
      className="stats-grid"
    >
      {/* Room Summary */}
      <div
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(17,28,45,0.04)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 192,
        }}
        className="card-hover"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.onSurfaceVariant,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              Status Kamar
            </p>
            <h3 style={{ fontSize: 36, fontWeight: 800, color: colors.onSurface, fontFamily: 'Manrope, sans-serif' }}>
              48{' '}
              <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>Total</span>
            </h3>
          </div>
          <div
            style={{
              padding: 12,
              backgroundColor: colors.secondaryContainer,
              borderRadius: 8,
              color: colors.onSecondaryContainer,
            }}
          >
            <Icon name="bed" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: colors.primary, display: 'inline-block' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>43 Terisi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'inline-block' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>5 Kosong</span>
          </div>
        </div>
        {/* Decorative bg */}
        <div style={{ position: 'absolute', right: -16, bottom: -16, opacity: 0.05 }}>
          <Icon name="apartment" style={{ fontSize: 96 }} />
        </div>
      </div>

      {/* Pemasukan */}
      <div
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(17,28,45,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 192,
          borderLeft: `4px solid ${colors.primary}`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="trending_up" style={{ color: colors.primary, fontSize: 18 }} />
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.onSurfaceVariant,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Total Pemasukan
            </p>
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: colors.onSurface, fontFamily: 'Manrope, sans-serif' }}>
            Rp 92.500.000
          </h3>
          <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, marginTop: 4 }}>+12% dari bulan lalu</p>
        </div>
        <div
          style={{
            width: '100%',
            backgroundColor: '#f8fafc',
            height: 48,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
            padding: '0 8px 4px',
            overflow: 'hidden',
          }}
        >
          {barHeights.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: h,
                backgroundColor: i === barHeights.length - 1 ? colors.primary : `${colors.primary}33`,
                borderRadius: '2px 2px 0 0',
              }}
            />
          ))}
        </div>
      </div>

      {/* Pengeluaran */}
      <div
        style={{
          backgroundColor: colors.surfaceContainerLowest,
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(17,28,45,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 192,
          borderLeft: `4px solid ${colors.tertiary}`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="trending_down" style={{ color: colors.tertiary, fontSize: 18 }} />
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.onSurfaceVariant,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Total Pengeluaran
            </p>
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: colors.onSurface, fontFamily: 'Manrope, sans-serif' }}>
            Rp 12.400.000
          </h3>
          <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>
            Biaya operasional &amp; maintenance
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            backgroundColor: `${colors.tertiary}0d`,
            borderRadius: 8,
            border: `1px solid ${colors.tertiary}1a`,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.tertiary }}>Tagihan Listrik &amp; Air</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: colors.tertiary }}>80%</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Branch Stats ─── */
const branches = [
  {
    name: 'Cabang 1 - Emerald Residence',
    detail: '24 Kamar · Jakarta Selatan',
    pct: 92,
    income: 'Rp 48.000.000',
    expense: 'Rp 5.200.000',
  },
  {
    name: 'Cabang 2 - Sapphire Suites',
    detail: '24 Kamar · Jakarta Pusat',
    pct: 87,
    income: 'Rp 44.500.000',
    expense: 'Rp 7.200.000',
  },
];

function BranchStats() {
  return (
    <div
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 12px 40px rgba(17,28,45,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.025em', fontFamily: 'Manrope, sans-serif' }}>
          Statistik Per Cabang
        </h3>
        <button
          style={{
            color: colors.primary,
            fontSize: 14,
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
        >
          Lihat Detail
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {branches.map((b, i) => (
          <div key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: 12,
              }}
            >
              <div>
                <h4 style={{ fontWeight: 700, color: colors.onSurface }}>{b.name}</h4>
                <p style={{ fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 }}>{b.detail}</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: colors.primary }}>{b.pct}% Terisi</span>
            </div>
            <div
              style={{
                width: '100%',
                height: 12,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: 9999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${b.pct}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 9999,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Pemasukan: {b.income}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Pengeluaran: {b.expense}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Activity Feed ─── */
const activities = [
  {
    icon: 'check_circle',
    iconBg: '#f0fdf4',
    iconColor: colors.primary,
    title: 'Pembayaran Diterima - Kamar 102',
    sub: 'Oleh Budi Setiawan · Cabang 1',
    time: 'Tadi',
  },
  {
    icon: 'warning',
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    title: 'Laporan Kerusakan - Kamar 205',
    sub: 'AC Tidak Dingin · Cabang 2',
    time: '2 jam lalu',
  },
];

function ActivityFeed() {
  return (
    <div
      style={{
        backgroundColor: `${colors.surfaceContainerLow}80`,
        borderRadius: 16,
        padding: 32,
        border: '1px solid white',
      }}
    >
      <h3
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          marginBottom: 24,
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        Aktivitas Terkini
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {activities.map((a, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              backgroundColor: colors.surfaceContainerLowest,
              padding: 16,
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: a.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: a.iconColor,
                flexShrink: 0,
              }}
            >
              <Icon name={a.icon} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</p>
              <p style={{ fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 }}>{a.sub}</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Quick Actions ─── */
const quickActions = [
  { icon: 'meeting_room', label: 'Data Kamar' },
  { icon: 'badge', label: 'Penyewa' },
  { icon: 'account_balance_wallet', label: 'Pembayaran' },
  { icon: 'lab_profile', label: 'Laporan' },
];

function QuickActions() {
  return (
    <div
      style={{
        backgroundColor: colors.primary,
        color: colors.onPrimary,
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,110,47,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <h3
        style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, fontFamily: 'Manrope, sans-serif' }}
      >
        Navigasi Cepat
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 24 }}>
        Akses modul utama properti Anda secara instan.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {quickActions.map((a, i) => (
          <button
            key={i}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              color: 'white',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)')
            }
          >
            <Icon name={a.icon} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>{a.label}</span>
          </button>
        ))}
      </div>
      {/* Decorative blur */}
      <div
        style={{
          position: 'absolute',
          right: -40,
          bottom: -40,
          width: 160,
          height: 160,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          filter: 'blur(24px)',
        }}
      />
    </div>
  );
}

/* ─── Occupancy Heatmap ─── */
const rooms = [
  true, true, false, true, true, true,
  true, false, true, true, true, true,
  true, true, true, false, true, true,
  true, true, true, true, true, true,
];

function OccupancyMap() {
  return (
    <div
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        padding: 24,
        borderRadius: 16,
        boxShadow: '0 12px 40px rgba(17,28,45,0.04)',
      }}
    >
      <h4
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 16,
        }}
      >
        Okupansi Kamar
      </h4>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 8,
        }}
      >
        {rooms.map((occupied, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1',
              backgroundColor: occupied ? colors.primary : colors.surfaceContainer,
              borderRadius: 6,
            }}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, backgroundColor: colors.primary, borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Terisi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, backgroundColor: colors.surfaceContainer, borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>Kosong</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Footer ─── */
function Footer() {
  const links = ['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'];
  return (
    <footer
      style={{
        padding: '32px',
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        borderTop: '1px solid rgba(226,232,240,0.15)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
        {links.map((l, i) => (
          <a
            key={i}
            href="#"
            style={{
              color: '#94a3b8',
              fontSize: 12,
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#16a34a')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
          >
            {l}
          </a>
        ))}
      </div>
      <p style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        © 2024 KosHandayani. Digital Concierge Property Management.
      </p>
    </footer>
  );
}

/* ─── Bottom Nav (Mobile) ─── */
const mobileNav = [
  { icon: 'dashboard', label: 'Beranda', active: true },
  { icon: 'bed', label: 'Kamar' },
  { icon: 'payments', label: 'Bayar' },
  { icon: 'account_circle', label: 'Profil' },
];

function BottomNav() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: 16,
        zIndex: 50,
        boxShadow: '0 -10px 20px rgba(0,0,0,0.05)',
      }}
      className="bottom-nav-mobile"
    >
      {mobileNav.map((n, i) => (
        <a
          key={i}
          href="#"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: n.active ? colors.primary : '#94a3b8',
            textDecoration: 'none',
          }}
        >
          <Icon name={n.icon} />
          <span style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{n.label}</span>
        </a>
      ))}
    </div>
  );
}

/* ─── Responsive CSS ─── */
const responsiveCSS = `
  @media (max-width: 767px) {
    .sidebar-desktop { display: none !important; }
    .main-content { margin-left: 0 !important; padding: 24px 16px 96px !important; }
    .footer-content { margin-left: 0 !important; }
    .stats-grid { grid-template-columns: 1fr !important; }
    .secondary-grid { grid-template-columns: 1fr !important; }
    .left-col { grid-column: span 1 !important; }
  }
  @media (min-width: 768px) {
    .bottom-nav-mobile { display: none !important; }
    .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .secondary-grid { grid-template-columns: 1fr !important; }
    .left-col { grid-column: span 1 !important; }
  }
`;

/* ─── Page Root ─── */
export default function Page() {
  useGlobalStyles();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = responsiveCSS;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Sidebar />

      <main
        className="main-content"
        style={{
          marginLeft: 256,
          padding: '40px',
          minHeight: '100vh',
        }}
      >
        <Header />
        <StatsRow />

        {/* Secondary Row */}
        <section
          className="secondary-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 32,
          }}
        >
          {/* Left col */}
          <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <BranchStats />
            <ActivityFeed />
          </div>

          {/* Right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <QuickActions />
            <OccupancyMap />
          </div>
        </section>
      </main>

      <footer
        className="footer-content"
        style={{ marginLeft: 256 }}
      >
        <Footer />
      </footer>

      <BottomNav />
    </>
  );
}
