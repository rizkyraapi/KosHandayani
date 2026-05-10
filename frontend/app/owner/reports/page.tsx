'use client';
import { useEffect } from 'react';

// ─── Inject Google Fonts + Material Symbols ───────────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap';
    document.head.appendChild(fontLink);

    const iconsLink = document.createElement('link');
    iconsLink.rel = 'stylesheet';
    iconsLink.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(iconsLink);

    const style = document.createElement('style');
    style.textContent = `
      /* ── Custom Color Tokens ── */
      :root {
        --color-surface-container-highest: #d8e3fb;
        --color-tertiary-fixed-dim: #ffb4a9;
        --color-primary: #006e2f;
        --color-tertiary-container: #ff8b7c;
        --color-on-secondary-container: #346e40;
        --color-on-primary-fixed: #002109;
        --color-secondary-fixed-dim: #96d59d;
        --color-on-secondary-fixed: #002109;
        --color-on-error: #ffffff;
        --color-tertiary: #9e4036;
        --color-on-error-container: #93000a;
        --color-surface-bright: #f9f9ff;
        --color-surface-container-high: #dee8ff;
        --color-on-surface: #111c2d;
        --color-primary-fixed: #6bff8f;
        --color-outline: #6d7b6c;
        --color-error-container: #ffdad6;
        --color-on-tertiary: #ffffff;
        --color-on-tertiary-container: #76231b;
        --color-background: #f9f9ff;
        --color-surface-tint: #006e2f;
        --color-surface-container-lowest: #ffffff;
        --color-surface-container: #e7eeff;
        --color-primary-fixed-dim: #4ae176;
        --color-on-primary-container: #004b1e;
        --color-surface-container-low: #f0f3ff;
        --color-error: #ba1a1a;
        --color-secondary: #2f6a3c;
        --color-inverse-on-surface: #ecf1ff;
        --color-on-secondary: #ffffff;
        --color-inverse-primary: #4ae176;
        --color-tertiary-fixed: #ffdad5;
        --color-on-surface-variant: #3d4a3d;
        --color-on-background: #111c2d;
        --color-outline-variant: #bccbb9;
        --color-surface-variant: #d8e3fb;
        --color-on-primary: #ffffff;
        --color-inverse-surface: #263143;
        --color-secondary-fixed: #b2f2b7;
        --color-secondary-container: #afefb4;
        --color-primary-container: #22c55e;
        --color-surface: #f9f9ff;
        --color-surface-dim: #cfdaf2;
      }

      /* ── Base ── */
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { font-size: 16px; }
      body {
        background-color: var(--color-background);
        color: var(--color-on-surface);
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      /* ── Material Symbols ── */
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

      /* ── Scrollbar ── */
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #bccbb9; border-radius: 10px; }

      /* ── Glass Card ── */
      .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
      }

      /* ── Sidebar ── */
      .sidebar {
        height: 100vh;
        width: 256px;
        position: fixed;
        left: 0;
        top: 0;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 8px;
        z-index: 40;
        border-right: 1px solid rgba(188,203,185,0.1);
        font-family: 'Inter', sans-serif;
      }

      .sidebar-logo { margin-bottom: 32px; padding: 0 8px; }
      .sidebar-logo h1 {
        font-size: 20px;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.05em;
        font-family: 'Manrope', sans-serif;
      }
      .sidebar-logo p {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #64748b;
        font-weight: 700;
        margin-top: 4px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: #64748b;
        border-radius: 12px;
        font-weight: 500;
        font-size: 14px;
        text-decoration: none;
        transition: background 0.15s, color 0.15s;
        cursor: pointer;
      }
      .nav-item:hover { background: #f1f5f9; color: #334155; }
      .nav-item.active {
        background: #dcfce7;
        color: #15803d;
        font-weight: 600;
      }

      .sidebar-footer {
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid rgba(188,203,185,0.1);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .branch-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--color-surface-container-high);
        border: none;
        cursor: pointer;
        color: var(--color-on-surface-variant);
        font-weight: 600;
        font-size: 12px;
        transition: background 0.15s;
        font-family: 'Inter', sans-serif;
      }
      .branch-btn:hover { background: var(--color-surface-container-highest); }

      /* ── Main ── */
      .main-content {
        margin-left: 256px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      /* ── Header ── */
      .top-bar {
        position: sticky;
        top: 0;
        z-index: 30;
        background: rgba(255,255,255,0.8);
        backdrop-filter: blur(12px);
        padding: 24px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .top-bar-title h2 {
        font-size: 24px;
        font-weight: 700;
        font-family: 'Manrope', sans-serif;
        letter-spacing: -0.025em;
        color: var(--color-on-surface);
      }
      .top-bar-title span {
        font-size: 14px;
        color: var(--color-on-surface-variant);
        font-weight: 500;
      }
      .top-bar-actions { display: flex; align-items: center; gap: 16px; }

      .filter-group {
        display: flex;
        background: var(--color-surface-container-low);
        padding: 4px;
        border-radius: 12px;
        align-items: center;
      }
      .filter-group select {
        background: transparent;
        border: none;
        outline: none;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-on-surface-variant);
        padding: 8px 32px 8px 12px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
      }
      .filter-divider {
        width: 1px;
        height: 24px;
        background: rgba(188,203,185,0.3);
      }

      .btn-export {
        background: var(--color-primary-container);
        color: var(--color-on-primary-container);
        padding: 10px 20px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 14px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.15s;
        font-family: 'Inter', sans-serif;
      }
      .btn-export:hover { opacity: 0.9; }

      /* ── Analytics Section ── */
      .analytics-section {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 32px;
        max-width: 1280px;
        width: 100%;
      }

      /* ── Summary Cards ── */
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      @media (max-width: 900px) {
        .summary-grid { grid-template-columns: 1fr; }
      }

      .summary-card {
        background: var(--color-surface-container-lowest);
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(17,28,45,0.04);
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
        overflow: hidden;
      }
      .summary-card-blob {
        position: absolute;
        right: -16px;
        top: -16px;
        width: 96px;
        height: 96px;
        border-radius: 9999px;
        filter: blur(24px);
        transition: background 0.3s;
      }
      .summary-card:hover .blob-primary { background: rgba(0,110,47,0.1); }
      .summary-card:hover .blob-tertiary { background: rgba(158,64,54,0.1); }
      .blob-primary { background: rgba(0,110,47,0.05); }
      .blob-tertiary { background: rgba(158,64,54,0.05); }

      .summary-card.primary-card {
        background: var(--color-primary);
        color: var(--color-on-primary);
        box-shadow: 0 12px 40px rgba(0,110,47,0.15);
      }
      .primary-card-blob {
        position: absolute;
        right: -24px;
        bottom: -24px;
        width: 128px;
        height: 128px;
        background: rgba(255,255,255,0.1);
        border-radius: 9999px;
        filter: blur(32px);
      }

      .card-icon-row { display: flex; align-items: center; gap: 12px; }
      .card-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-green { background: #f0fdf4; color: var(--color-primary); }
      .icon-red { background: #fff1f2; color: var(--color-tertiary); }
      .icon-white { background: rgba(255,255,255,0.2); color: #fff; }

      .card-label {
        font-size: 14px;
        color: var(--color-on-surface-variant);
        font-weight: 500;
        font-family: 'Inter', sans-serif;
      }
      .card-label-light { font-size: 14px; opacity: 0.8; font-weight: 500; font-family: 'Inter', sans-serif; }

      .card-amount {
        font-size: 30px;
        font-weight: 900;
        font-family: 'Manrope', sans-serif;
        color: var(--color-on-surface);
      }
      .card-amount-white { font-size: 30px; font-weight: 900; font-family: 'Manrope', sans-serif; color: #fff; }

      .card-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
      .badge-green { font-size: 12px; color: var(--color-primary); font-weight: 700; }
      .badge-red { font-size: 12px; color: var(--color-tertiary); font-weight: 700; }
      .badge-fixed { font-size: 12px; font-weight: 700; color: var(--color-primary-fixed); }
      .meta-sub {
        font-size: 10px;
        text-transform: uppercase;
        color: var(--color-on-surface-variant);
        font-family: 'Inter', sans-serif;
      }
      .meta-sub-light { font-size: 10px; text-transform: uppercase; opacity: 0.7; letter-spacing: 0.05em; font-family: 'Inter', sans-serif; }

      /* ── Chart ── */
      .chart-card {
        background: var(--color-surface-container-lowest);
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 12px 40px rgba(17,28,45,0.03);
        border: 1px solid rgba(188,203,185,0.1);
      }
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
      }
      .chart-header h3 {
        font-size: 18px;
        font-weight: 700;
        font-family: 'Manrope', sans-serif;
        color: var(--color-on-surface);
      }
      .chart-header p {
        font-size: 14px;
        color: var(--color-on-surface-variant);
        margin-top: 2px;
      }
      .chart-legend { display: flex; gap: 16px; }
      .legend-item { display: flex; align-items: center; gap: 8px; }
      .legend-dot {
        width: 12px; height: 12px; border-radius: 9999px;
      }
      .legend-dot-primary { background: var(--color-primary); }
      .legend-dot-tertiary { background: var(--color-tertiary); }
      .legend-label { font-size: 12px; font-weight: 600; color: var(--color-on-surface-variant); }

      .chart-area {
        position: relative;
        height: 256px;
        width: 100%;
        display: flex;
        align-items: flex-end;
        gap: 4px;
      }
      .chart-grid {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: none;
        border-bottom: 1px solid rgba(188,203,185,0.2);
      }
      .chart-grid-line { width: 100%; border-top: 1px solid rgba(188,203,185,0.1); }

      .chart-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
      }
      .chart-col:hover .bar-income { background: var(--color-primary); }
      .chart-col:hover .bar-expense { background: var(--color-tertiary); }

      .bar-group {
        width: 100%;
        max-width: 40px;
        display: flex;
        align-items: flex-end;
        gap: 4px;
        padding: 0 4px;
      }
      .bar {
        flex: 1;
        border-radius: 4px 4px 0 0;
        transition: background 0.3s;
      }
      .bar-income { background: rgba(0,110,47,0.2); }
      .bar-expense { background: rgba(158,64,54,0.2); }
      .bar-income.active { background: var(--color-primary); }
      .bar-expense.active { background: var(--color-tertiary); }

      .chart-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--color-on-surface-variant);
        font-family: 'Inter', sans-serif;
      }
      .chart-label.active { color: var(--color-primary); }

      /* ── Transactions Table ── */
      .table-card {
        background: var(--color-surface-container-lowest);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 12px 40px rgba(17,28,45,0.03);
        border: 1px solid rgba(188,203,185,0.1);
      }
      .table-header {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(188,203,185,0.05);
      }
      .table-header h3 {
        font-size: 18px;
        font-weight: 700;
        font-family: 'Manrope', sans-serif;
        color: var(--color-on-surface);
      }
      .table-actions { display: flex; align-items: center; gap: 16px; }
      .btn-add {
        background: var(--color-primary);
        color: #fff;
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.15s;
        font-family: 'Inter', sans-serif;
      }
      .btn-add:hover { opacity: 0.9; }
      .btn-link {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-primary);
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
        font-family: 'Inter', sans-serif;
      }
      .btn-link:hover { text-decoration: underline; }

      .table-wrap { overflow-x: auto; }
      table { width: 100%; text-align: left; border-collapse: collapse; }
      thead { background: var(--color-surface-container-low); }
      thead th {
        padding: 16px 24px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 700;
        color: var(--color-on-surface-variant);
        font-family: 'Inter', sans-serif;
      }
      thead th.text-right { text-align: right; }
      tbody tr { border-bottom: 1px solid rgba(188,203,185,0.05); }
      tbody tr:hover { background: rgba(240,243,255,0.5); }
      tbody tr:last-child { border-bottom: none; }
      tbody td {
        padding: 16px 24px;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        color: var(--color-on-surface);
      }
      td.date { font-weight: 500; }
      td.desc { font-weight: 600; }
      td.branch { font-size: 12px; color: var(--color-on-surface-variant); }
      td.amount { font-weight: 700; text-align: right; }
      td.amount.income { color: var(--color-primary); }
      td.amount.expense { color: var(--color-tertiary); }

      .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        font-family: 'Inter', sans-serif;
      }
      .badge-income { background: #f0fdf4; color: var(--color-primary); }
      .badge-expense { background: #fff1f2; color: var(--color-tertiary); }

      /* ── Footer ── */
      .page-footer {
        width: 100%;
        padding: 32px;
        margin-top: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        border-top: 1px solid #f1f5f9;
        font-family: 'Inter', sans-serif;
      }
      .footer-links { display: flex; gap: 32px; }
      .footer-link {
        font-size: 12px;
        color: #94a3b8;
        text-decoration: none;
        transition: color 0.2s;
      }
      .footer-link:hover { color: #475569; }
      .footer-copy { font-size: 12px; color: #64748b; }

      /* ── Responsive ── */
      @media (max-width: 1024px) {
        .sidebar { width: 220px; }
        .main-content { margin-left: 220px; }
        .analytics-section { padding: 24px; }
        .top-bar { padding: 20px 24px; flex-wrap: wrap; gap: 16px; }
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 100%;
          height: auto;
          position: relative;
          flex-direction: row;
          align-items: center;
          padding: 12px 16px;
          overflow-x: auto;
        }
        .sidebar-logo { margin-bottom: 0; margin-right: 16px; white-space: nowrap; }
        .sidebar-logo p { display: none; }
        nav.sidebar-nav { display: flex; flex-direction: row; gap: 4px; flex: 1; overflow-x: auto; }
        .nav-item span:last-child { display: none; }
        .sidebar-footer { display: none; }
        .main-content { margin-left: 0; }
        .top-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
        .top-bar-actions { flex-wrap: wrap; gap: 12px; }
        .filter-group { flex-wrap: wrap; }
        .analytics-section { padding: 16px; gap: 20px; }
        .chart-header { flex-direction: column; gap: 12px; }
        .table-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        .footer-links { flex-wrap: wrap; gap: 16px; justify-content: center; }
      }

      @media (max-width: 640px) {
        .card-amount, .card-amount-white { font-size: 22px; }
        thead th, tbody td { padding: 12px 16px; }
      }
    `;
    document.head.appendChild(style);

    const title = document.querySelector('title');
    if (title) title.textContent = 'KosHandayani — Laporan Keuangan';

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(iconsLink);
      document.head.removeChild(style);
    };
  }, []);
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: false },
  { icon: 'bed', label: 'Data Kamar', active: false },
  { icon: 'group', label: 'Data Penyewa', active: false },
  { icon: 'payments', label: 'Pembayaran', active: false },
  { icon: 'receipt_long', label: 'Pengeluaran', active: false },
  { icon: 'analytics', label: 'Laporan', active: true },
];

const summaryCards = [
  {
    type: 'income',
    icon: 'trending_up',
    iconClass: 'icon-green',
    label: 'Total Pemasukan',
    amount: 'Rp 45.250.000',
    badge: '+12.5%',
    badgeClass: 'badge-green',
    sub: 'vs bulan lalu',
    blobClass: 'blob-primary',
  },
  {
    type: 'expense',
    icon: 'trending_down',
    iconClass: 'icon-red',
    label: 'Total Pengeluaran',
    amount: 'Rp 12.840.000',
    badge: '-2.1%',
    badgeClass: 'badge-red',
    sub: 'efisiensi biaya',
    blobClass: 'blob-tertiary',
  },
];

const chartData = [
  { month: 'MEI', income: 128, expense: 48, active: false },
  { month: 'JUN', income: 160, expense: 64, active: false },
  { month: 'JUL', income: 192, expense: 80, active: false },
  { month: 'AGU', income: 224, expense: 96, active: false },
  { month: 'SEP', income: 208, expense: 56, active: false },
  { month: 'OKT', income: 240, expense: 72, active: true },
];

const transactions = [
  {
    date: '12 Okt 2024',
    type: 'income',
    desc: 'Sewa Kamar B-04 (Andi Wijaya)',
    branch: 'Handayani I',
    amount: '+ Rp 1.500.000',
  },
  {
    date: '10 Okt 2024',
    type: 'expense',
    desc: 'Perbaikan AC Kamar C-02',
    branch: 'Handayani II',
    amount: '- Rp 450.000',
  },
  {
    date: '08 Okt 2024',
    type: 'income',
    desc: 'Sewa Kamar A-10 (Siti Aminah)',
    branch: 'Handayani I',
    amount: '+ Rp 1.800.000',
  },
  {
    date: '05 Okt 2024',
    type: 'expense',
    desc: 'Listrik & Air Bulanan',
    branch: 'Handayani I',
    amount: '- Rp 2.100.000',
  },
  {
    date: '02 Okt 2024',
    type: 'income',
    desc: 'Booking Kamar D-01',
    branch: 'Handayani II',
    amount: '+ Rp 500.000',
  },
];

// ─── Icon helper ──────────────────────────────────────────────────────────────
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>KosHandayani</h1>
        <p>Owner Dashboard</p>
      </div>
      <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => (
          <a key={item.label} href="#" className={`nav-item${item.active ? ' active' : ''}`}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="branch-btn">
          <span>Semua Cabang</span>
          <Icon name="expand_more" />
        </button>
        <a href="#" className="nav-item">
          <Icon name="logout" />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-title">
        <h2>Laporan Keuangan</h2>
        <span>Overview performa properti Anda</span>
      </div>
      <div className="top-bar-actions">
        <div className="filter-group">
          <select>
            <option>Pilih Bulan</option>
            <option defaultValue="Oktober 2024">Oktober 2024</option>
            <option>September 2024</option>
          </select>
          <div className="filter-divider" />
          <select>
            <option>Pilih Cabang</option>
            <option defaultValue="Semua Cabang">Semua Cabang</option>
            <option>Kos Handayani I</option>
            <option>Kos Handayani II</option>
          </select>
        </div>
        <button className="btn-export">
          <Icon name="download" />
          Export PDF
        </button>
      </div>
    </header>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards() {
  return (
    <div className="summary-grid">
      {summaryCards.map((card) => (
        <div key={card.type} className="summary-card">
          <div className={`summary-card-blob ${card.blobClass}`} />
          <div className="card-icon-row">
            <div className={`card-icon ${card.iconClass}`}>
              <Icon name={card.icon} />
            </div>
            <span className="card-label">{card.label}</span>
          </div>
          <div>
            <div className="card-amount">{card.amount}</div>
            <div className="card-meta">
              <span className={card.badgeClass}>{card.badge}</span>
              <span className="meta-sub">{card.sub}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Saldo Bersih (primary card) */}
      <div className="summary-card primary-card">
        <div className="primary-card-blob" />
        <div className="card-icon-row">
          <div className="card-icon icon-white">
            <Icon name="account_balance_wallet" />
          </div>
          <span className="card-label-light">Saldo Bersih</span>
        </div>
        <div>
          <div className="card-amount-white">Rp 32.410.000</div>
          <div className="card-meta">
            <span className="badge-fixed">Margin 71%</span>
            <span className="meta-sub-light">Profitabilitas Sehat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
function Chart() {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Pemasukan vs Pengeluaran</h3>
          <p>Visualisasi arus kas 6 bulan terakhir</p>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-dot legend-dot-primary" />
            <span className="legend-label">Pemasukan</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot-tertiary" />
            <span className="legend-label">Pengeluaran</span>
          </div>
        </div>
      </div>

      <div className="chart-area">
        <div className="chart-grid">
          <div className="chart-grid-line" />
          <div className="chart-grid-line" />
          <div className="chart-grid-line" />
          <div className="chart-grid-line" />
        </div>
        {chartData.map((d) => (
          <div key={d.month} className="chart-col">
            <div className="bar-group">
              <div
                className={`bar bar-income${d.active ? ' active' : ''}`}
                style={{ height: d.income }}
              />
              <div
                className={`bar bar-expense${d.active ? ' active' : ''}`}
                style={{ height: d.expense }}
              />
            </div>
            <span className={`chart-label${d.active ? ' active' : ''}`}>{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Transactions Table ───────────────────────────────────────────────────────
function TransactionsTable() {
  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Transaksi Terkini</h3>
        <div className="table-actions">
          <button className="btn-add">
            <Icon name="add" />
            Tambah Pengeluaran
          </button>
          <button className="btn-link">Lihat Semua</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th>Cabang</th>
              <th className="text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={i}>
                <td className="date">{tx.date}</td>
                <td>
                  <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                    {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </td>
                <td className="desc">{tx.desc}</td>
                <td className="branch">{tx.branch}</td>
                <td className={`amount ${tx.type === 'income' ? 'income' : 'expense'}`}>
                  {tx.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="page-footer">
      <div className="footer-links">
        <a href="#" className="footer-link">Tentang Kami</a>
        <a href="#" className="footer-link">Syarat &amp; Ketentuan</a>
        <a href="#" className="footer-link">Kebijakan Privasi</a>
      </div>
      <p className="footer-copy">© 2024 KosHandayani. Digital Concierge Property Management.</p>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Page() {
  useGlobalStyles();

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <TopBar />
        <div className="analytics-section">
          <SummaryCards />
          <Chart />
          <TransactionsTable />
        </div>
        <Footer />
      </main>
    </>
  );
}
