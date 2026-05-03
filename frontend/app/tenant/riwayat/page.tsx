'use client';
import { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────
   INJECT FONTS & MATERIAL SYMBOLS
───────────────────────────────────────────── */
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap';
const MATERIAL_SYMBOLS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';

function useInjectLink(href: string) {
  useEffect(() => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
}

/* ─────────────────────────────────────────────
   INLINE STYLES (Material Symbols + glass-effect)
───────────────────────────────────────────── */
const inlineCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body { font-family: 'Inter', sans-serif; margin: 0; }

  .font-headline { font-family: 'Manrope', sans-serif; }

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
    user-select: none;
  }

  .glass-effect {
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
  }

  /* custom scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #bccbb9; border-radius: 9999px; }
`;

/* ─────────────────────────────────────────────
   TAILWIND CUSTOM COLOR TOKENS (CSS vars inline)
   We apply them via inline style objects since
   Tailwind JIT won't pick up dynamic class names.
   All semantic colour classes still work because
   we keep tailwind.config.js updated, but for
   self-contained usage in this file we also map
   the tokens as CSS custom properties injected
   into :root.
───────────────────────────────────────────── */
const cssVarsCSS = `
  :root {
    --color-on-primary: #ffffff;
    --color-primary-fixed: #6bff8f;
    --color-outline: #6d7b6c;
    --color-on-surface: #111c2d;
    --color-inverse-primary: #4ae176;
    --color-secondary-container: #afefb4;
    --color-tertiary: #9e4036;
    --color-tertiary-fixed: #ffdad5;
    --color-surface: #f9f9ff;
    --color-on-secondary-fixed-variant: #145126;
    --color-on-primary-fixed: #002109;
    --color-error-container: #ffdad6;
    --color-on-tertiary-fixed: #410001;
    --color-surface-container-low: #f0f3ff;
    --color-primary-fixed-dim: #4ae176;
    --color-surface-variant: #d8e3fb;
    --color-tertiary-fixed-dim: #ffb4a9;
    --color-outline-variant: #bccbb9;
    --color-secondary-fixed-dim: #96d59d;
    --color-on-primary-container: #004b1e;
    --color-secondary: #2f6a3c;
    --color-surface-container-highest: #d8e3fb;
    --color-primary: #006e2f;
    --color-tertiary-container: #ff8b7c;
    --color-on-tertiary-fixed-variant: #7f2a21;
    --color-on-surface-variant: #3d4a3d;
    --color-primary-container: #22c55e;
    --color-on-secondary-fixed: #002109;
    --color-error: #ba1a1a;
    --color-on-error-container: #93000a;
    --color-on-error: #ffffff;
    --color-inverse-on-surface: #ecf1ff;
    --color-surface-tint: #006e2f;
    --color-background: #f9f9ff;
    --color-surface-dim: #cfdaf2;
    --color-surface-bright: #f9f9ff;
    --color-on-tertiary: #ffffff;
    --color-surface-container: #e7eeff;
    --color-on-primary-fixed-variant: #005321;
    --color-on-background: #111c2d;
    --color-inverse-surface: #263143;
    --color-surface-container-lowest: #ffffff;
    --color-on-tertiary-container: #76231b;
    --color-on-secondary-container: #346e40;
    --color-secondary-fixed: #b2f2b7;
    --color-surface-container-high: #dee8ff;
    --color-on-secondary: #ffffff;
  }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
interface Transaction {
  id: string;
  period: string;
  periodDetail: string;
  payDate: string;
  amount: string;
  status: 'Lunas' | 'Gagal' | 'Pending';
}

const transactions: Transaction[] = [
  { id: 'TRX-1092', period: 'Nov 2024', periodDetail: '1 Bulan Sewa', payDate: '05 Nov 2024', amount: 'Rp 2.500.000', status: 'Lunas' },
  { id: 'TRX-0985', period: 'Okt 2024', periodDetail: '1 Bulan Sewa', payDate: '02 Okt 2024', amount: 'Rp 2.500.000', status: 'Lunas' },
  { id: 'TRX-0871', period: 'Sep 2024', periodDetail: '1 Bulan Sewa', payDate: '04 Sep 2024', amount: 'Rp 2.500.000', status: 'Lunas' },
  { id: 'TRX-0755', period: 'Agt 2024', periodDetail: '1 Bulan Sewa', payDate: '01 Agt 2024', amount: 'Rp 2.500.000', status: 'Gagal' },
];

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard' },
  { icon: 'bed', label: 'Kamar Saya' },
  { icon: 'receipt_long', label: 'Tagihan' },
  { icon: 'history', label: 'Riwayat', active: true },
  { icon: 'person', label: 'Profil' },
];

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

function Icon({ name, className = '', style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
  if (status === 'Lunas') {
    return (
      <span
        style={{
          background: 'rgba(34,197,94,0.1)',
          color: '#004b1e',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
        className="text-[11px] font-bold px-3 py-1 rounded-full"
      >
        Lunas
      </span>
    );
  }
  if (status === 'Gagal') {
    return (
      <span
        style={{
          background: 'rgba(255,218,214,0.2)',
          color: '#ba1a1a',
          border: '1px solid rgba(255,218,214,0.4)',
        }}
        className="text-[11px] font-bold px-3 py-1 rounded-full"
      >
        Gagal
      </span>
    );
  }
  return (
    <span
      style={{
        background: 'rgba(255,236,153,0.3)',
        color: '#795200',
        border: '1px solid rgba(255,236,153,0.5)',
      }}
      className="text-[11px] font-bold px-3 py-1 rounded-full"
    >
      Pending
    </span>
  );
}

function SideNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          h-screen w-64 fixed left-0 top-0 flex flex-col p-4 z-50
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: '#f1f5f9' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-6 mb-8">
          <img
            className="w-10 h-10 rounded-xl object-contain shadow-sm"
            style={{ background: '#006e2f' }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWCE7SxdAoUjp4PKlodesfUG6nxtbH3TjYBcHTXVuxTydpz3cBJzs2lj6hmceQnIlmUzHkLKAM0j9FlnAhTlJX5rUXohQf8Lz7e6eR_-QBWL2QiDyYeHkk9M53sGfKoVFXBshlhs8F3iDRHLh0NM2JTGEoeTM_oBf6vkUaJAZ2VXQGFlOnYxJXzMBzZM1jMkD47SW5XJ_cxDEdExrOzc3EQnRLj1QaW473FFyUUbQGwr8D3oAOf0plGs2tJ-09VhlDBEL1Yi1aVdny"
            alt="KosHandayani Logo"
          />
          <div>
            <h1 className="font-headline font-black text-lg leading-none" style={{ color: '#0f172a' }}>
              KosHandayani
            </h1>
            <p className="text-[10px] font-medium tracking-widest uppercase mt-1" style={{ color: '#3d4a3d' }}>
              Digital Concierge
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 space-y-1">
          {navItems.map((item) =>
            item.active ? (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-sm font-semibold text-sm translate-x-1 transition-transform"
                style={{ background: '#ffffff', color: '#16a34a' }}
              >
                <Icon name={item.icon} />
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium"
                style={{ color: '#64748b' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon name={item.icon} />
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
          <div
            className="flex items-center gap-3 px-4 py-4 mb-4 rounded-xl"
            style={{ background: '#f0f3ff' }}
          >
            <img
              className="w-10 h-10 rounded-full"
              style={{ border: '2px solid #ffffff' }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC96Sewl9eO6LFyL4YtlIUyYYMGLK9sxB841-UdivA4BJkrj_LBrQ2jvTAm4tRJKB--5zXLDZbJ7GMtN-EMkjWaowmWT8SKehRa6YGK6KqT-AYWNFEHSAAkEtAPCEv0oC-iGZi0Pq1upDFDZWxkfsAMADQKBkPB1FNZRH8EKCKOZ2QkaXNRym1AcXzD1w8SNH4ZSZW0n6Zo5UDVZo2USk8diEqUyOEwJQBoGufzXKtsXIlNn9mg8c30HMnA7oNPehqmozp1A7YQBbLL"
              alt="Budi Santoso"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate" style={{ color: '#111c2d' }}>Budi Santoso</p>
              <p className="text-[10px]" style={{ color: '#3d4a3d' }}>Penghuni Room 302</p>
            </div>
          </div>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="logout" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

function TopHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header
      className="fixed top-0 right-0 z-40 flex justify-between items-center px-4 sm:px-8 lg:px-12 py-5"
      style={{
        left: 0,
        background: 'rgba(249,249,255,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-4" style={{ paddingLeft: '0' }}>
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-full transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(226,232,240,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          onClick={onMenuToggle}
        >
          <Icon name="menu" />
        </button>

        <button
          className="hidden lg:flex p-2 rounded-full transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(226,232,240,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="arrow_back" />
        </button>
        <nav className="flex text-xs font-medium gap-2 items-center" style={{ color: '#94a3b8' }}>
          <a href="#" className="hover:text-green-700 transition-colors">Dashboard</a>
          <Icon name="chevron_right" className="text-[10px]" />
          <span className="font-bold" style={{ color: '#006e2f' }}>Riwayat</span>
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4" style={{ marginLeft: 'calc(256px)' }}>
        <button
          className="p-2 rounded-full transition-colors relative"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(226,232,240,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="notifications" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: '#ef4444', border: '2px solid #f8fafc' }}
          />
        </button>
        <button
          className="p-2 rounded-full transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(226,232,240,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="help_outline" />
        </button>
      </div>
    </header>
  );
}

function SummaryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Big card */}
      <div
        className="col-span-1 md:col-span-2 p-8 rounded-xl shadow-lg text-white relative overflow-hidden group"
        style={{ background: 'linear-gradient(135deg, #006e2f 0%, #22c55e 100%)' }}
      >
        <div className="relative z-10">
          <p className="font-medium text-sm mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Total Pembayaran (2024)
          </p>
          <h3 className="font-headline font-black tracking-tighter mb-4" style={{ fontSize: '2.8rem', lineHeight: 1.1 }}>
            Rp 24.500.000
          </h3>
          <div className="flex flex-wrap gap-4">
            <div
              className="glass-effect px-4 py-2 rounded-lg"
            >
              <p className="text-[10px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>Terakhir Bayar</p>
              <p className="text-sm font-semibold text-white">05 Nov 2024</p>
            </div>
            <div
              className="glass-effect px-4 py-2 rounded-lg"
            >
              <p className="text-[10px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Transaksi</p>
              <p className="text-sm font-semibold text-white">10 Transaksi</p>
            </div>
          </div>
        </div>
        <div
          className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700"
        >
          <Icon
            name="account_balance_wallet"
            className=""
            style={{ fontSize: '200px', fontVariationSettings: "'FILL' 1" }}
          />
        </div>
      </div>

      {/* Status card */}
      <div
        className="p-8 rounded-xl flex flex-col justify-between shadow-sm"
        style={{ background: '#ffffff', border: '1px solid rgba(241,245,249,0.5)' }}
      >
        <div>
          <div className="flex justify-between items-start mb-6">
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(175,239,180,0.3)', color: '#006e2f' }}
            >
              <Icon name="verified" />
            </div>
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest"
              style={{ background: 'rgba(34,197,94,0.2)', color: '#004b1e' }}
            >
              Lunas
            </span>
          </div>
          <p className="text-sm mb-1" style={{ color: '#3d4a3d' }}>Status Terakhir</p>
          <h4 className="font-headline font-bold text-2xl" style={{ color: '#0f172a' }}>05 Nov 2024</h4>
        </div>
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f8fafc' }}>
          <p className="text-xs" style={{ color: '#3d4a3d' }}>
            Pembayaran periode November telah berhasil diverifikasi oleh sistem.
          </p>
        </div>
      </div>
    </div>
  );
}

function TransactionsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  const filtered = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div
      className="rounded-xl shadow-sm overflow-hidden"
      style={{ background: '#ffffff', border: '1px solid rgba(241,245,249,0.5)' }}
    >
      {/* Table Header */}
      <div
        className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ borderBottom: '1px solid #f8fafc' }}
      >
        <h3 className="font-headline font-bold" style={{ color: '#0f172a' }}>Daftar Transaksi</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm flex-1 sm:flex-none transition-all"
            style={{ background: '#f0f3ff', color: '#3d4a3d' }}
          >
            <Icon name="search" className="text-sm" style={{ fontSize: '18px' }} />
            <input
              className="bg-transparent border-none focus:outline-none p-0 text-sm w-full sm:w-40"
              placeholder="Cari ID Transaksi..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ color: '#111c2d' }}
            />
          </div>
          <button
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#3d4a3d' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="filter_list" />
          </button>
        </div>
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: 'rgba(240,243,255,0.5)' }}>
              {['ID Transaksi', 'Periode', 'Tanggal Bayar', 'Nominal', 'Status', 'Aksi'].map((h, i) => (
                <th
                  key={h}
                  className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: '#3d4a3d',
                    textAlign: i === 4 ? 'center' : i === 5 ? 'right' : 'left',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx) => (
              <tr
                key={tx.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid #f8fafc' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(240,243,255,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-8 py-6 font-mono text-sm font-semibold" style={{ color: '#006e2f' }}>
                  {tx.id}
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-bold" style={{ color: '#111c2d' }}>{tx.period}</div>
                  <div className="text-[11px]" style={{ color: '#3d4a3d' }}>{tx.periodDetail}</div>
                </td>
                <td className="px-8 py-6 text-sm" style={{ color: '#3d4a3d' }}>{tx.payDate}</td>
                <td className="px-8 py-6 text-sm font-bold" style={{ color: '#111c2d' }}>{tx.amount}</td>
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    <StatusBadge status={tx.status} />
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {tx.status !== 'Gagal' ? (
                    <button
                      className="inline-flex items-center gap-1 text-sm font-bold transition-all hover:underline"
                      style={{ color: '#006e2f' }}
                    >
                      <Icon name="download" className="" style={{ fontSize: '18px' }} />
                      Unduh
                    </button>
                  ) : (
                    <span className="text-xs italic" style={{ color: '#cbd5e1' }}>N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y" style={{ borderColor: '#f8fafc' }}>
        {paginated.map((tx) => (
          <div key={tx.id} className="px-5 py-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-mono text-sm font-semibold" style={{ color: '#006e2f' }}>{tx.id}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: '#111c2d' }}>{tx.period}</p>
                <p className="text-[11px]" style={{ color: '#3d4a3d' }}>{tx.periodDetail}</p>
              </div>
              <StatusBadge status={tx.status} />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs" style={{ color: '#3d4a3d' }}>{tx.payDate}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: '#111c2d' }}>{tx.amount}</p>
              </div>
              {tx.status !== 'Gagal' ? (
                <button
                  className="inline-flex items-center gap-1 text-sm font-bold"
                  style={{ color: '#006e2f' }}
                >
                  <Icon name="download" style={{ fontSize: '18px' }} />
                  Unduh
                </button>
              ) : (
                <span className="text-xs italic" style={{ color: '#cbd5e1' }}>N/A</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div
        className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4"
        style={{ background: 'rgba(240,243,255,0.2)', borderTop: '1px solid #f8fafc' }}
      >
        <p className="text-xs" style={{ color: '#3d4a3d' }}>
          Menampilkan <span className="font-bold" style={{ color: '#111c2d' }}>{paginated.length}</span> dari{' '}
          <span className="font-bold" style={{ color: '#111c2d' }}>{total}</span> transaksi
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#3d4a3d' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="chevron_left" className="text-sm" style={{ fontSize: '18px' }} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors"
              style={
                page === p
                  ? { background: '#006e2f', color: '#ffffff' }
                  : { color: '#3d4a3d' }
              }
              onMouseEnter={(e) => {
                if (page !== p) e.currentTarget.style.background = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                if (page !== p) e.currentTarget.style.background = 'transparent';
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#3d4a3d' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name="chevron_right" className="text-sm" style={{ fontSize: '18px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpBanner() {
  return (
    <div
      className="mt-12 p-6 sm:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6"
      style={{ background: '#f0f3ff' }}
    >
      <div className="flex items-center gap-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner shrink-0"
          style={{ background: '#ffffff' }}
        >
          <Icon
            name="help"
            className=""
            style={{ color: '#006e2f', fontSize: '30px', fontVariationSettings: "'FILL' 1" }}
          />
        </div>
        <div>
          <h4 className="font-headline font-bold" style={{ color: '#111c2d' }}>Butuh Bantuan?</h4>
          <p className="text-sm" style={{ color: '#3d4a3d' }}>
            Jika terdapat kendala pada riwayat transaksi Anda, tim kami siap membantu.
          </p>
        </div>
      </div>
      <a
        href="#"
        className="font-bold py-4 px-8 rounded-xl transition-all shadow-md text-white shrink-0 text-sm active:scale-95 inline-block"
        style={{ background: '#006e2f' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#005321')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#006e2f')}
      >
        Hubungi Admin
      </a>
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="w-full py-8 mt-12"
      style={{ borderTop: '1px solid #f1f5f9', background: '#ffffff' }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-8 lg:px-12 gap-4">
        <p className="text-xs" style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
          © 2024 KosHandayani Property Management.
        </p>
        <div className="flex gap-6">
          {['Syarat & Ketentuan', 'Kebijakan Privasi', 'Hubungi Kami'].map((label) => (
            <a
              key={label}
              href="#"
              className="text-xs transition-all"
              style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#16a34a';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE ROOT
───────────────────────────────────────────── */
export default function Page() {
  useInjectLink(GOOGLE_FONTS_URL);
  useInjectLink(MATERIAL_SYMBOLS_URL);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      {/* Inject all CSS */}
      <style>{inlineCSS + cssVarsCSS}</style>

      <div style={{ background: '#f9f9ff', color: '#111c2d', minHeight: '100vh' }}>
        <SideNav mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* Main content offset by sidebar on large screens */}
        <main className="lg:ml-64 min-h-screen">
          <TopHeader onMenuToggle={() => setMobileNavOpen((v) => !v)} />

          <section className="pt-24 pb-12 px-4 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              {/* Page Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
                <div>
                  <h2
                    className="font-headline font-black tracking-tight mb-2"
                    style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#0f172a' }}
                  >
                    Riwayat Pembayaran
                  </h2>
                  <p className="max-w-lg" style={{ color: '#3d4a3d' }}>
                    Pantau semua transaksi penyewaan kamar Anda secara transparan dan akurat.
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all text-sm shrink-0"
                  style={{ background: '#f0f3ff', color: '#111c2d' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#dee8ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#f0f3ff')}
                >
                  <Icon name="arrow_back" className="text-sm" style={{ fontSize: '18px' }} />
                  Kembali ke Beranda
                </button>
              </div>

              <SummaryGrid />
              <TransactionsTable />
              <HelpBanner />
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
