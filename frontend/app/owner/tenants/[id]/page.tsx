'use client';
import { useEffect } from 'react';

// ─── Inject global styles + Google Fonts + Tailwind config ───────────────────
function GlobalStyles() {
  useEffect(() => {
    // Google Fonts
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href =
      'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(fonts);

    const materialIcons = document.createElement('link');
    materialIcons.rel = 'stylesheet';
    materialIcons.href =
      'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(materialIcons);

    // Tailwind CDN
    const twScript = document.createElement('script');
    twScript.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    twScript.onload = () => {
      const configScript = document.createElement('script');
      configScript.textContent = `
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "surface-container-highest": "#d8e3fb",
                "tertiary-fixed-dim": "#ffb4a9",
                "primary": "#006e2f",
                "tertiary-container": "#ff8b7c",
                "on-secondary-container": "#346e40",
                "on-primary-fixed": "#002109",
                "secondary-fixed-dim": "#96d59d",
                "on-secondary-fixed": "#002109",
                "on-error": "#ffffff",
                "tertiary": "#9e4036",
                "on-error-container": "#93000a",
                "surface-bright": "#f9f9ff",
                "surface-container-high": "#dee8ff",
                "on-surface": "#111c2d",
                "primary-fixed": "#6bff8f",
                "outline": "#6d7b6c",
                "error-container": "#ffdad6",
                "on-tertiary": "#ffffff",
                "on-tertiary-container": "#76231b",
                "on-tertiary-fixed-variant": "#7f2a21",
                "background": "#f9f9ff",
                "surface-tint": "#006e2f",
                "surface-container-lowest": "#ffffff",
                "surface-container": "#e7eeff",
                "primary-fixed-dim": "#4ae176",
                "on-secondary-fixed-variant": "#145126",
                "on-primary-container": "#004b1e",
                "surface-container-low": "#f0f3ff",
                "error": "#ba1a1a",
                "secondary": "#2f6a3c",
                "inverse-on-surface": "#ecf1ff",
                "on-secondary": "#ffffff",
                "inverse-primary": "#4ae176",
                "tertiary-fixed": "#ffdad5",
                "on-surface-variant": "#3d4a3d",
                "on-background": "#111c2d",
                "on-primary-fixed-variant": "#005321",
                "outline-variant": "#bccbb9",
                "surface-variant": "#d8e3fb",
                "on-tertiary-fixed": "#410001",
                "on-primary": "#ffffff",
                "inverse-surface": "#263143",
                "secondary-fixed": "#b2f2b7",
                "secondary-container": "#afefb4",
                "primary-container": "#22c55e",
                "surface": "#f9f9ff",
                "surface-dim": "#cfdaf2"
              },
              borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px"
              },
              fontFamily: {
                headline: ["Manrope"],
                body: ["Inter"],
                label: ["Inter"]
              }
            }
          }
        };
      `;
      document.head.appendChild(configScript);
    };
    document.head.appendChild(twScript);

    // Inline styles
    const style = document.createElement('style');
    style.textContent = `
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .ms-filled {
        font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      body { font-family: 'Inter', sans-serif; background-color: #f9f9ff; color: #111c2d; }
      h1, h2, h3 { font-family: 'Manrope', sans-serif; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(fonts);
      document.head.removeChild(materialIcons);
    };
  }, []);

  return null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const navItems = [
  { icon: 'dashboard', label: 'Dashboard', active: false },
  { icon: 'bed', label: 'Data Kamar', active: false },
  { icon: 'group', label: 'Data Penyewa', active: true },
  { icon: 'payments', label: 'Pembayaran', active: false },
  { icon: 'receipt_long', label: 'Pengeluaran', active: false },
  { icon: 'analytics', label: 'Laporan', active: false },
];

const tenantData = {
  applicationId: 'AV-9902',
  name: 'Aditya Pramana',
  fullName: 'Aditya Pramana Putra',
  room: 'Kamar 302 (Lantai 3)',
  moveInDate: '15 November 2024',
  duration: '12 Bulan',
  deposit: 'Rp 2.000.000',
  email: 'aditya.pramana@email.com',
  whatsapp: '+62 812-3456-7890',
  job: 'Software Engineer di TechCorp Indonesia',
  city: 'Bandung, Jawa Barat',
  nik: '3273010408990001',
  note: 'Saya mencari kos yang tenang karena sering bekerja remote dari rumah. Saya bersedia membayar sewa 1 tahun di muka jika aplikasi ini disetujui untuk mendapatkan potongan harga sesuai promo yang tertera di iklan.',
  profileImg:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQxARFQsbuV_NJn5QdXBWiaeP27QEMPWaZWem6tN2yrq7RH5GsUHc3BjOVDeHXgGEySjsjVH9XiIA11SQKfjIVEMDiTtveh4iKKRV_VWy9gPrKNBFBuxEuyzodP2vYLtnLmzUflacIAdqAk5EXKzbId2HMnKeNd1foREtzvNFGSHhSnCzgPcaEIEvLa0GM2hRYCW8HQ15L9Q4JyiEVxID25GfmPpR8JHgvwqAViAmWxjXEzQwSJX1uOqPLdwNiVC4MyuTxw96rqX97',
  ktpImg:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAbrC0fNyzWb_nDmUtRWv1iMnwPORaeam8zKyL6y2L8LA3pc9L-FHmgk1-zie88-WgkRecMdO6qNY41KgoHuNj1umBuc5HXS105G3xIGWKQhjW855Td1z2GlEKjqWL61GW_dfzmWWwOYRaZVrtaN5oj69Z_kI6Aa8C3f2D32-ObJzUc7mHRqHe-9EDdYhIcy2g7tEfIZsN9atUN0r7rp-5rETD3DD3o5cS-RtmK-ctvopnhhrsa5o5YE4cqfTNn2MLvO-RWJMPr0_lh',
  kkImg:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDnKLeh5dNLWLMQOznAPtVwMchHzB93lj6EFDUwKRU5X6hT8-RcE118hxuZr5By5vdaV23xMX6fBg6wc3Bqo5Yc2Lv9ExG3OhT5sRAwfrr8f3pdacFYcFUw58wnGSYf9RqcEUe53XxVdWkheVFL0zlX5BQEhdOErS-ua9xG6PLsUkq9LRhOUBEjPOjo02N5N4VzqgDkCLki5OtCG1bFY120_yBkAe-i6vWdKMOcEs3r-r10CVTeAl7ysJbnbBsSrXPN7CQrZx_Zo-i7',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Icon({ name, className = '', filled = false, style }: { name: string; className?: string; filled?: boolean; style?: React.CSSProperties }) {
  return (
    <span
      className={`material-symbols-outlined${filled ? ' ms-filled' : ''}${className ? ' ' + className : ''}`}
      style={style}
    >
      {name}
    </span>
  );
}

function SideNavBar() {
  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-black text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>KosHandayani</h1>
          <p className="text-[10px] text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>Owner Dashboard</p>
        </div>
        <Icon name="menu" className="text-slate-600" />
      </div>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex bg-slate-50 h-screen w-64 fixed left-0 top-0 flex-col p-4 gap-2 z-40"
        style={{ borderRight: '1px solid #f1f5f9' }}
      >
        <div className="mb-8 px-2">
          <h1 className="text-xl font-black text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>KosHandayani</h1>
          <p className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>Owner Dashboard</p>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) =>
            item.active ? (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <Icon name={item.icon} filled />
                <span>{item.label}</span>
              </a>
            ) : (
              <a
                key={item.label}
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:translate-x-1"
                style={{
                  color: '#64748b',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </a>
            )
          )}
        </nav>

        <div className="mt-auto pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
          <button
            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              backgroundColor: '#dee8ff',
              color: '#006e2f',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d8e3fb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dee8ff')}
          >
            <Icon name="apartment" className="text-sm" />
            Semua Cabang
          </button>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
}

function ApplicationStatusCard() {
  return (
    <div
      className="p-6 rounded-xl shadow-sm"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(188,203,185,0.1)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: '#dee8ff', color: '#3d4a3d' }}
        >
          Aplikasi #{tenantData.applicationId}
        </span>
        <span className="flex items-center gap-1 font-semibold text-sm" style={{ color: '#006e2f' }}>
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#006e2f' }}
          />
          Menunggu Review
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: '#d8e3fb' }}>
          <img
            src={tenantData.profileImg}
            alt="User profile photo"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold leading-tight" style={{ color: '#111c2d', fontFamily: 'Manrope, sans-serif' }}>
            {tenantData.name}
          </h3>
          <p className="text-sm font-medium" style={{ color: '#3d4a3d' }}>
            Melamar: {tenantData.room}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(188,203,185,0.15)' }}>
        {[
          { label: 'Tanggal Masuk', value: tenantData.moveInDate },
          { label: 'Durasi Sewa', value: tenantData.duration },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>
              {row.label}
            </span>
            <span className="text-sm font-bold" style={{ color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>
            Deposit Dibayar
          </span>
          <span className="text-sm font-bold" style={{ color: '#006e2f', fontFamily: 'Inter, sans-serif' }}>
            {tenantData.deposit}
          </span>
        </div>
      </div>
    </div>
  );
}

function PersonalDetailsCard() {
  return (
    <div
      className="p-8 rounded-xl shadow-sm space-y-6"
      style={{ backgroundColor: '#ffffff', border: '1px solid rgba(188,203,185,0.1)' }}
    >
      <h4
        className="text-lg font-bold flex items-center gap-2"
        style={{ color: '#111c2d', fontFamily: 'Manrope, sans-serif' }}
      >
        <Icon name="person" className="" />
        <span style={{ color: '#006e2f', display: 'inline-flex' }}>
          <Icon name="person" />
        </span>
        Data Pribadi
      </h4>

      <div className="grid grid-cols-1 gap-6">
        {[
          { label: 'Nama Lengkap', value: tenantData.fullName },
          { label: 'Email', value: tenantData.email },
          { label: 'Pekerjaan', value: tenantData.job },
          { label: 'Asal Kota', value: tenantData.city },
        ].map((field) => (
          <div key={field.label} className="space-y-1">
            <label
              className="text-xs font-bold uppercase tracking-tighter"
              style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}
            >
              {field.label}
            </label>
            <p className="text-base font-semibold" style={{ color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
              {field.value}
            </p>
          </div>
        ))}
        <div className="space-y-1">
          <label
            className="text-xs font-bold uppercase tracking-tighter"
            style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}
          >
            WhatsApp
          </label>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold" style={{ color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
              {tenantData.whatsapp}
            </p>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
              style={{
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
              }}
            >
              Terverifikasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentCard({
  title,
  imgSrc,
  imgAlt,
  infoLabel,
  infoContent,
  infoIcon,
  infoIconColor,
  infoTextColor,
  mono = false,
}: {
  title: string;
  imgSrc: string;
  imgAlt: string;
  infoLabel: string;
  infoContent: string;
  infoIcon?: string;
  infoIconColor?: string;
  infoTextColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-sm font-bold" style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>
          {title}
        </span>
        <button
          className="text-xs font-bold hover:underline"
          style={{ color: '#006e2f', fontFamily: 'Inter, sans-serif' }}
        >
          Lihat Fullscreen
        </button>
      </div>

      <div
        className="relative rounded-xl overflow-hidden cursor-zoom-in transition-all"
        style={{
          aspectRatio: '1.58/1',
          backgroundColor: '#dee8ff',
          border: '2px solid transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0,110,47,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        <img src={imgSrc} alt={imgAlt} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
        >
          <Icon name="zoom_in" className="text-3xl" style={{ color: 'white' } as React.CSSProperties} />
          <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
        </div>
      </div>

      <div
        className="mt-4 p-4 rounded-lg"
        style={{ backgroundColor: '#f0f3ff', border: '1px solid rgba(188,203,185,0.1)' }}
      >
        <p
          className="text-[10px] font-bold uppercase mb-1"
          style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}
        >
          {infoLabel}
        </p>
        {infoIcon ? (
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined ms-filled text-sm"
              style={{ color: infoIconColor }}
            >
              {infoIcon}
            </span>
            <p className="text-sm font-bold" style={{ color: infoTextColor, fontFamily: 'Inter, sans-serif' }}>
              {infoContent}
            </p>
          </div>
        ) : (
          <p
            className="text-sm font-bold"
            style={{
              color: '#111c2d',
              fontFamily: mono ? 'monospace' : 'Inter, sans-serif',
              letterSpacing: mono ? '0.05em' : undefined,
            }}
          >
            {infoContent}
          </p>
        )}
      </div>
    </div>
  );
}

function DocumentsCard() {
  return (
    <div
      className="p-8 rounded-xl shadow-sm h-full"
      style={{ backgroundColor: '#ffffff', border: '1px solid rgba(188,203,185,0.1)' }}
    >
      <h4
        className="text-lg font-bold mb-8 flex items-center gap-2"
        style={{ color: '#111c2d', fontFamily: 'Manrope, sans-serif' }}
      >
        <span className="material-symbols-outlined" style={{ color: '#006e2f' }}>description</span>
        Dokumen Pendukung
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DocumentCard
          title="Foto KTP"
          imgSrc={tenantData.ktpImg}
          imgAlt="Identity card photo preview"
          infoLabel="NIK Terdeteksi"
          infoContent={tenantData.nik}
          mono
        />
        <DocumentCard
          title="Foto Kartu Keluarga"
          imgSrc={tenantData.kkImg}
          imgAlt="Family card photo preview"
          infoLabel="Status Verifikasi AI"
          infoContent="Dokumen Valid & Cocok"
          infoIcon="verified"
          infoIconColor="#16a34a"
          infoTextColor="#15803d"
        />
      </div>

      {/* Application Note */}
      <div className="mt-12">
        <h5
          className="text-sm font-bold uppercase tracking-widest mb-4"
          style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}
        >
          Catatan Aplikasi
        </h5>
        <div
          className="p-6 rounded-xl italic text-sm leading-relaxed relative"
          style={{
            backgroundColor: '#f0f3ff',
            color: '#3d4a3d',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span
            className="material-symbols-outlined absolute text-4xl"
            style={{
              top: '-12px',
              left: '-4px',
              color: '#22c55e',
              opacity: 0.5,
            }}
          >
            format_quote
          </span>
          &quot;{tenantData.note}&quot;
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2" style={{ color: '#3d4a3d' }}>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            Verifikasi Aplikasi
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#006e2f', fontFamily: 'Inter, sans-serif' }}
          >
            Detail Penyewa
          </span>
        </div>
        <h2
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: '#111c2d', fontFamily: 'Manrope, sans-serif' }}
        >
          Verifikasi Calon Penyewa
        </h2>
      </div>

      <div className="flex gap-4">
        <button
          className="px-6 py-3 font-bold rounded-xl transition-colors flex items-center gap-2"
          style={{
            border: '1px solid #bccbb9',
            color: '#9e4036',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffdad6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span className="material-symbols-outlined text-xl">close</span>
          Tolak
        </button>
        <button
          className="px-6 py-3 font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(to right, #006e2f, #22c55e)',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0,110,47,0.2)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span className="material-symbols-outlined ms-filled text-xl">check_circle</span>
          Setujui
        </button>
      </div>
    </header>
  );
}

function PageFooter() {
  return (
    <footer className="mt-12 pt-8 flex flex-col items-center gap-4 px-8" style={{ borderTop: '1px solid rgba(188,203,185,0.2)' }}>
      <p className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
        © 2024 KosHandayani. Digital Concierge Property Management.
      </p>
      <div className="flex gap-6">
        {['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-xs transition-colors"
            style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#16a34a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}

// ─── Page Root ─────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <>
      <GlobalStyles />

      {/* Scoped CSS via style tag rendered in DOM */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
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
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          -webkit-font-smoothing: antialiased;
        }

        .ms-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background-color: #f0f3ff;
          color: #111c2d;
        }

        h1, h2, h3, h4, h5 {
          font-family: 'Manrope', sans-serif;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }

        .hover\\:scale-\\[1\\.02\\]:hover { transform: scale(1.02); }
        .hover\\:translate-x-1:hover { transform: translateX(4px); }
        .transition-all { transition: all 0.2s; }
        .transition-colors { transition: color 0.2s, background-color 0.2s, border-color 0.2s; }
        .transition-opacity { transition: opacity 0.2s; }

        .sidebar-nav-active {
          background-color: #dcfce7;
          color: #15803d;
        }

        .sidebar-nav-item:hover {
          background-color: #f1f5f9;
          transform: translateX(4px);
        }

        .doc-card-wrapper:hover .doc-image-container {
          border-color: rgba(0,110,47,0.3);
        }

        .doc-card-wrapper:hover .doc-image-overlay {
          opacity: 1;
        }

        /* responsive */
        @media (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .main-with-sidebar { margin-left: 0 !important; padding-top: 72px; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* ── Sidebar ── */}
        <aside
          className="sidebar-desktop"
          style={{
            backgroundColor: '#f8fafc',
            height: '100vh',
            width: '256px',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            gap: '8px',
            zIndex: 40,
            borderRight: '1px solid #f1f5f9',
          }}
        >
          <div style={{ marginBottom: '32px', padding: '0 8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
              KosHandayani
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Owner Dashboard</p>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: item.active ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: item.active ? '#dcfce7' : 'transparent',
                  color: item.active ? '#15803d' : '#64748b',
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              style={{
                width: '100%',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#dee8ff',
                color: '#006e2f',
                fontWeight: 700,
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d8e3fb')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dee8ff')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>apartment</span>
              Semua Cabang
            </button>
            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                color: '#64748b',
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </a>
          </div>
        </aside>

        {/* ── Mobile Top Bar ── */}
        <div
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '12px 16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
          className="mobile-topbar"
        >
          <style>{`
            @media (max-width: 1023px) {
              .mobile-topbar { display: flex !important; }
            }
          `}</style>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', fontFamily: 'Manrope, sans-serif' }}>
              KosHandayani
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Owner Dashboard</div>
          </div>
          <span className="material-symbols-outlined" style={{ color: '#475569' }}>menu</span>
        </div>

        {/* ── Main Content ── */}
        <main
          className="main-with-sidebar"
          style={{
            flex: 1,
            marginLeft: '256px',
            padding: '32px',
            backgroundColor: '#f0f3ff',
            minHeight: '100vh',
          }}
        >
          <style>{`
            @media (max-width: 1023px) {
              .main-with-sidebar {
                margin-left: 0 !important;
                padding-top: 80px !important;
                padding-left: 16px !important;
                padding-right: 16px !important;
              }
            }
            @media (max-width: 639px) {
              .header-actions { flex-direction: column; align-items: flex-start !important; }
              .header-buttons { width: 100%; }
              .header-buttons button { flex: 1; justify-content: center; }
            }
          `}</style>

          {/* Header */}
          <header
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}
            className="header-actions"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3d4a3d', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                  Verifikasi Aplikasi
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>chevron_right</span>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#006e2f', fontFamily: 'Inter, sans-serif' }}>
                  Detail Penyewa
                </span>
              </div>
              <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.025em', color: '#111c2d', fontFamily: 'Manrope, sans-serif' }}>
                Verifikasi Calon Penyewa
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '16px' }} className="header-buttons">
              <button
                style={{
                  padding: '12px 24px',
                  border: '1px solid #bccbb9',
                  color: '#9e4036',
                  fontWeight: 700,
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffdad6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                Tolak
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(to right, #006e2f, #22c55e)',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(0,110,47,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: '20px' }}>check_circle</span>
                Setujui
              </button>
            </div>
          </header>

          {/* Grid */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}
            className="content-grid"
          >
            <style>{`
              @media (min-width: 1024px) {
                .content-grid { grid-template-columns: 5fr 7fr !important; }
              }
            `}</style>

            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Application Status Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(188,203,185,0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <span
                    style={{
                      backgroundColor: '#dee8ff',
                      color: '#3d4a3d',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Aplikasi #{tenantData.applicationId}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#006e2f',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#006e2f',
                        animation: 'pulse 2s infinite',
                      }}
                    />
                    Menunggu Review
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#d8e3fb',
                      flexShrink: 0,
                    }}
                  >
                    <img src={tenantData.profileImg} alt="Foto profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111c2d', lineHeight: 1.2, fontFamily: 'Manrope, sans-serif' }}>
                      {tenantData.name}
                    </h3>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>
                      Melamar: {tenantData.room}
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(188,203,185,0.15)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Tanggal Masuk', value: tenantData.moveInDate, colored: false },
                    { label: 'Durasi Sewa', value: tenantData.duration, colored: false },
                    { label: 'Deposit Dibayar', value: tenantData.deposit, colored: true },
                  ].map((row) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>{row.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: row.colored ? '#006e2f' : '#111c2d', fontFamily: 'Inter, sans-serif' }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Details Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '32px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(188,203,185,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111c2d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#006e2f' }}>person</span>
                  Data Pribadi
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {[
                    { label: 'Nama Lengkap', value: tenantData.fullName },
                    { label: 'Email', value: tenantData.email },
                    { label: 'Pekerjaan', value: tenantData.job },
                    { label: 'Asal Kota', value: tenantData.city },
                  ].map((field) => (
                    <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#3d4a3d',
                          textTransform: 'uppercase',
                          letterSpacing: '-0.025em',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {field.label}
                      </label>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
                        {field.value}
                      </p>
                    </div>
                  ))}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#3d4a3d',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.025em',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      WhatsApp
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#111c2d', fontFamily: 'Inter, sans-serif' }}>
                        {tenantData.whatsapp}
                      </p>
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Terverifikasi
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Documents */}
            <div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '32px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(188,203,185,0.1)',
                  height: '100%',
                }}
              >
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111c2d',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#006e2f' }}>description</span>
                  Dokumen Pendukung
                </h4>

                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}
                  className="docs-grid"
                >
                  <style>{`@media (min-width: 768px) { .docs-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>

                  {/* KTP */}
                  <div className="doc-card-group" style={{ position: 'relative' }}>
                    <style>{`
                      .doc-card-group:hover .doc-overlay { opacity: 1 !important; }
                      .doc-card-group:hover .doc-img-border { border-color: rgba(0,110,47,0.3) !important; }
                    `}</style>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>Foto KTP</span>
                      <button style={{ color: '#006e2f', fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Lihat Fullscreen
                      </button>
                    </div>
                    <div
                      className="doc-img-border"
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        aspectRatio: '1.58/1',
                        backgroundColor: '#dee8ff',
                        border: '2px solid transparent',
                        cursor: 'zoom-in',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <img src={tenantData.ktpImg} alt="Foto KTP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div
                        className="doc-overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '30px' }}>zoom_in</span>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#f0f3ff',
                        border: '1px solid rgba(188,203,185,0.1)',
                      }}
                    >
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#3d4a3d', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                        NIK Terdeteksi
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#111c2d', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {tenantData.nik}
                      </p>
                    </div>
                  </div>

                  {/* KK */}
                  <div className="doc-card-group" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>Foto Kartu Keluarga</span>
                      <button style={{ color: '#006e2f', fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Lihat Fullscreen
                      </button>
                    </div>
                    <div
                      className="doc-img-border"
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        aspectRatio: '1.58/1',
                        backgroundColor: '#dee8ff',
                        border: '2px solid transparent',
                        cursor: 'zoom-in',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <img src={tenantData.kkImg} alt="Foto Kartu Keluarga" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div
                        className="doc-overlay"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '30px' }}>zoom_in</span>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#f0f3ff',
                        border: '1px solid rgba(188,203,185,0.1)',
                      }}
                    >
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#3d4a3d', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                        Status Verifikasi AI
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined ms-filled" style={{ color: '#16a34a', fontSize: '18px' }}>verified</span>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#15803d', fontFamily: 'Inter, sans-serif' }}>
                          Dokumen Valid &amp; Cocok
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Note */}
                <div style={{ marginTop: '48px' }}>
                  <h5
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#3d4a3d',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '16px',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Catatan Aplikasi
                  </h5>
                  <div
                    style={{
                      backgroundColor: '#f0f3ff',
                      padding: '24px',
                      borderRadius: '12px',
                      fontStyle: 'italic',
                      color: '#3d4a3d',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      position: 'relative',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '-4px',
                        color: '#22c55e',
                        fontSize: '36px',
                        opacity: 0.5,
                      }}
                    >
                      format_quote
                    </span>
                    &quot;{tenantData.note}&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer
            style={{
              marginTop: '48px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(188,203,185,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              paddingLeft: '32px',
              paddingRight: '32px',
            }}
          >
            <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
              © 2024 KosHandayani. Digital Concierge Property Management.
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map((link) => (
                <a
                  key={link}
                  href="#"
                  style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'Inter, sans-serif', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#16a34a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  {link}
                </a>
              ))}
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
