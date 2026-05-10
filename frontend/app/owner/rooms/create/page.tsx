'use client';
import { useState } from 'react';

// Inject Google Fonts + Material Symbols + custom styles once
const styleTag = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

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
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
  }

  .material-symbols-filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: #f9f9ff;
    color: #111c2d;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }

  h1, h2, h3, h4 {
    font-family: 'Manrope', sans-serif;
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(24px);
  }

  /* Custom checkbox color */
  input[type="checkbox"]:checked {
    accent-color: #006e2f;
  }

  /* Custom radio */
  input[type="radio"]:checked + div {
    border-color: #006e2f;
    background-color: rgba(0, 110, 47, 0.05);
    color: #006e2f;
  }

  /* Select appearance */
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

  /* Number input arrow hide */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Smooth transitions */
  * {
    box-sizing: border-box;
  }

  /* focus ring */
  .focus-ring:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0,110,47,0.20);
  }

  /* toast animation */
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes toastOut {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to   { opacity: 0; transform: translateX(-50%) translateY(16px); }
  }
  .toast-in  { animation: toastIn  0.25s ease forwards; }
  .toast-out { animation: toastOut 0.25s ease forwards; }
`;

// ─── Colour tokens (mirrors tailwind config) ───────────────────────────────
const C = {
  primary: '#006e2f',
  primaryContainer: '#22c55e',
  primaryFixedDim: '#4ae176',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#004b1e',
  secondary: '#2f6a3c',
  secondaryContainer: '#afefb4',
  onSecondaryContainer: '#346e40',
  tertiary: '#9e4036',
  tertiaryContainer: '#ff8b7c',
  onTertiaryContainer: '#76231b',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  background: '#f9f9ff',
  surface: '#f9f9ff',
  surfaceBright: '#f9f9ff',
  surfaceDim: '#cfdaf2',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fb',
  surfaceVariant: '#d8e3fb',
  onSurface: '#111c2d',
  onSurfaceVariant: '#3d4a3d',
  outline: '#6d7b6c',
  outlineVariant: '#bccbb9',
  inverseSurface: '#263143',
  inverseOnSurface: '#ecf1ff',
  inversePrimary: '#4ae176',
  surfaceTint: '#006e2f',
} as const;

// ─── Icon component ────────────────────────────────────────────────────────
function Icon({
  name,
  size = 24,
  filled = false,
  style: extraStyle,
  className,
}: {
  name: string;
  size?: number;
  filled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined${filled ? ' material-symbols-filled' : ''}${className ? ' ' + className : ''}`}
      style={{ fontSize: size, ...extraStyle }}
    >
      {name}
    </span>
  );
}

// ─── NavBar ────────────────────────────────────────────────────────────────
function NavBar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 50,
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 12px 40px rgba(17,28,45,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Icon
          name="arrow_back"
          style={{ color: C.primary, cursor: 'pointer' }}
        />
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#15803d',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          KosHandayani
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          className="admin-label"
          style={{ textAlign: 'right' }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: C.onSurface,
              margin: 0,
            }}
          >
            Admin Utama
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              color: C.onSurfaceVariant,
              margin: 0,
            }}
          >
            Super Admin
          </p>
        </div>
        <img
          alt="Owner Avatar"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ4Ioa1FJpdsJU_PV6S1sPw9BED6WmvjhrJcdfA0grdLkY-D0xHj0xVRgfbUjNqFF6t5m36IK4uquS6tx_smOROYCBFQwKVTx2DylvrT7wbgGVM1DiVobTujokNlFEbXE2JlcKIJVjfMzPrLmhqHdQqYHrRlOlHCILLMGUSZeh1A4AvTq8CoO-Xhxg1jlHnaTBPJ0TcsR7VZ6SXj-13FtXkTox7ZYClEIaf-VHTgMsq8cNHVgOWoKDzyWnWN7uiBQCJzua3rfe2zDH"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '9999px',
            objectFit: 'cover',
            boxShadow: `0 0 0 2px rgba(0,110,47,0.10)`,
          }}
        />
      </div>
    </nav>
  );
}

// ─── RoomTypeRadio ─────────────────────────────────────────────────────────
function RoomTypeRadio({
  label,
  value,
  selected,
  onChange,
}: {
  label: string;
  value: string;
  selected: string;
  onChange: (v: string) => void;
}) {
  const active = selected === value;
  return (
    <label style={{ cursor: 'pointer' }}>
      <input
        type="radio"
        name="tipe"
        value={value}
        checked={active}
        onChange={() => onChange(value)}
        style={{ display: 'none' }}
      />
      <div
        style={{
          padding: '0.75rem',
          textAlign: 'center',
          border: `2px solid ${active ? C.primary : 'transparent'}`,
          background: active ? 'rgba(0,110,47,0.05)' : C.surfaceContainerLow,
          color: active ? C.primary : C.onSurfaceVariant,
          borderRadius: '0.5rem',
          transition: 'all 0.15s',
          fontWeight: 500,
          fontSize: '0.875rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </div>
    </label>
  );
}

// ─── FacilityCheckbox ──────────────────────────────────────────────────────
function FacilityCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        background: hovered ? C.surfaceContainerHigh : C.surfaceContainerLow,
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: '1.25rem',
          height: '1.25rem',
          borderRadius: '0.25rem',
          accentColor: C.primary,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: hovered ? C.onSurface : C.onSurfaceVariant,
          fontFamily: 'Inter, sans-serif',
          transition: 'color 0.15s',
        }}
      >
        {label}
      </span>
    </label>
  );
}

// ─── PhotoUploadSlot ───────────────────────────────────────────────────────
function PhotoUploadSlot() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        aspectRatio: '1/1',
        background: C.surfaceContainerLow,
        borderRadius: '0.75rem',
        border: `2px dashed ${hovered ? 'rgba(0,110,47,0.5)' : C.outlineVariant}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <Icon
        name="add_a_photo"
        size={36}
        style={{ color: hovered ? C.primary : C.outlineVariant, transition: 'color 0.15s' }}
      />
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: hovered ? C.primary : C.outlineVariant,
          transition: 'color 0.15s',
          margin: 0,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Unggah Foto Utama
      </p>
      <input
        type="file"
        accept="image/*"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

// ─── PhotoPreviewSlot ──────────────────────────────────────────────────────
function PhotoPreviewSlot({ src, alt }: { src: string; alt: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        aspectRatio: '1/1',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.40)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <button
          type="button"
          style={{
            background: 'rgba(255,255,255,0.20)',
            backdropFilter: 'blur(8px)',
            padding: '0.5rem',
            borderRadius: '9999px',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.40)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.20)')}
        >
          <Icon name="visibility" size={22} style={{ color: '#fff' }} />
        </button>
        <button
          type="button"
          style={{
            background: 'rgba(186,26,26,0.80)',
            backdropFilter: 'blur(8px)',
            padding: '0.5rem',
            borderRadius: '9999px',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = C.error)}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(186,26,26,0.80)')}
        >
          <Icon name="delete" size={22} style={{ color: '#fff' }} />
        </button>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="toast-in"
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: C.onSurface,
        color: C.surface,
        padding: '0.75rem 1.5rem',
        borderRadius: '9999px',
        boxShadow: '0 8px 32px rgba(17,28,45,0.20)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 100,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name="check_circle" filled size={22} style={{ color: C.primaryFixedDim }} />
      <span style={{ fontWeight: 500, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
        Data kamar berhasil diperbarui
      </span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Page() {
  const [roomType, setRoomType] = useState('Single');
  const [facilities, setFacilities] = useState<Record<string, boolean>>({
    'Wi-Fi': false,
    AC: false,
    'Kamar Mandi Dalam': false,
    'Water Heater': false,
    'Meja Belajar': false,
    Lemari: false,
    Laundry: false,
    'Cleaning Service': false,
  });
  const [showToast, setShowToast] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);
  const [submitActive, setSubmitActive] = useState(false);
  const [cancelActive, setCancelActive] = useState(false);

  const toggleFacility = (name: string) => {
    setFacilities(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: C.surfaceContainerLow,
    border: 'none',
    borderRadius: '0.5rem',
    padding: '1rem',
    color: C.onSurface,
    fontFamily: 'Inter, sans-serif',
    fontSize: '1rem',
    outline: 'none',
    transition: 'box-shadow 0.15s',
  };

  return (
    <>
      {/* Inject styles */}
      <style>{styleTag}</style>

      {/* Responsive admin label hide on small */}
      <style>{`
        @media (max-width: 767px) {
          .admin-label { display: none !important; }
        }
      `}</style>

      <div
        style={{
          background: C.background,
          color: C.onSurface,
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <NavBar />

        <main
          style={{
            paddingTop: '6rem',
            paddingBottom: '3rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '100vh',
          }}
        >
          <div style={{ maxWidth: '56rem', width: '100%' }}>

            {/* ── Page Header ── */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: C.primary,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '0.75rem',
                  marginBottom: '0.5rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <span style={{ width: '2rem', height: '2px', background: C.primary, display: 'inline-block' }} />
                Pengaturan Properti
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: C.onSurface,
                  margin: '0 0 0.5rem 0',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                Tambah Kamar Baru
              </h1>
              <p
                style={{
                  color: C.onSurfaceVariant,
                  fontWeight: 500,
                  margin: 0,
                  fontSize: '0.95rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Lengkapi detail informasi kamar untuk mulai menyewakan unit.
              </p>
            </div>

            {/* ── Form Canvas ── */}
            <div
              style={{
                background: C.surfaceContainerLowest,
                borderRadius: '0.75rem',
                boxShadow: '0 12px 40px rgba(17,28,45,0.06)',
                overflow: 'hidden',
              }}
            >
              <form onSubmit={handleSubmit} style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                {/* ── Section: Detail Kamar ── */}
                <div>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: C.onSurface,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1.5rem',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    <Icon name="info" style={{ color: C.primary }} />
                    Detail Kamar
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '2rem',
                    }}
                  >
                    {/* Nama Kamar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: C.onSurfaceVariant,
                          marginLeft: '0.25rem',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Nama Kamar
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: A-101"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,110,47,0.20)')}
                        onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                      />
                    </div>

                    {/* Cabang */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: C.onSurfaceVariant,
                          marginLeft: '0.25rem',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Cabang
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={{
                            ...inputStyle,
                            paddingRight: '2.5rem',
                            cursor: 'pointer',
                          }}
                          onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,110,47,0.20)')}
                          onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                        >
                          <option>Cabang 1 - Setiabudi</option>
                          <option>Cabang 2 - Margonda</option>
                        </select>
                        <Icon
                          name="expand_more"
                          style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: C.onSurfaceVariant,
                            pointerEvents: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Tipe Kamar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: C.onSurfaceVariant,
                          marginLeft: '0.25rem',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Tipe Kamar
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {['Single', 'Double', 'Suite'].map(t => (
                          <RoomTypeRadio
                            key={t}
                            label={t}
                            value={t}
                            selected={roomType}
                            onChange={setRoomType}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Harga per Bulan */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: C.onSurfaceVariant,
                          marginLeft: '0.25rem',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Harga per Bulan
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span
                          style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontWeight: 700,
                            color: C.onSurfaceVariant,
                            fontFamily: 'Inter, sans-serif',
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}
                        >
                          Rp
                        </span>
                        <input
                          type="number"
                          placeholder="1.500.000"
                          style={{ ...inputStyle, paddingLeft: '3rem' }}
                          onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,110,47,0.20)')}
                          onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section: Fasilitas ── */}
                <div>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: C.onSurface,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1.5rem',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    <Icon name="balcony" style={{ color: C.primary }} />
                    Fasilitas Kamar
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {Object.keys(facilities).map(name => (
                      <FacilityCheckbox
                        key={name}
                        label={name}
                        checked={facilities[name]}
                        onChange={() => toggleFacility(name)}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Section: Foto Kamar ── */}
                <div>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: C.onSurface,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1.5rem',
                      fontFamily: 'Manrope, sans-serif',
                    }}
                  >
                    <Icon name="photo_library" style={{ color: C.primary }} />
                    Foto Kamar
                  </h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <PhotoUploadSlot />
                    <PhotoPreviewSlot
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_LW6mOmM5-sfsU7VajFql-GDDUwGB9A2PZPUbcGrTowFQEfDCvVJjzc9t6jgTIwSkPVD3ONfgwaAuMDZNJf2gmza2iRedA56yvDVvnrl3zdxXt_JSHXJgS_iw5UwZX959jXsBwU7tACYewWHUISYHBxN8MMvfx2Sz_JPdEdyizJC7QumiYmQItD3NkoTZ8cbl5DE-ZLJOol4mYEXGH5supkTjQzgdGn_tbdE4irS8pXAHNf3w667dnVv187FsAsbzmJniXHQp0Uzn"
                      alt="Room Preview"
                    />
                    <PhotoPreviewSlot
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAV0kYu3u_dXLb4jdrVx2HvbvscCCmXzkHrSZFxczTpjwOT9V5yIdvfptSSdnbZeV5LZJuqsxo5v8J-LVyNNxdp0vo70MtyljpNN_x5hxEnuTsRA5S1xMei3j5On7D1ssXaWT__ZRn72hqHxwC6FoiO1JrvP_cUOG0qc4wTZwvqoEhT8JOH5Jt_YiJB3YxxgDTeEycmRzafMWf2Kx999uLus4GqCTvRVbND5RLcpOeo8kCOl1aOHifRYvc93fz7llVE2-OWV5Jz-pd"
                      alt="Bathroom Preview"
                    />
                  </div>

                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: C.onSurfaceVariant,
                      fontStyle: 'italic',
                      marginTop: '1rem',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    * Maksimal 5 foto per unit. Gunakan resolusi minimal 1280x720px.
                  </p>
                </div>

                {/* ── Form Actions ── */}
                <div
                  style={{
                    paddingTop: '2.5rem',
                    borderTop: `1px solid ${C.surfaceContainerHigh}`,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                  className="form-actions"
                >
                  <style>{`
                    @media (max-width: 767px) {
                      .form-actions {
                        flex-direction: column-reverse !important;
                      }
                      .form-actions button {
                        width: 100% !important;
                      }
                    }
                  `}</style>
                  <button
                    type="button"
                    onMouseEnter={() => setCancelHovered(true)}
                    onMouseLeave={() => setCancelHovered(false)}
                    onMouseDown={() => setCancelActive(true)}
                    onMouseUp={() => setCancelActive(false)}
                    style={{
                      padding: '1rem 2.5rem',
                      color: C.onSurfaceVariant,
                      fontWeight: 700,
                      background: cancelHovered ? C.surfaceContainerLow : 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      transform: cancelActive ? 'scale(0.95)' : 'scale(1)',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem',
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    onMouseEnter={() => setSubmitHovered(true)}
                    onMouseLeave={() => setSubmitHovered(false)}
                    onMouseDown={() => setSubmitActive(true)}
                    onMouseUp={() => setSubmitActive(false)}
                    style={{
                      padding: '1rem 3rem',
                      background: `linear-gradient(to right, ${C.primary}, ${C.primaryContainer})`,
                      color: '#ffffff',
                      fontWeight: 800,
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: submitHovered
                        ? '0 8px 24px rgba(0,110,47,0.40)'
                        : '0 4px 16px rgba(0,110,47,0.20)',
                      transform: submitActive ? 'scale(0.95)' : 'scale(1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '1rem',
                    }}
                  >
                    Simpan Data
                    <Icon name="save" size={20} style={{ color: '#ffffff' }} />
                  </button>
                </div>

              </form>
            </div>

            {/* ── Contextual Help Card ── */}
            <div
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(175,239,180,0.30)',
                borderLeft: `4px solid ${C.secondary}`,
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <Icon name="lightbulb" size={32} style={{ color: C.secondary, flexShrink: 0 }} />
              <div>
                <h4
                  style={{
                    fontWeight: 700,
                    color: C.onSecondaryContainer,
                    margin: '0 0 0.25rem 0',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '1rem',
                  }}
                >
                  Tips KosHandayani
                </h4>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: C.onSecondaryContainer,
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Kamar dengan informasi fasilitas yang lengkap dan minimal 3 foto berkualitas tinggi cenderung
                  mendapatkan penyewa 40% lebih cepat dibanding kamar dengan data seadanya.
                </p>
              </div>
            </div>

          </div>
        </main>

        {/* ── Toast ── */}
        <Toast visible={showToast} />
      </div>
    </>
  );
}
