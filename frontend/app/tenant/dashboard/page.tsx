'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   ALL CUSTOM STYLES — fonts, colors, utilities, Material Symbols,
   glass-effect, animations — injected into <head> at runtime.
   Nothing outside this file needs changing.
═══════════════════════════════════════════════════════════════ */
const CUSTOM_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

/* ── Base ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
html { font-family: 'Inter', sans-serif; }
body { font-family: 'Inter', sans-serif; }
.font-manrope { font-family: 'Manrope', sans-serif !important; }
.font-inter    { font-family: 'Inter',   sans-serif !important; }

/* ── Material Symbols ─────────────────────────────── */
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

/* ── Glass effect ─────────────────────────────────── */
.glass-effect {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* ════════════════════════════════════════════════════
   BACKGROUND COLORS
════════════════════════════════════════════════════ */
.bg-background               { background-color: #f9f9ff; }
.bg-surface                  { background-color: #f9f9ff; }
.bg-surface-bright           { background-color: #f9f9ff; }
.bg-surface-dim              { background-color: #cfdaf2; }
.bg-surface-variant          { background-color: #d8e3fb; }
.bg-surface-container-lowest { background-color: #ffffff; }
.bg-surface-container-low    { background-color: #f0f3ff; }
.bg-surface-container        { background-color: #e7eeff; }
.bg-surface-container-high   { background-color: #dee8ff; }
.bg-surface-container-highest{ background-color: #d8e3fb; }
.bg-inverse-surface          { background-color: #263143; }

/* with alpha */
.bg-surface-container-low-50 { background-color: rgba(240,243,255,0.5); }

/* Primary */
.bg-primary                  { background-color: #006e2f; }
.bg-primary-container        { background-color: #22c55e; }
.bg-primary-fixed            { background-color: #6bff8f; }
.bg-primary-fixed-dim        { background-color: #4ae176; }
.bg-primary-container-20     { background-color: rgba(34,197,94,0.2); }

/* Secondary */
.bg-secondary                { background-color: #2f6a3c; }
.bg-secondary-container      { background-color: #afefb4; }
.bg-secondary-fixed          { background-color: #b2f2b7; }
.bg-secondary-container-30   { background-color: rgba(175,239,180,0.3); }

/* Tertiary */
.bg-tertiary                 { background-color: #9e4036; }
.bg-tertiary-container       { background-color: #ff8b7c; }
.bg-tertiary-container-20    { background-color: rgba(255,139,124,0.2); }

/* Error */
.bg-error                    { background-color: #ba1a1a; }
.bg-error-container          { background-color: #ffdad6; }
.bg-error-5                  { background-color: rgba(186,26,26,0.05); }

/* ════════════════════════════════════════════════════
   TEXT COLORS
════════════════════════════════════════════════════ */
.text-on-background          { color: #111c2d; }
.text-on-surface             { color: #111c2d; }
.text-on-surface-variant     { color: #3d4a3d; }
.text-on-primary             { color: #ffffff; }
.text-on-primary-container   { color: #004b1e; }
.text-on-primary-fixed       { color: #002109; }
.text-on-secondary           { color: #ffffff; }
.text-on-secondary-container { color: #346e40; }
.text-on-tertiary            { color: #ffffff; }
.text-on-tertiary-container  { color: #76231b; }
.text-on-error               { color: #ffffff; }
.text-on-error-container     { color: #93000a; }
.text-primary                { color: #006e2f; }
.text-secondary              { color: #2f6a3c; }
.text-tertiary               { color: #9e4036; }
.text-error                  { color: #ba1a1a; }
.text-outline                { color: #6d7b6c; }
.text-outline-variant        { color: #bccbb9; }
.text-inverse-primary        { color: #4ae176; }
.text-inverse-on-surface     { color: #ecf1ff; }

/* ════════════════════════════════════════════════════
   BORDER COLORS
════════════════════════════════════════════════════ */
.border-outline              { border-color: #6d7b6c; }
.border-outline-variant      { border-color: #bccbb9; }
.border-outline-variant-20   { border-color: rgba(188,203,185,0.2); }
.border-outline-variant-30   { border-color: rgba(188,203,185,0.3); }
.border-primary              { border-color: #006e2f; }
.border-error                { border-color: #ba1a1a; }
.border-error-10             { border-color: rgba(186,26,26,0.1); }

/* ════════════════════════════════════════════════════
   GRADIENT STOPS (bg-gradient-to-r requires these)
════════════════════════════════════════════════════ */
.from-primary {
  --tw-gradient-from: #006e2f var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(0,110,47,0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.to-primary-container {
  --tw-gradient-to: #22c55e var(--tw-gradient-to-position);
}

/* ════════════════════════════════════════════════════
   HOVER OVERRIDES
════════════════════════════════════════════════════ */
.hover-bg-surface-container:hover      { background-color: #e7eeff; }
.hover-bg-surface-container-high:hover { background-color: #dee8ff; }
.hover-bg-error-5:hover                { background-color: rgba(186,26,26,0.05); }

.hover-shadow-primary-20:hover {
  box-shadow: 0 10px 15px -3px rgba(0,110,47,0.2),
              0 4px  6px  -4px rgba(0,110,47,0.2);
}

/* ════════════════════════════════════════════════════
   DARK MODE (sidebar only)
════════════════════════════════════════════════════ */
.dark .dark-bg-slate-950           { background-color: #020617; }
.dark .dark-bg-green-900-20        { background-color: rgba(20,83,45,0.2); }
.dark .dark-text-green-300         { color: #86efac; }
.dark .dark-text-slate-400         { color: #94a3b8; }
.dark .dark-hover-bg-slate-800:hover { background-color: #1e293b; }

/* ════════════════════════════════════════════════════
   ANIMATIONS
════════════════════════════════════════════════════ */
@keyframes kos-pulse {
  0%,100% { opacity:1; }
  50%      { opacity:.5; }
}
.animate-pulse { animation: kos-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }

/* ════════════════════════════════════════════════════
   RESPONSIVE — mobile sidebar
════════════════════════════════════════════════════ */
.sidebar-drawer {
  transition: transform 0.25s ease;
}
@media (max-width: 1023px) {
  .sidebar-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 40;
  }
  .sidebar-drawer {
    position: fixed !important; left: 0; top: 0; bottom: 0;
    width: 17rem;
    z-index: 50;
  }
  .sidebar-drawer.closed { transform: translateX(-100%); }
  .sidebar-drawer.open   { transform: translateX(0); }
  .main-offset { margin-left: 0 !important; }
}
@media (min-width: 1024px) {
  .sidebar-overlay      { display: none !important; }
  .sidebar-drawer       { transform: translateX(0) !important; }
  .mobile-menu-btn      { display: none !important; }
  .main-offset          { margin-left: 16rem; }
}
`;

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: 'home',           label: 'Dashboard',   active: true  },
  { icon: 'door_front',     label: 'Kamar Saya',  active: false },
  { icon: 'request_quote',  label: 'Tagihan',     active: false },
  { icon: 'history',        label: 'Riwayat',     active: false },
  { icon: 'account_circle', label: 'Profil',      active: false },
];

const HOUSE_RULES = [
  { icon: 'group',        color: 'text-primary',  label: 'Maks. 2 orang/kamar'  },
  { icon: 'person_off',   color: 'text-tertiary', label: 'Tidak untuk pasutri'   },
  { icon: 'child_care',   color: 'text-tertiary', label: 'Tidak boleh bawa anak' },
  { icon: 'schedule',     color: 'text-primary',  label: 'Akses 24 Jam'          },
  { icon: 'person_alert', color: 'text-primary',  label: 'Ada jam malam tamu'    },
  { icon: 'badge',        color: 'text-primary',  label: 'Khusus karyawan'       },
];

const ROOM_AMENITIES = ['ac_unit', 'wifi', 'shower'];

const QUICK_ACTIONS = [
  {
    icon: 'history',
    bg: 'bg-secondary-container-30',
    color: 'text-secondary',
    title: 'Riwayat',
    desc: 'Lihat transaksi lama',
  },
  {
    icon: 'support_agent',
    bg: 'bg-tertiary-container-20',
    color: 'text-tertiary',
    title: 'Bantuan',
    desc: 'Layanan pengaduan',
  },
  {
    icon: 'qr_code_2',
    bg: 'bg-primary-container-20',
    color: 'text-primary',
    title: 'Akses Gate',
    desc: 'QR Code pintu utama',
  },
  {
    icon: 'account_balance_wallet',
    bg: 'bg-slate-200',
    color: 'text-slate-700',
    title: 'Saldo Deposit',
    desc: 'Rp 500.000',
  },
];

const ANNOUNCEMENTS = [
  {
    type: 'image' as const,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIhfNOi1gWADlGjw2_QiSAUQ-IFuL-Ti4w_nVjw495aY-KSvC8iYJA8BZsTmpunL397cV111NF8xKKG7YOLb4364je4ryWla4GpNdCFRZlygRZ7p5WLa9NZZddV6n5lacRVyynxVpIjeUnv3HMu0rFW7tyfGzT6wLEZubCFbQVS4exqRGIr6SU3gmrhB2B0OqTzk5pmGMR6cm4Sq8kgsHQ8bwpY6_rwREtIxvJcPjaKGy840zku1Wp913QHOCWTBHmeIPsJvYHDKhH',
    badge: 'TERBARU',
    title: 'Pembersihan Area Dapur Bersama',
    body: 'Diberitahukan bahwa area dapur lantai 2 akan dibersihkan secara menyeluruh pada hari Sabtu, 31 Agustus pukul 10:00 – 14:00 WIB.',
  },
  {
    type: 'icon' as const,
    icon: 'wifi_tethering',
    badge: null,
    title: 'Upgrade Kapasitas Internet',
    body: 'Peningkatan bandwidth internet sedang dilakukan untuk kenyamanan bekerja dari kos. Estimasi selesai sore ini.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function Page() {
  const { user, logout, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName = user?.full_name || 'Tenant';

  useEffect(() => {
    if (document.getElementById('kos-styles')) return;
    const el = document.createElement('style');
    el.id = 'kos-styles';
    el.textContent = CUSTOM_STYLES;
    document.head.insertBefore(el, document.head.firstChild);
    return () => { document.getElementById('kos-styles')?.remove(); };
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside
        className={`sidebar-drawer ${sidebarOpen ? 'open' : 'closed'} h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col p-4 gap-2`}
      >
        {/* Logo */}
        <div className="mb-8 px-2">
          <img
            src="https://lh3.googleusercontent.com/aida/ADBb0uhRKxZcseWPGH2N6VtTFeq15Qvp-6BB9aT3okC6OoSCq7dfP48T_h-iGCkugUe9m6S2BZG_gvFzs6YtKJmiykqsKAc_PWQLubYJ8HFbnMGvt0Hq8MuFjC7kvnW73piUkySL2LHgQOfybQGTLvEWX_sx4JeG4Uk8EWKH5hN8sjlgqBPDYZYh5Z1NWMwSCFyhXtHLHP4z2QzFbsFjsvB9VcSbYe8oVqL6VqONm5wlYl6LwXU0SGfu9xmcb3RsLE16bEOaeZOD1MVWWw"
            alt="KosHandayani Logo"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) =>
            item.active ? (
              <a
                key={item.label}
                href="#"
                className="bg-green-50 text-green-700 rounded-lg flex items-center gap-3 px-4 py-3 font-semibold"
                style={{ transform: 'scale(0.95)' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <span className="font-inter text-sm">{item.label}</span>
              </a>
            ) : (
              <a
                key={item.label}
                href="#"
                className="text-slate-500 hover:bg-slate-200 flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                style={{ transform: 'scale(0.95)' }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-inter text-sm">{item.label}</span>
              </a>
            )
          )}
        </nav>

        {/* User block */}
        <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0qnEsKVMHkHuca0IndT_fvNKEYkq444re0T0SQ1wlH3Ao-xgdTjbtpQ42CYPeXajYfa_uICvIWMBiYxVLLKhXfupVde0iiyhj1znXKqPxNIet20R1oXHrAR1FjXPw-pk3l9dhjbSQb7uAHzfaUN_gOTlt6Hf8aUNCytQSd-GOekETLIbLLwd7ZNFE2nwx7x2pBN629i3hxNXhVFDVoJB-_skTHFvwlAP3RbczParih48BRhT1GlBDISqk0EVh7s3652dROq_tvSZm"
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">{displayName}</p>
              <p className="text-on-surface-variant truncate" style={{ fontSize: '10px' }}>Premium Tenant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={isLoading}
            className="w-full py-2 bg-white text-error text-xs font-bold rounded-lg border border-error-10 hover-bg-error-5 transition-colors flex items-center justify-center gap-2"
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ══════════════════ MAIN ══════════════════ */}
      <main className="main-offset flex-1 p-4 lg:p-8 overflow-y-auto min-h-screen">

        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu-btn lg:hidden p-2 rounded-lg bg-surface-container-lowest shadow-sm"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-on-surface font-manrope tracking-tight">
                Selamat Datang, {displayName}!
              </h2>
              <p className="text-on-surface-variant mt-1 font-medium text-sm lg:text-base">
                Senang melihat Anda kembali di hunian kami.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="p-3 bg-surface-container-lowest rounded-xl shadow-sm hover-bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="p-3 bg-surface-container-lowest rounded-xl shadow-sm hover-bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
        </header>

        {/* House Rules */}
        <div className="mb-10 bg-surface-container-low-50 border border-outline-variant-30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 px-2">
            <span className="material-symbols-outlined text-primary text-sm">gavel</span>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Peraturan Hunian
            </h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {HOUSE_RULES.map((rule) => (
              <div
                key={rule.label}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-outline-variant-20 shadow-sm"
              >
                <span className={`material-symbols-outlined ${rule.color} text-lg`}>
                  {rule.icon}
                </span>
                <span className="text-xs font-semibold text-on-surface">{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* ── Main billing card ── */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 lg:p-8 flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Status sewa (Aktif)
                  </span>
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    Tagihan bulan ini
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl lg:text-4xl font-extrabold text-on-surface font-manrope">
                      Rp 2.250.000
                    </span>
                    <span className="text-on-surface-variant font-medium">/ bulan</span>
                  </div>
                  <p className="text-error font-bold text-sm mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">event</span>
                    Jatuh tempo 5 Sept
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">
                    Metode Pembayaran
                  </p>
                  <p className="text-sm font-semibold text-on-surface">Transfer Virtual Account</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <button className="bg-linear-to-r from-primary to-primary-container text-on-primary py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover-shadow-primary-20 transition-all active:scale-95 group">
                  Bayar Sekarang
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <button className="bg-surface-container-low text-on-surface py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover-bg-surface-container-high transition-all active:scale-95">
                  Rincian Tagihan
                  <span className="material-symbols-outlined">receipt_long</span>
                </button>
              </div>
            </div>
            <div className="bg-surface-container-low px-6 lg:px-8 py-4 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant font-medium">
                Terakhir dibayar: 5 Agustus 2024
              </p>
              <a href="#" className="text-xs text-primary font-bold hover:underline">
                Lihat Invoice Sebelumnya
              </a>
            </div>
          </div>

          {/* ── Room info card ── */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-2xl p-6 lg:p-8 relative overflow-hidden flex flex-col">
            <div className="relative z-10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Hunian Anda
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-on-surface font-manrope leading-tight">
                Superior Room B-05
              </h3>
              <p className="text-on-surface-variant font-semibold flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-base">location_on</span>
                Cabang Margonda
              </p>
            </div>
            <div className="mt-8 flex-1">
              <div className="flex items-center gap-4 mb-6">
                {ROOM_AMENITIES.map((icon) => (
                  <div
                    key={icon}
                    className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                ))}
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xs font-bold text-on-surface-variant">
                  +4
                </div>
              </div>
            </div>
            <div className="relative mt-auto">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwEFa1B7bMp3MpBhenzOvyffcPdrh39WdKdbm1KUM8U085YD1T7EaIU5VlsP_N_uKwbUbXuZHRf2nlM7sz_8mWwvO35Q-xNRRTu0NAsRmelljA6ntwBx6bYCklPej3fsGXzKZ9qOSgwwtsWV9vkFJa9jBZrBXV1wrCx72UKXPwDJLHuo4ua95ICftEoQmxKN04tU-7y6irRemrxebklyqJicNqKnKbeM5q_fjMSa3kVwIYwJjD7zfY_apG4NfuAiNyQGPbpgUFD2N_"
                alt="Superior Room B-05"
                className="w-full h-32 object-cover rounded-xl shadow-inner brightness-90"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent rounded-xl flex items-end p-4">
                <button className="text-white text-xs font-bold flex items-center gap-2 hover:gap-3 transition-all">
                  Lihat Kamar
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="col-span-12 mt-4">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6 px-2">
              Akses Cepat
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {QUICK_ACTIONS.map((action) => (
                <a
                  key={action.title}
                  href="#"
                  className="group bg-surface-container-lowest p-5 lg:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {action.icon}
                    </span>
                  </div>
                  <h5 className="font-bold text-on-surface">{action.title}</h5>
                  <p className="text-xs text-on-surface-variant mt-1">{action.desc}</p>
                </a>
              ))}
            </div>
          </div>

          {/* ── Announcements ── */}
          <div className="col-span-12 mt-8">
            <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-bold font-manrope text-on-surface">
                  Pengumuman Terkini
                </h4>
                <button className="text-primary font-bold text-sm">Lihat Semua</button>
              </div>
              <div className="space-y-6">
                {ANNOUNCEMENTS.map((item, idx) => (
                  <div
                    key={item.title}
                    className={`flex gap-4 lg:gap-6 items-start${idx > 0 ? ' pt-6 border-t border-slate-100' : ''}`}
                  >
                    {item.type === 'image' ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h6 className="font-bold text-on-surface">{item.title}</h6>
                        {item.badge && (
                          <span className="bg-surface-container-high px-2 py-1 rounded text-on-surface-variant font-bold whitespace-nowrap shrink-0" style={{ fontSize: '10px' }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pb-8 flex flex-col items-center gap-4 text-slate-500 text-xs">
          <p>© 2024 KosHandayani. Digital Concierge Property Management.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-green-600 transition-colors">Tentang Kami</a>
            <a href="#" className="hover:text-green-600 transition-colors">Syarat &amp; Ketentuan</a>
            <a href="#" className="hover:text-green-600 transition-colors">Kebijakan Privasi</a>
          </div>
        </footer>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined">chat</span>
      </button>
    </div>
  );
}
