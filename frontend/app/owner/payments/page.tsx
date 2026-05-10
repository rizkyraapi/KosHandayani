'use client';
import { useState } from 'react';

/* ─── Inject global styles (fonts, material symbols, scrollbar, etc.) ─── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary-fixed-dim: #4ae176;
    --tertiary-fixed: #ffdad5;
    --on-secondary-fixed-variant: #145126;
    --secondary-container: #afefb4;
    --primary: #006e2f;
    --tertiary-container: #ff8b7c;
    --on-primary: #ffffff;
    --outline-variant: #bccbb9;
    --on-error: #ffffff;
    --surface-container-high: #dee8ff;
    --primary-fixed: #6bff8f;
    --outline: #6d7b6c;
    --on-secondary: #ffffff;
    --background: #f9f9ff;
    --surface: #f9f9ff;
    --on-background: #111c2d;
    --surface-container: #e7eeff;
    --secondary-fixed-dim: #96d59d;
    --secondary: #2f6a3c;
    --on-surface-variant: #3d4a3d;
    --inverse-on-surface: #ecf1ff;
    --error: #ba1a1a;
    --on-secondary-fixed: #002109;
    --on-secondary-container: #346e40;
    --tertiary-fixed-dim: #ffb4a9;
    --surface-variant: #d8e3fb;
    --surface-dim: #cfdaf2;
    --surface-bright: #f9f9ff;
    --on-tertiary-fixed-variant: #7f2a21;
    --primary-container: #22c55e;
    --inverse-surface: #263143;
    --on-primary-fixed: #002109;
    --surface-container-lowest: #ffffff;
    --on-primary-fixed-variant: #005321;
    --on-tertiary-fixed: #410001;
    --secondary-fixed: #b2f2b7;
    --on-primary-container: #004b1e;
    --on-surface: #111c2d;
    --on-tertiary: #ffffff;
    --error-container: #ffdad6;
    --surface-container-low: #f0f3ff;
    --inverse-primary: #4ae176;
    --surface-container-highest: #d8e3fb;
    --tertiary: #9e4036;
    --surface-tint: #006e2f;
    --on-tertiary-container: #76231b;
    --on-error-container: #93000a;
  }

  html, body, #root {
    height: 100%;
    font-family: 'Inter', sans-serif;
    background-color: var(--background);
    color: var(--on-background);
  }

  h1, h2, h3, .font-headline {
    font-family: 'Manrope', sans-serif;
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
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    vertical-align: middle;
    -webkit-font-smoothing: antialiased;
  }

  .material-symbols-filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .surface-shift-shadow {
    box-shadow: 0 12px 40px rgba(17, 28, 45, 0.06);
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f0f3ff; }
  ::-webkit-scrollbar-thumb { background: #bccbb9; border-radius: 10px; }

  select { appearance: none; -webkit-appearance: none; }

  @media (max-width: 768px) {
    .sidebar-hidden { display: none; }
    .main-full { margin-left: 0 !important; }
  }
`;

/* ─── Icon component ─── */
function Icon({ name, filled = false, size = 24, style: extraStyle }: {
  name: string;
  filled?: boolean;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...extraStyle,
      }}
    >
      {name}
    </span>
  );
}

/* ─── Data ─── */
const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: false },
  { icon: 'domain', label: 'Cabang', active: false },
  { icon: 'group', label: 'Penyewa', active: false },
  { icon: 'payments', label: 'Keuangan', active: true },
  { icon: 'analytics', label: 'Laporan', active: false },
  { icon: 'settings', label: 'Pengaturan', active: false },
];

const statsData = [
  {
    icon: 'payments',
    badge: '+12% bln ini',
    badgeColor: { bg: '#f0fdf4', text: '#15803d' },
    iconBg: 'rgba(0,110,47,0.1)',
    iconColor: '#006e2f',
    label: 'Total Terkumpul',
    value: 'Rp 45.200.000',
    valueColor: '#111c2d',
    borderLeft: false,
  },
  {
    icon: 'check_circle',
    badge: null,
    iconBg: 'rgba(34,197,94,0.2)',
    iconColor: '#004b1e',
    label: 'Lunas (Bulan Ini)',
    value: '24 / 32 Penyewa',
    valueColor: '#111c2d',
    borderLeft: false,
  },
  {
    icon: 'warning',
    badge: null,
    iconBg: 'rgba(255,218,214,0.5)',
    iconColor: '#ba1a1a',
    label: 'Menunggak',
    value: '5 Orang',
    valueColor: '#ba1a1a',
    borderLeft: true,
    borderColor: '#9e4036',
  },
  {
    icon: 'pending',
    badge: null,
    iconBg: 'rgba(175,239,180,0.3)',
    iconColor: '#346e40',
    label: 'Menunggu Konfirmasi',
    value: '3 Bukti',
    valueColor: '#111c2d',
    borderLeft: false,
  },
];

type PaymentStatus = 'Lunas' | 'Terlambat' | 'Menunggu Verifikasi';

interface Tenant {
  name: string;
  avatar: string | null;
  initials?: string;
  room: string;
  branch: string;
  status: PaymentStatus;
  date: string;
  hasNotif?: boolean;
}

const tenants: Tenant[] = [
  {
    name: 'Siti Aminah',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMzAoTNsAxcDG0MB7gC3n5Eyb2OJsBnK31StvwbwdCktq0CuGhzFE7fDVHi8WRoCwvwH1QDquLv5RvS5zfXv4kPrtgQoocVjP-ctpAi7E9pWbWyC6kaqHMFmy5dTVYCZbsUL34wxBTXovi6RRWCwZg3QLrQqvaCfyvM2StetiNNcmRuHp6GYsaMPBmrS-t-to637oHawb9b0_1mNQkE67KV-Jx2e37JBY2EFN8Q-Jm5Dp_DOsuhriKoP_Y8tryzZk3NYZptGfHp9jI',
    room: 'T-04 (VIP)',
    branch: 'Handayani Tebet',
    status: 'Lunas',
    date: '01 Okt 2023, 08:30',
  },
  {
    name: 'Raka Wijaya',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfdK8-oNFNPOYSBfNrxPRpcii_C4qnSUygqWEZ1AqLWEXXJZnBb0rpjwENHcRFJlcssLstB1xXH0tVamKeMQ_Axs8ocmVZVRy-MOon12D5STVFnfWQQg2-jhDjevKLtruXgYFqI-5SjDABioZavp02v_A_l82YtvQgoNk3_vp2IwY6ZfG5YgPTAGydItvwJZVynavtkKPEGOnLXPwZ3yANBvsYJEFPWRwi7OYrrovZPx0zDVKCTTIebjpa70aYo7VfiJB2hwr6tyDp',
    room: 'K-12 (Standard)',
    branch: 'Handayani Kemang',
    status: 'Terlambat',
    date: '— Belum Bayar —',
  },
  {
    name: 'Dewi Ayu',
    avatar: null,
    initials: 'DA',
    room: 'B-02 (VIP)',
    branch: 'Handayani BSD',
    status: 'Menunggu Verifikasi',
    date: '04 Okt 2023, 14:15',
    hasNotif: true,
  },
  {
    name: 'Fajri Ramadhan',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXoZfcEtMcuctJXy7MRSNYvED0reMLc3QYn_g_gNfhztbOS66QfLRZLrvYZ39cXqYpAQfuGnTIllQ_yH1uPQlJAWDt09JBAsm4mdigtyL5XzEcrzNCA0Q8o1DrLsEO-gEs9VWQU59GPI6PE2Pcdewj4B7mwCBuklKvWx9iVFD9k4AtYXBMgidPvj-zY6MtmXMwNWbtUBCRKUbGAhA57ATf1Nfmdj7M2nGgK32vOpmhOBm_z5cIkoLCjXhziBmp_TD5s5QciZwlpAeo',
    room: 'T-11 (Standard)',
    branch: 'Handayani Tebet',
    status: 'Lunas',
    date: '02 Okt 2023, 10:00',
  },
];

/* ─── Status badge config ─── */
function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg: Record<PaymentStatus, { bg: string; text: string; dot: string; label: string }> = {
    Lunas: { bg: '#afefb4', text: '#346e40', dot: '#2f6a3c', label: 'Lunas' },
    Terlambat: { bg: '#ffdad6', text: '#ba1a1a', dot: '#ba1a1a', label: 'Terlambat' },
    'Menunggu Verifikasi': { bg: '#dee8ff', text: '#3d4a3d', dot: '#3d4a3d', label: 'Menunggu Verifikasi' },
  };
  const c = cfg[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: c.bg,
        color: c.text,
        padding: '4px 12px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

/* ─── Sidebar ─── */
function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 39, display: 'block',
          }}
          className="lg:hidden"
        />
      )}
      <aside
        style={{
          width: 256,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          borderRight: '1px solid #f1f5f9',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          zIndex: 40,
          transition: 'transform 0.25s ease',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        className={`sidebar ${mobileOpen ? '' : 'sidebar-hidden lg:flex'}`}
      >
        {/* Logo */}
        <div style={{ fontSize: 18, fontWeight: 900, color: '#15803d', marginBottom: 32, fontFamily: 'Manrope, sans-serif' }}>
          KosHandayani Admin
        </div>

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 8px' }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE9J74knCQKD_9Xv3PO5iL-9VoqhmGULTMYAAeLswvuzMRhak6qIRoBBGUqT84H4MvggE5-sXYD5rVGa36jVrpiHsxJ8craDb6el9BepEaGQ42K2IJw2dc_5AZFHf2mMSwtGhbi8xOAo5949zDb4LYkG8MLis7A8kjIkcH89ernSS3Xmfdm3eJ8z7J7-imaxVOGdJAtH-FtE9FxOjZRaRllUy70tdBJzUmovhGbuny8N1loVrT8kdXnYTxWUBN6FYMHqQS6Bg8NOFo"
            alt="Admin"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <p style={{ fontWeight: 700, color: '#111c2d' }}>Budi Santoso</p>
            <p style={{ fontSize: 12, color: '#3d4a3d', opacity: 0.7 }}>Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: item.active ? 700 : 500,
                color: item.active ? '#006e2f' : '#64748b',
                background: item.active ? '#f0fdf4' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { if (!item.active) (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { if (!item.active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
            >
              <Icon name={item.icon} filled={item.active} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Add room button */}
        <button
          style={{
            marginTop: 16,
            background: 'linear-gradient(to right, #006e2f, #22c55e)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          <Icon name="add" />
          <span>Tambah Kamar</span>
        </button>

        {/* Footer links */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, textDecoration: 'none', color: '#64748b', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
            <Icon name="help" />
            <span>Bantuan</span>
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, textDecoration: 'none', color: '#ba1a1a', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,218,214,0.2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
            <Icon name="logout" />
            <span>Keluar</span>
          </a>
        </div>
      </aside>

      {/* Always-visible sidebar on lg */}
      <style>{`
        @media (min-width: 1024px) {
          .sidebar { transform: translateX(0) !important; display: flex !important; }
          .sidebar-hidden { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .sidebar-hidden { transform: translateX(-100%); }
          .sidebar { transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'}; }
        }
      `}</style>
    </>
  );
}

/* ─── Stats Card ─── */
function StatCard({ stat }: { stat: typeof statsData[number] }) {
  return (
    <div
      style={{
        background: '#ffffff',
        padding: 24,
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(17,28,45,0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: stat.borderLeft ? `4px solid ${stat.borderColor}` : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ padding: 8, background: stat.iconBg, borderRadius: 8, color: stat.iconColor }}>
          <Icon name={stat.icon} />
        </div>
        {stat.badge && (
          <span style={{ fontSize: 11, fontWeight: 700, background: stat.badgeColor!.bg, color: stat.badgeColor!.text, padding: '4px 8px', borderRadius: 9999 }}>
            {stat.badge}
          </span>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#3d4a3d' }}>{stat.label}</p>
        <h3 style={{ fontSize: 24, fontWeight: 900, color: stat.valueColor, fontFamily: 'Manrope, sans-serif' }}>{stat.value}</h3>
      </div>
    </div>
  );
}

/* ─── Table Row ─── */
function TenantRow({ tenant }: { tenant: Tenant }) {
  const isLate = tenant.status === 'Terlambat';
  const isPending = tenant.status === 'Menunggu Verifikasi';
  return (
    <tr
      style={{ transition: 'background 0.15s' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(248,250,252,0.5)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
    >
      <td style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {tenant.avatar ? (
            <img src={tenant.avatar} alt={tenant.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: 14 }}>
              {tenant.initials}
            </div>
          )}
          <span style={{ fontWeight: 700, color: '#111c2d' }}>{tenant.name}</span>
        </div>
      </td>
      <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 600 }}>{tenant.room}</td>
      <td style={{ padding: '20px 24px', fontSize: 14, color: '#3d4a3d' }}>{tenant.branch}</td>
      <td style={{ padding: '20px 24px' }}>
        <StatusBadge status={tenant.status} />
      </td>
      <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 500, color: isLate ? '#ba1a1a' : '#3d4a3d', fontStyle: isLate ? 'italic' : 'normal' }}>
        {tenant.date}
      </td>
      <td style={{ padding: '20px 24px', textAlign: 'center' }}>
        <button
          style={{ padding: 8, color: '#006e2f', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', position: 'relative', transition: 'background 0.15s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,110,47,0.1)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <Icon name={isPending ? 'verified' : 'visibility'} />
          {tenant.hasNotif && (
            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#006e2f', borderRadius: '50%' }} />
          )}
        </button>
      </td>
    </tr>
  );
}

/* ─── Main Page Component ─── */
export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Inject styles */}
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9f9ff' }}>
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main */}
        <main
          style={{ flex: 1, padding: 32, minWidth: 0 }}
          className="main-content"
        >
          {/* Mobile top bar */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '8px 0' }}
            className="mobile-topbar"
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111c2d', display: 'none', alignItems: 'center' }}
              className="menu-btn"
            >
              <Icon name="menu" size={28} />
            </button>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#15803d', fontFamily: 'Manrope, sans-serif', display: 'none' }} className="mobile-logo">KosHandayani</span>
          </div>

          {/* ── Responsive styles for main content ── */}
          <style>{`
            @media (min-width: 1024px) {
              .main-content { margin-left: 256px; }
              .menu-btn { display: none !important; }
              .mobile-logo { display: none !important; }
            }
            @media (max-width: 1023px) {
              .main-content { margin-left: 0 !important; padding: 16px !important; }
              .menu-btn { display: flex !important; }
              .mobile-logo { display: block !important; }
            }
            @media (max-width: 640px) {
              .stats-grid { grid-template-columns: 1fr 1fr !important; }
              .header-actions { flex-direction: column !important; align-items: flex-start !important; }
              .filter-bar { flex-direction: column !important; align-items: stretch !important; }
              .filter-selects { flex-direction: column !important; }
              .table-wrapper { overflow-x: auto; }
              .banner-inner { flex-direction: column !important; }
            }
            @media (max-width: 400px) {
              .stats-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>

          {/* ── Header ── */}
          <header
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 40 }}
            className="header-actions"
          >
            <div>
              <nav style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3d4a3d', fontSize: 14, marginBottom: 8, fontWeight: 500 }}>
                <span>Manajemen</span>
                <Icon name="chevron_right" size={16} />
                <span style={{ color: '#006e2f', fontWeight: 700 }}>Monitoring Pembayaran</span>
              </nav>
              <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.025em', color: '#111c2d', fontFamily: 'Manrope, sans-serif', lineHeight: 1.1 }}>
                Keuangan Penyewa
              </h1>
              <p style={{ color: '#3d4a3d', marginTop: 4, fontSize: 14 }}>
                Pantau arus kas dan status pelunasan sewa secara real-time.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                style={{ background: '#ffffff', color: '#111c2d', border: '1px solid rgba(188,203,185,0.3)', padding: '10px 16px', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, transition: 'background 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f0f3ff'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
              >
                <Icon name="file_download" />
                <span>Ekspor PDF</span>
              </button>
              <button
                style={{ background: '#006e2f', color: '#ffffff', padding: '10px 20px', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', fontSize: 14, boxShadow: '0 8px 20px rgba(0,110,47,0.2)', transition: 'transform 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)'; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
              >
                <Icon name="account_balance_wallet" />
                <span>Input Manual</span>
              </button>
            </div>
          </header>

          {/* ── Bento Stats ── */}
          <section
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}
            className="stats-grid"
          >
            {statsData.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </section>

          {/* ── Filters ── */}
          <section
            style={{ background: '#f0f3ff', padding: 20, borderRadius: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
            className="filter-bar"
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }} className="filter-selects">
              {/* Branch select */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#3d4a3d', marginBottom: 4, marginLeft: 4 }}>Pilih Cabang</label>
                <div style={{ position: 'relative' }}>
                  <select
                    style={{ background: '#ffffff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, padding: '10px 40px 10px 16px', cursor: 'pointer', minWidth: 180, color: '#111c2d', outline: 'none' }}
                    onFocus={(e) => { (e.currentTarget as HTMLSelectElement).style.boxShadow = '0 0 0 2px rgba(0,110,47,0.2)'; }}
                    onBlur={(e) => { (e.currentTarget as HTMLSelectElement).style.boxShadow = 'none'; }}
                  >
                    <option>Semua Cabang</option>
                    <option>Handayani Tebet</option>
                    <option>Handayani Kemang</option>
                    <option>Handayani BSD</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#3d4a3d', pointerEvents: 'none', fontSize: 20, fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>expand_more</span>
                </div>
              </div>

              {/* Month select */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#3d4a3d', marginBottom: 4, marginLeft: 4 }}>Periode Bulan</label>
                <div style={{ position: 'relative' }}>
                  <select
                    style={{ background: '#ffffff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, padding: '10px 40px 10px 16px', cursor: 'pointer', minWidth: 150, color: '#111c2d', outline: 'none' }}
                    onFocus={(e) => { (e.currentTarget as HTMLSelectElement).style.boxShadow = '0 0 0 2px rgba(0,110,47,0.2)'; }}
                    onBlur={(e) => { (e.currentTarget as HTMLSelectElement).style.boxShadow = 'none'; }}
                  >
                    <option>Oktober 2023</option>
                    <option>September 2023</option>
                    <option>Agustus 2023</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#3d4a3d', pointerEvents: 'none', fontSize: 20, fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>calendar_month</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(188,203,185,0.15)', flex: '1 1 280px', maxWidth: 320 }}>
              <Icon name="search" style={{ color: '#3d4a3d', marginRight: 12 }} />
              <input
                type="text"
                placeholder="Cari nama atau nomor kamar..."
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, width: '100%', color: '#111c2d' }}
              />
            </div>
          </section>

          {/* ── Table ── */}
          <div style={{ background: '#ffffff', borderRadius: 16, boxShadow: '0 12px 40px rgba(17,28,45,0.06)', overflow: 'hidden' }} className="table-wrapper">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr style={{ background: 'rgba(248,250,252,0.5)' }}>
                    {['Nama Penyewa', 'Kamar', 'Cabang', 'Status Pembayaran', 'Tanggal Bayar', 'Aksi'].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: '20px 24px',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#3d4a3d',
                          borderBottom: '1px solid #f1f5f9',
                          textAlign: i === 5 ? 'center' : 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid #f8fafc' }}>
                  {tenants.map((t) => (
                    <TenantRow key={t.name} tenant={t} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(248,250,252,0.5)', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#3d4a3d' }}>Menampilkan 1 - 4 dari 32 penyewa</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button disabled style={{ padding: 6, borderRadius: 8, border: '1px solid rgba(188,203,185,0.3)', color: '#3d4a3d', background: 'transparent', cursor: 'not-allowed', opacity: 0.5, display: 'flex', alignItems: 'center' }}>
                  <Icon name="chevron_left" />
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    style={{
                      width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 8,
                      border: 'none',
                      background: n === 1 ? '#006e2f' : 'transparent',
                      color: n === 1 ? '#ffffff' : '#111c2d',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (n !== 1) (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
                    onMouseLeave={(e) => { if (n !== 1) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    {n}
                  </button>
                ))}
                <button style={{ padding: 6, borderRadius: 8, border: '1px solid rgba(188,203,185,0.3)', color: '#3d4a3d', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                  <Icon name="chevron_right" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Banner ── */}
          <div
            style={{ marginTop: 40, background: 'linear-gradient(135deg, #111c2d 0%, #1e293b 100%)', padding: 32, borderRadius: 24, color: '#ffffff', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}
            className="banner-inner"
          >
            {/* Decorative circle */}
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 256, height: 256, background: 'rgba(0,110,47,0.2)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />

            {/* Left text */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: 'Manrope, sans-serif' }}>
                Butuh bantuan rekonsiliasi bank?
              </h2>
              <p style={{ opacity: 0.8, fontSize: 14, lineHeight: 1.6 }}>
                Sistem KosHandayani dapat dihubungkan langsung ke mutasi bank Anda untuk verifikasi otomatis. Hubungi tim teknis kami untuk aktivasi fitur ini.
              </p>
              <button
                style={{ marginTop: 24, background: '#22c55e', color: '#004b1e', padding: '10px 24px', borderRadius: 12, fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                Hubungi Dukungan
              </button>
            </div>

            {/* Right card */}
            <div
              style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', width: 256, flexShrink: 0 }}
              className="banner-card"
            >
              <p style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.6, marginBottom: 16 }}>Status Keuangan Hari Ini</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span>Pemasukan</span>
                  <span style={{ fontWeight: 700 }}>Rp 12.4M</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: '#6bff8f' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span>Target</span>
                  <span style={{ opacity: 0.6 }}>Rp 18.0M</span>
                </div>
              </div>
            </div>

            <style>{`
              @media (max-width: 640px) {
                .banner-card { width: 100% !important; }
              }
            `}</style>
          </div>
        </main>
      </div>
    </>
  );
}
