'use client';
import { useEffect, useRef, useState } from 'react';

/* ─── Inject Google Fonts & Material Symbols ─── */
function GlobalStyles() {
  useEffect(() => {
    const ids = ['gf-manrope-inter', 'gf-material-symbols'];
    const links: [string, string][] = [
      [
        'gf-manrope-inter',
        'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap',
      ],
      [
        'gf-material-symbols',
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
      ],
    ];
    links.forEach(([id, href]) => {
      if (!document.getElementById(id)) {
        const el = document.createElement('link');
        el.id = id;
        el.rel = 'stylesheet';
        el.href = href;
        document.head.appendChild(el);
      }
    });

    const styleId = 'page-custom-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
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
          -webkit-font-feature-settings: 'liga';
          font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .mat-fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-effect {
          background: rgba(249,249,255,0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #bccbb9; border-radius: 9999px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `;
      document.head.appendChild(style);
    }
    return () => ids.forEach(() => {});
  }, []);
  return null;
}

/* ─── Color & design tokens (mirrors original tailwind config) ─── */
const C = {
  primary: '#006e2f',
  primaryContainer: '#22c55e',
  primaryFixed: '#6bff8f',
  primaryFixedDim: '#4ae176',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#004b1e',
  onPrimaryFixed: '#002109',
  onPrimaryFixedVariant: '#005321',
  secondary: '#2f6a3c',
  secondaryContainer: '#afefb4',
  secondaryFixed: '#b2f2b7',
  secondaryFixedDim: '#96d59d',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#346e40',
  onSecondaryFixed: '#002109',
  onSecondaryFixedVariant: '#145126',
  tertiary: '#9e4036',
  tertiaryContainer: '#ff8b7c',
  tertiaryFixed: '#ffdad5',
  tertiaryFixedDim: '#ffb4a9',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#76231b',
  onTertiaryFixed: '#410001',
  onTertiaryFixedVariant: '#7f2a21',
  background: '#f9f9ff',
  surface: '#f9f9ff',
  surfaceBright: '#f9f9ff',
  surfaceDim: '#cfdaf2',
  surfaceTint: '#006e2f',
  surfaceVariant: '#d8e3fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fb',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3d4a3d',
  inverseSurface: '#263143',
  inverseOnSurface: '#ecf1ff',
  inversePrimary: '#4ae176',
  outline: '#6d7b6c',
  outlineVariant: '#bccbb9',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',
};

/* ─── Types ─── */
type Status = 'Aktif' | 'Belum Diverifikasi' | 'Menunggu Bayar';

interface Tenant {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  room: string;
  branch: string;
  startDate: string;
  duration: string;
  endDate: string;
  status: Status;
}

/* ─── Static data ─── */
const TENANTS: Tenant[] = [
  {
    id: 1,
    name: 'Aditya Pratama',
    email: 'aditya.p@gmail.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBeSvOiy9hdTBIXV9nSGcE6qMyPFoaqBtxLxNIliDVTfX2SMTVITJrMQqsXWSUcxtE6Uy9os0SOa5YwNjnSFoVX18LF_ZNVVL1FkWHQgnpxH-tvhXYJPWzRYjVPFk7HGB5aALPrvpSbC1whvBX-CF9Rra1MBJXxYYwTFTJCiXqBXbTl_CED2sLw5OoStNndSt5uYyLxNUElM38sRtgGZsKy_xBz-lOaksYSG4kWEIs0rhDoZ8CTWVmxIHxjOTNOs6FInfHMVnMjytIH',
    room: 'Kamar 302',
    branch: 'Cabang 1',
    startDate: '12 Okt 2023',
    duration: '12 bln',
    endDate: '12 Okt 2024',
    status: 'Aktif',
  },
  {
    id: 2,
    name: 'Siti Rahmawati',
    email: 'siti.rahma@outlook.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7tK5eC7-ygdzvkdZdlJnFSGCxWqDZ6UIPyftjwG5eM9pNNmDdEge1UjaQYx-xUNBBAIOl2qZs3nzgsfkVXvumyv5Ei6ZgTZImUHxeVHr7L3gUhelK4-IMIc21yenkH1HoMoP7nrxdVMbDjEDPzDb-5qDTsQ30shZ9XPCAsGX8WmFK5bKlyBXSBFN_oAohLjNSH3RCTNiqDrICRidSzjWZhBXsnEeu56g4JaemqWNXcao9gcqc2IxhgnqJFop8NBAE_sdAvPbooW-x',
    room: 'Kamar 105',
    branch: 'Cabang 2',
    startDate: '24 Mar 2024',
    duration: '6 bln',
    endDate: '24 Sep 2024',
    status: 'Belum Diverifikasi',
  },
  {
    id: 3,
    name: 'Budi Pratomo',
    email: 'budi.pratomo@id.co',
    initials: 'BP',
    room: 'Kamar 411',
    branch: 'Cabang 1',
    startDate: '05 Jan 2024',
    duration: '12 bln',
    endDate: '05 Jan 2025',
    status: 'Menunggu Bayar',
  },
  {
    id: 4,
    name: 'Dimas Setiawan',
    email: 'dimas.setiawan@gmail.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASqD9T5Jt0n00d5QaoWAVzlXYCshz8pEd1MB6pTEWTp20gWoVt6WgjjyUXJqmJAUmu-G1jGjkHWFddbEi7f1Zotgi1o2Bo--YkZBfI17efh1uyT98gWrC2f2nTpgG5J6X5WqoGu1W7Sukdmx2a3TszraqPZAdGu2gr_7fIQZdX-Ts3pDif1yhxCA49uFELeTMylaXQAjMmVY8JyGGFuuHy0Yu2tFQWoeB92OFdqy8R7-Dt7W1mWrWVVIF2_cYA3k_Z-wm94_AmJK_9',
    room: 'Kamar 208',
    branch: 'Cabang 2',
    startDate: '18 Feb 2024',
    duration: '12 bln',
    endDate: '18 Feb 2025',
    status: 'Aktif',
  },
];

/* ─── StatusBadge ─── */
function StatusBadge({ status }: { status: Status }) {
  if (status === 'Aktif')
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 12px',
          background: '#dcfce7',
          color: '#15803d',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 700,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
        Aktif
      </span>
    );
  if (status === 'Belum Diverifikasi')
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 12px',
          background: '#fef3c7',
          color: '#b45309',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 700,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
        Belum Diverifikasi
      </span>
    );
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 12px',
        background: '#dbeafe',
        color: '#1d4ed8',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 700,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
      Menunggu Bayar
    </span>
  );
}

/* ─── SideNav ─── */
const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', active: false },
  { icon: 'bed', label: 'Data Kamar', active: false },
  { icon: 'group', label: 'Data Penyewa', active: true, fill: true },
  { icon: 'payments', label: 'Pembayaran', active: false },
  { icon: 'receipt_long', label: 'Pengeluaran', active: false },
  { icon: 'analytics', label: 'Laporan', active: false },
];

function SideNav({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 49,
          }}
        />
      )}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: 256,
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          gap: '8px',
          zIndex: 50,
          overflowY: 'auto',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          boxShadow: '2px 0 16px rgba(17,28,45,0.06)',
          transition: 'transform 0.25s',
        }}
        className="sidenav"
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, padding: '0 8px' }}>
          <img
            alt="KosHandayani Logo"
            style={{ height: 40, width: 'auto', objectFit: 'contain' }}
            src="https://lh3.googleusercontent.com/aida/ADBb0uhRKxZcseWPGH2N6VtTFeq15Qvp-6BB9aT3okC6OoSCq7dfP48T_h-iGCkugUe9m6S2BZG_gvFzs6YtKJmiykqsKAc_PWQLubYJ8HFbnMGvt0Hq8MuFjC7kvnW73piUkySL2LHgQOfybQGTLvEWX_sx4JeG4Uk8EWKH5hN8sjlgqBPDYZYh5Z1NWMwSCFyhXtHLHP4z2QzFbsFjsvB9VcSbYe8oVqL6VqONm5wlYl6LwXU0SGfu9xmcb3RsLE16bEOaeZOD1MVWWw"
          />
          <p style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter,sans-serif', marginTop: 4 }}>
            Owner Dashboard
          </p>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'Inter,sans-serif',
                fontWeight: item.active ? 700 : 400,
                color: item.active ? C.primary : '#64748b',
                background: item.active ? '#dcfce7' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(0)';
                }
              }}
            >
              <span className={`material-symbols-outlined${item.fill ? ' mat-fill' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#ffffff',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(17,28,45,0.06)',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(17,28,45,0.1)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(17,28,45,0.06)')}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', fontFamily: 'Inter,sans-serif' }}>
              Semua Cabang
            </span>
            <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: 20 }}>
              expand_more
            </span>
          </button>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 14,
              fontFamily: 'Inter,sans-serif',
              color: '#64748b',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Hide sidenav on small screens unless mobileOpen */}
      <style>{`
        @media (max-width: 768px) {
          .sidenav {
            transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
          }
        }
        @media (min-width: 769px) {
          .sidenav {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── StatCard ─── */
function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  gradient,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  gradient?: boolean;
}) {
  if (gradient) {
    return (
      <div
        style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})`,
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,110,47,0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 110,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 30, fontWeight: 900, color: '#ffffff', fontFamily: 'Manrope,sans-serif' }}>{value}</p>
          <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 30 }}>
            trending_up
          </span>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        background: C.surfaceContainerLowest,
        padding: 24,
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(17,28,45,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 24, fontWeight: 900, color: C.onSurface, fontFamily: 'Manrope,sans-serif', lineHeight: 1.1 }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── TenantRow ─── */
function TenantRow({ tenant }: { tenant: Tenant }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.surfaceContainerLow : 'transparent',
        transition: 'background 0.15s',
        fontSize: 13,
        height: 72,
      }}
    >
      {/* Name */}
      <td style={{ padding: '0 32px', verticalAlign: 'middle', width: '30%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {tenant.avatar ? (
            <img
              alt="Avatar"
              src={tenant.avatar}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: C.surfaceContainerHigh,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.onSurfaceVariant,
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {tenant.initials}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: C.onSurface, margin: 0, fontSize: 13 }}>{tenant.name}</p>
            <p style={{ fontSize: 11, color: C.onSurfaceVariant, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tenant.email}
            </p>
          </div>
        </div>
      </td>
      {/* Room */}
      <td style={{ padding: '0 16px', verticalAlign: 'middle', width: '10%', whiteSpace: 'nowrap' }}>
        <span
          style={{
            padding: '4px 8px',
            background: C.surfaceContainerHigh,
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            color: C.onSurface,
            display: 'inline-block',
          }}
        >
          {tenant.room}
        </span>
      </td>
      {/* Branch */}
      <td style={{ padding: '0 16px', verticalAlign: 'middle', width: '12%', color: C.onSurface, fontSize: 13, whiteSpace: 'nowrap' }}>
        {tenant.branch}
      </td>
      {/* Start */}
      <td style={{ padding: '0 16px', verticalAlign: 'middle', width: '14%', color: C.onSurface, fontSize: 13, whiteSpace: 'nowrap' }}>
        {tenant.startDate}
      </td>
      {/* Duration */}
      <td style={{ padding: '0 16px', verticalAlign: 'middle', width: '10%', textAlign: 'center', color: C.onSurface, fontSize: 13, whiteSpace: 'nowrap' }}>
        {tenant.duration}
      </td>
      {/* End */}
      <td style={{ padding: '0 16px', verticalAlign: 'middle', width: '14%', color: C.onSurface, fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap' }}>
        {tenant.endDate}
      </td>
      {/* Status */}
      <td style={{ padding: '0 16px', verticalAlign: 'middle', width: '12%', whiteSpace: 'nowrap' }}>
        <StatusBadge status={tenant.status} />
      </td>
      {/* Actions */}
      <td style={{ padding: '0 32px', verticalAlign: 'middle', textAlign: 'right', width: '18%', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          {tenant.status === 'Belum Diverifikasi' && (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 14px',
                background: C.primary,
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,110,47,0.25)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = C.primaryContainer;
                (e.currentTarget as HTMLButtonElement).style.color = C.onPrimaryContainer;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = C.primary;
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }}
            >
              Verifikasi
            </button>
          )}
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 14px',
              background: C.surfaceContainerHigh,
              color: C.onSurface,
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = C.surfaceContainerHighest)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = C.surfaceContainerHigh)}
          >
            Detail
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Mobile Card ─── */
function TenantCard({ tenant }: { tenant: Tenant }) {
  return (
    <div
      style={{
        background: C.surfaceContainerLowest,
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 16px rgba(17,28,45,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {tenant.avatar ? (
          <img
            alt="Avatar"
            src={tenant.avatar}
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: C.surfaceContainerHigh,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.onSurfaceVariant,
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {tenant.initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: C.onSurface, margin: 0, fontSize: 14 }}>{tenant.name}</p>
          <p style={{ fontSize: 12, color: C.onSurfaceVariant, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tenant.email}
          </p>
        </div>
        <StatusBadge status={tenant.status} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13 }}>
        <div>
          <p style={{ margin: 0, color: C.onSurfaceVariant, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kamar</p>
          <p style={{ margin: 0, color: C.onSurface, fontWeight: 700 }}>{tenant.room}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: C.onSurfaceVariant, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cabang</p>
          <p style={{ margin: 0, color: C.onSurface }}>{tenant.branch}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: C.onSurfaceVariant, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mulai</p>
          <p style={{ margin: 0, color: C.onSurface }}>{tenant.startDate}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: C.onSurfaceVariant, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Berakhir</p>
          <p style={{ margin: 0, color: C.onSurface, fontWeight: 500 }}>{tenant.endDate}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {tenant.status === 'Belum Diverifikasi' && (
          <button
            style={{
              padding: '6px 16px',
              background: C.primary,
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Verifikasi
          </button>
        )}
        <button
          style={{
            padding: '6px 16px',
            background: C.surfaceContainerHigh,
            color: C.onSurface,
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Detail
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Page() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Belum Diverifikasi' | 'Menunggu Pembayaran' | 'Penyewa Aktif'>('Semua');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<'Semua' | 'Cabang 1' | 'Cabang 2'>('Semua');
  const [page, setPage] = useState(1);

  const filteredTenants = TENANTS.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchBranch = branchFilter === 'Semua' || t.branch === branchFilter;
    const matchTab =
      activeTab === 'Semua' ||
      (activeTab === 'Belum Diverifikasi' && t.status === 'Belum Diverifikasi') ||
      (activeTab === 'Menunggu Pembayaran' && t.status === 'Menunggu Bayar') ||
      (activeTab === 'Penyewa Aktif' && t.status === 'Aktif');
    return matchSearch && matchBranch && matchTab;
  });

  const STATUS_TABS = ['Semua', 'Belum Diverifikasi', 'Menunggu Pembayaran', 'Penyewa Aktif'] as const;

  return (
    <>
      <GlobalStyles />
      <div
        style={{
          fontFamily: 'Inter,sans-serif',
          background: C.surfaceBright,
          color: C.onSurface,
          minHeight: '100vh',
          display: 'flex',
        }}
      >
        <SideNav mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* Mobile top bar */}
        <div
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            background: C.surfaceContainerLowest,
            zIndex: 40,
            alignItems: 'center',
            padding: '0 16px',
            boxShadow: '0 1px 6px rgba(17,28,45,0.06)',
            gap: 12,
          }}
          className="mobile-topbar"
        >
          <button
            onClick={() => setMobileNavOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurface, display: 'flex', alignItems: 'center' }}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 16, color: C.onSurface }}>
            KosHandayani
          </span>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .mobile-topbar { display: flex !important; }
            .main-content { margin-left: 0 !important; padding-top: 72px !important; }
          }
        `}</style>

        {/* Main */}
        <main
          className="main-content"
          style={{
            marginLeft: 256,
            flex: 1,
            minHeight: '100vh',
            padding: 32,
            background: C.surfaceBright,
          }}
        >
          {/* Header */}
          <header
            style={{
              marginBottom: 40,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 24,
            }}
          >
            <div>
              <nav style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.onSurfaceVariant, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Manajemen Properti
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  chevron_right
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>Data Penyewa</span>
              </nav>
              <h2
                style={{
                  fontFamily: 'Manrope,sans-serif',
                  fontSize: 'clamp(28px, 5vw, 36px)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: C.onSurface,
                  margin: 0,
                }}
              >
                Daftar Penyewa
              </h2>
              <p style={{ color: C.onSurfaceVariant, marginTop: 4, margin: '4px 0 0', fontSize: 14 }}>
                Kelola dan verifikasi penghuni dari seluruh cabang KosHandayani.
              </p>
            </div>

            {/* Search & filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: C.outlineVariant,
                    fontSize: 20,
                    pointerEvents: 'none',
                  }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari nama penyewa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    paddingLeft: 40,
                    paddingRight: 16,
                    paddingTop: 10,
                    paddingBottom: 10,
                    background: C.surfaceContainerLow,
                    border: 'none',
                    borderRadius: 12,
                    outline: 'none',
                    width: 256,
                    fontSize: 14,
                    color: C.onSurface,
                    fontFamily: 'Inter,sans-serif',
                    transition: 'background 0.15s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.background = C.surfaceContainerLowest)}
                  onBlur={(e) => (e.currentTarget.style.background = C.surfaceContainerLow)}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  background: C.surfaceContainerLow,
                  padding: 4,
                  borderRadius: 12,
                }}
              >
                {(['Semua', 'Cabang 1', 'Cabang 2'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBranchFilter(b)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: branchFilter === b ? 700 : 500,
                      color: branchFilter === b ? C.primary : C.onSurfaceVariant,
                      background: branchFilter === b ? C.surfaceContainerLowest : 'transparent',
                      boxShadow: branchFilter === b ? '0 1px 4px rgba(17,28,45,0.08)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
              marginBottom: 32,
            }}
          >
            <StatCard icon="group" iconBg={`${C.primary}1a`} iconColor={C.primary} label="Total Penyewa" value="124" />
            <StatCard icon="pending_actions" iconBg="#fef3c7" iconColor="#d97706" label="Belum Diverifikasi" value="8" />
            <StatCard icon="receipt" iconBg="#dbeafe" iconColor="#2563eb" label="Menunggu Bayar" value="15" />
            <StatCard icon="trending_up" iconBg="" iconColor="" label="Tenant Baru Bulan Ini" value="+12" gradient />
          </div>

          {/* Table card */}
          <div
            style={{
              background: C.surfaceContainerLowest,
              borderRadius: 12,
              boxShadow: '0 12px 40px rgba(17,28,45,0.04)',
              overflow: 'hidden',
            }}
          >
            {/* Status Tabs */}
            <div
              className="scrollbar-hide"
              style={{
                padding: '24px 32px 0',
                borderBottom: `1px solid ${C.surfaceContainerLow}`,
                display: 'flex',
                gap: 32,
                overflowX: 'auto',
              }}
            >
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    paddingBottom: 16,
                    fontSize: 14,
                    fontWeight: activeTab === tab ? 700 : 500,
                    color: activeTab === tab ? C.primary : C.onSurfaceVariant,
                    borderBottom: activeTab === tab ? `2px solid ${C.primary}` : '2px solid transparent',
                    background: 'none',
                    border: 'none',
                    borderBottomStyle: 'solid',
                    borderBottomWidth: 2,
                    borderBottomColor: activeTab === tab ? C.primary : 'transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter,sans-serif',
                    transition: 'color 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Desktop table */}
            <div style={{ overflowX: 'auto' }} className="desktop-table">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: `${C.surfaceContainerLow}4d`, height: 56 }}>
                    <th style={{ padding: '0 32px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'left', width: '30%', verticalAlign: 'middle' }}>Nama Penyewa</th>
                    <th style={{ padding: '0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'left', width: '10%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Kamar</th>
                    <th style={{ padding: '0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'left', width: '12%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Cabang</th>
                    <th style={{ padding: '0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'left', width: '14%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Mulai Sewa</th>
                    <th style={{ padding: '0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'center', width: '10%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Durasi</th>
                    <th style={{ padding: '0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'left', width: '14%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Berakhir</th>
                    <th style={{ padding: '0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'left', width: '12%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '0 32px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onSurfaceVariant, textAlign: 'right', width: '18%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: `1px solid ${C.surfaceContainerLow}` }}>
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '48px 32px', color: C.onSurfaceVariant, fontSize: 14 }}>
                        Tidak ada penyewa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${C.surfaceContainerLow}` }}>
                        <TenantRow tenant={t} />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: 12, padding: 16 }}>
              {filteredTenants.length === 0 ? (
                <p style={{ textAlign: 'center', color: C.onSurfaceVariant, fontSize: 14, padding: 32 }}>
                  Tidak ada penyewa ditemukan.
                </p>
              ) : (
                filteredTenants.map((t) => <TenantCard key={t.id} tenant={t} />)
              )}
            </div>

            <style>{`
              @media (max-width: 900px) {
                .desktop-table { display: none !important; }
                .mobile-cards { display: flex !important; }
              }
            `}</style>

            {/* Pagination */}
            <div
              style={{
                padding: '16px 32px',
                background: `${C.surfaceContainerLow}4d`,
                borderTop: `1px solid ${C.surfaceContainer}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <p style={{ fontSize: 12, color: C.onSurfaceVariant, fontWeight: 500, margin: 0 }}>
                Menampilkan {filteredTenants.length} dari 124 penyewa
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    border: `1px solid ${C.outlineVariant}4d`,
                    background: 'none',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.3 : 1,
                    color: C.onSurface,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: page === n ? 'none' : `1px solid ${C.outlineVariant}4d`,
                      background: page === n ? C.primary : 'none',
                      color: page === n ? '#ffffff' : C.onSurface,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(3, p + 1))}
                  disabled={page === 3}
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    border: `1px solid ${C.outlineVariant}4d`,
                    background: 'none',
                    cursor: page === 3 ? 'not-allowed' : 'pointer',
                    opacity: page === 3 ? 0.3 : 1,
                    color: C.onSurface,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer
            style={{
              width: '100%',
              paddingTop: 32,
              paddingBottom: 32,
              marginTop: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              borderTop: '1px solid rgba(226,232,240,0.6)',
            }}
          >
            <p style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter,sans-serif', margin: 0 }}>
              © 2024 KosHandayani. Digital Concierge Property Management.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map((link) => (
                <a
                  key={link}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: '#94a3b8',
                    fontSize: 12,
                    fontFamily: 'Inter,sans-serif',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#475569')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8')}
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
