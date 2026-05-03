'use client';
import Image from 'next/image';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import RoomCard from '../components/RoomCard';
import { getRooms } from '../lib/api';
import type { ApiRoom } from '../lib/api';

const fallbackRoomImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC7uVQv8xDfsE9bJJTiyHrg-mERi5kyQhFpZ41wqDnrM1ah5iYR3qDsh1lFDWAhG0fH6jSif0k6OtydDEZwNg9rNyO9dUdEhXR59M9HyLc3ou6pCJbx2j37PhexqprKNNVkEw5OX8ymP1xeFnVswqe0dWfvayjHamQpTyQMKLpn7824sxUyezJFbvJ3GjgXulU4t-Zha28LZ7dUP1WtPy1ktshKt-YUSb3bRmkQhN5tdsBITPqVbLyjfa8lVybDt05cTYko93QzqEKs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAYeGTfgiMhJ-6jkx1L404v4nkblcFwQgOLUEUxDPURKrJwtD2KYvMF8jmwmJLqCt32F1HDDuRIPQyhEQag9uw58tbxXXfKltsjqvdiy2fkE1_1IEigOkviSg4FwZAS4bgV83qjdT_i14GpQ2YZXKQhGnIjxq3-qo-0abmRAsgh4lyI6QtOXilrsiThWiaZBPEWm07LgGM0X8VY-EK7Bwqwq2oC7mUJNAAliz-KLQxRX88GsCIiLBt4pl4VEsQjJHZJxtmzicAdtr4v',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAawYG1UBuHaZaPoa-nzL1rziF2Fi5Br9_c0UMRJVtQJNrYsyeu3yAjU1ACcDlsoERgXnQfRXzo4ggqxMm54xz5Uw-es_y4sBy4ZAFVgQ59mMNRNU68Cq4ihEDOsoNBbc4jP7HvEmIY6E_MteV91RmEGDdyozszXHEc7RHIkGBmw04-CgGUF3NqSAS7WXwRx7exEXORTE6GxeOLdJ5V0oyGr7TEe4JC6yW2C-kU3UFy3Ul8MF9rOnWGizcMkl3O5NDyXWuqX15UDyKQ',
];

const glassEffectStyle: CSSProperties = {
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};

type HomepageRoom = {
  id: number;
  name: string;
  location: string;
  price: string;
  imageUrl: string;
  status: 'Kosong' | 'Terisi';
};

function formatRupiah(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

function mapRoomToCard(room: ApiRoom, index: number): HomepageRoom {
  return {
    id: room.id,
    name: room.name,
    location: room.branch,
    price: formatRupiah(room.price),
    imageUrl: room.image_url || fallbackRoomImages[index % fallbackRoomImages.length],
    status: room.is_available ? 'Kosong' : 'Terisi',
  };
}

export default function Page() {
  const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadRooms() {
      try {
        setIsLoadingRooms(true);
        setRoomsError('');

        const data = await getRooms();

        if (isMounted) {
          setApiRooms(data);
        }
      } catch (error) {
        if (isMounted) {
          setRoomsError(error instanceof Error ? error.message : 'Gagal fetch data kamar');
        }
      } finally {
        if (isMounted) {
          setIsLoadingRooms(false);
        }
      }
    }

    loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const rooms = useMemo(() => apiRooms.map(mapRoomToCard), [apiRooms]);
  const branchNames = useMemo(() => Array.from(new Set(apiRooms.map((room) => room.branch))), [apiRooms]);
  const roomNames = useMemo(() => Array.from(new Set(apiRooms.map((room) => room.name))), [apiRooms]);

  return (
    <div
      style={{
        backgroundColor: '#f9f9ff',
        fontFamily: 'Inter, sans-serif',
        color: '#111c2d',
      }}
    >
      <style>{`
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
        }
        .nav-inner,
        .content-shell {
          width: 100%;
          max-width: 80rem;
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(16px, 4vw, 32px);
          padding-right: clamp(16px, 4vw, 32px);
        }
        .hero-section {
          padding: clamp(48px, 9vw, 80px) clamp(16px, 4vw, 32px) clamp(72px, 12vw, 128px);
        }
        .hero-title {
          font-size: clamp(2rem, 7vw, 4rem) !important;
        }
        .hero-copy {
          font-size: clamp(0.95rem, 2.5vw, 1.125rem) !important;
        }
        .search-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(180px, 1fr));
          gap: 8px;
          padding: 8px;
          flex: 1;
        }
        .select-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .select-wrap select {
          width: 100%;
        }
        .select-dropdown-icon {
          position: absolute;
          right: 0;
          color: #006e2f;
          font-size: 22px;
          pointer-events: none;
        }
        .section-heading-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 48px;
        }
        .room-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-bottom: 64px;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 64px;
          align-items: center;
        }
        .branch-info-section {
          padding-top: 72px;
          padding-bottom: 72px;
        }
        .branch-grid {
          display: grid;
          gap: 40px;
        }
        .branch-card {
          display: flex;
          align-items: center;
          gap: 32px;
          background-color: #ffffff;
          border-radius: 1.5rem;
          padding: 32px;
          box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
        }
        .branch-card.reverse {
          flex-direction: row-reverse;
        }
        .branch-image {
          flex: 0 0 380px;
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
          min-height: 240px;
        }
        .branch-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .branch-content h3 {
          font-family: 'Manrope, sans-serif';
          font-size: clamp(1.5rem, 3vw, 1.875rem);
          font-weight: 800;
          margin-bottom: 16px;
        }
        .branch-content p {
          font-family: 'Inter, sans-serif';
          color: #334155;
          line-height: 1.8;
        }
        .feature-title {
          font-size: clamp(1.8rem, 4vw, 2.25rem) !important;
        }
        .footer-links {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .feature-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .branch-card {
            flex-direction: column;
          }
          .branch-card.reverse {
            flex-direction: column;
          }
        }
        @media (max-width: 640px) {
          .nav-inner {
            padding-top: 12px !important;
            padding-bottom: 12px !important;
          }
          .nav-actions {
            gap: 8px !important;
          }
          .nav-actions button {
            padding: 8px 12px !important;
            font-size: 0.875rem !important;
            border-radius: 8px !important;
          }
          .hero-section {
            padding-top: 40px;
            padding-bottom: 56px;
          }
          .hero-copy {
            margin-bottom: 32px !important;
          }
          .search-panel {
            margin-top: 32px !important;
            border-radius: 12px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .search-grid {
            grid-template-columns: 1fr;
            padding: 4px;
            width: 100%;
          }
          .search-button {
            padding: 12px 20px !important;
            border-radius: 8px !important;
            width: 100%;
          }
          .section-heading-row {
            align-items: flex-start;
            margin-bottom: 24px;
          }
          .section-heading-row h2 {
            font-size: 1.5rem !important;
          }
          .view-toggle {
            display: none !important;
          }
          .room-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
            margin-bottom: 40px;
          }
          .feature-section {
            padding-top: 56px !important;
            padding-bottom: 64px !important;
          }
          .dashboard-frame {
            padding: 8px !important;
            border-radius: 12px !important;
            transform: none !important;
          }
          .trust-badge {
            right: 8px !important;
            bottom: -18px !important;
            max-width: 152px !important;
            padding: 14px !important;
            border-radius: 8px !important;
          }
          .feature-list-item {
            gap: 12px !important;
          }
          .feature-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 8px !important;
          }
          .footer-links {
            gap: 14px 20px;
          }
        }
      `}</style>

      <Navbar />

      <main style={{ minHeight: '100vh' }}>
        <section
          className="hero-section"
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
            }}
          >
            <img
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.38,
                filter: 'blur(1px)',
                transform: 'scale(1.02)',
              }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_KZVndtwi7PS--7mo_WfboFJnT6EkPPlorCXkcrjkQyzNRPK1fOJ92FPBNLOEEH8a7I80ksCJl9VoE9t3fqIZ8J8rNJkRPN7QPdLRWdpYJvu2U5xjFeF5FTok-Du00uYAOuluemTFg66cKAkam6PvS87IqLM7OpkRLGLHmePlHk1jS41iO5ey0nemSFK4c2wbibh3TkW7mQnll-n5_iFFIf1HS3JWTNQkY99fc8eNWEm_d6wt8vTbf2rTiL0PZ7hZlq3TfMGPjeUR"
              alt="Modern apartment interior"
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, rgba(249, 249, 255, 0.92), rgba(249, 249, 255, 0.45), rgba(249, 249, 255, 0.9))',
              }}
            ></div>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 10,
              maxWidth: '56rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
            }}
          >
            <h1
              className="hero-title"
              style={{
                fontSize: 'clamp(2rem, 10vw, 4rem)',
                fontWeight: 800,
                fontFamily: 'Manrope, sans-serif',
                letterSpacing: '-0.02em',
                color: '#111c2d',
                lineHeight: 1.2,
                marginBottom: '24px',
              }}
            >
              Temukan Kamar Kos <br />
              <span style={{ color: '#006e2f', fontStyle: 'italic' }}>Nyaman Untukmu</span>
            </h1>
            <p
              className="hero-copy"
              style={{
                fontSize: '1.125rem',
                color: '#3d4a3d',
                maxWidth: '42rem',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: '48px',
              }}
            >
              Kelola hunian dengan fasilitas dan sistem pembayaran digital yang mudah
              bersama KosHandayani.
            </p>

            <div
              className="search-panel"
              style={{
                marginTop: '48px',
                padding: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                gap: '8px',
                maxWidth: '80rem',
                marginLeft: 'auto',
                marginRight: 'auto',
                ...glassEffectStyle,
              }}
            >
              <div className="search-grid">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f3ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.625rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 700,
                      color: '#3d4a3d',
                      marginBottom: '4px',
                    }}
                  >
                    CABANG
                  </label>
                  <div className="select-wrap">
                    <select
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0 28px 0 0',
                        fontWeight: 600,
                        color: '#006e2f',
                        appearance: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      <option>Semua Cabang</option>
                      {branchNames.map((branchName) => (
                        <option key={branchName}>{branchName}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined select-dropdown-icon">expand_more</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f3ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.625rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 700,
                      color: '#3d4a3d',
                      marginBottom: '4px',
                    }}
                  >
                    TIPE KAMAR
                  </label>
                  <div className="select-wrap">
                    <select
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: '0 28px 0 0',
                        fontWeight: 600,
                        color: '#006e2f',
                        appearance: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                    >
                      <option>Semua Tipe</option>
                      {roomNames.map((roomName) => (
                        <option key={roomName}>{roomName}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined select-dropdown-icon">expand_more</span>
                  </div>
                </div>

              </div>

              <button
                className="search-button"
                style={{
                  background: 'linear-gradient(to right, #006e2f, #22c55e)',
                  color: '#ffffff',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  search
                </span>
                Cari Sekarang
              </button>
            </div>
          </div>
        </section>

        <section className="content-shell" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
          <div className="section-heading-row">
            <div>
              <h2
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 800,
                  fontFamily: 'Manrope, sans-serif',
                  letterSpacing: '-0.025em',
                }}
              >
                Kamar Tersedia
              </h2>
              <p style={{ color: '#3d4a3d', marginTop: '8px' }}>
                Daftar kamar kos terbaik yang siap kamu huni hari ini.
              </p>
            </div>
            <div className="view-toggle" style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  padding: '8px',
                  borderRadius: '9999px',
                  border: '1px solid #bccbb9',
                  color: '#3d4a3d',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dee8ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button
                style={{
                  padding: '8px',
                  borderRadius: '9999px',
                  border: '1px solid #bccbb9',
                  color: '#3d4a3d',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dee8ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="material-symbols-outlined">view_list</span>
              </button>
            </div>
          </div>

          {isLoadingRooms ? (
            <div style={{ marginBottom: '64px', textAlign: 'center', color: '#3d4a3d' }}>
              Memuat data kamar...
            </div>
          ) : roomsError ? (
            <div style={{ marginBottom: '64px', textAlign: 'center', color: '#b91c1c' }}>
              {roomsError}. Pastikan backend Laravel berjalan di http://127.0.0.1:8000.
            </div>
          ) : rooms.length > 0 ? (
            <div className="room-grid">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  name={room.name}
                  location={room.location}
                  price={room.price}
                  imageUrl={room.imageUrl}
                  status={room.status}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: '64px', textAlign: 'center', color: '#3d4a3d' }}>
              Belum ada kamar tersedia dari database.
            </div>
          )}

          <div style={{ marginTop: '64px', textAlign: 'center' }}>
            <button
              style={{
                paddingLeft: '32px',
                paddingRight: '32px',
                paddingTop: '12px',
                paddingBottom: '12px',
                backgroundColor: '#e7eeff',
                color: '#3d4a3d',
                fontWeight: 700,
                borderRadius: '9999px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: 'auto',
                marginRight: 'auto',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dee8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#e7eeff';
              }}
            >
              Lihat Kamar Lainnya
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        <section className="content-shell branch-info-section" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                fontFamily: 'Manrope, sans-serif',
                letterSpacing: '-0.025em',
                marginBottom: '12px',
              }}
            >
              Informasi Cabang
            </h2>
            <p style={{ color: '#3d4a3d', maxWidth: '42rem' }}>
              Lihat detail masing-masing cabang KosHandayani dengan lokasi strategis dan fasilitas nyaman.
            </p>
          </div>

          <div className="branch-grid">
            <div className="branch-card">
              <div className="branch-image">
                <img
                  src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=960&q=80"
                  alt="Cabang 1"
                />
              </div>
              <div className="branch-content">
                <h3>Cabang 1</h3>
                <p>
                  Cabang 1 terletak di pusat kota dengan akses mudah ke fasilitas umum dan transportasi.
                  Nikmati kamar modern, keamanan 24 jam, dan layanan kebersihan harian.
                </p>
              </div>
            </div>

            <div className="branch-card reverse">
              <div className="branch-image">
                <img
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=960&q=80"
                  alt="Cabang 2"
                />
              </div>
              <div className="branch-content">
                <h3>Cabang 2</h3>
                <p>
                  Cabang 2 menawarkan suasana tenang dekat area kampus dengan fasilitas lengkap untuk mahasiswa.
                  Dilengkapi ruang bersama, dapur modern, dan koneksi internet cepat.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-shell feature-section" style={{ paddingTop: '96px', paddingBottom: '96px' }}>
          <div className="feature-grid">
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '-40px',
                  width: '160px',
                  height: '160px',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '9999px',
                  filter: 'blur(96px)',
                }}
              ></div>
              <div
                className="dashboard-frame"
                style={{
                  position: 'relative',
                  zIndex: 10,
                  backgroundColor: '#dee8ff',
                  borderRadius: '1.5rem',
                  padding: '16px',
                  transform: 'rotate(2deg)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                }}
              >
                <img
                  style={{ borderRadius: '1rem', width: '100%', boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)' }}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO5AxaBDj8ujS2_ayFvy785z-4mcjqB4iZQTwlrWH1jKjadhyyubv5lukUHjNVNPXIhPHw4b7KVmvtE3zWh0NKJLpz5TrOppCBPHlJMrD1r0kdygM0ymasAy4oQFWdXXhLAdjCDLMN6-ccYjUhYOFqu0nVVo4Ut_jIvsluIklc4d3yzd52sdZx4LxCLkk4_3HJkwLEYzhkZMTwccvh6EzBil0spDAdGduFoANXMOQn_qdhYubldN92l8Y5s8FWX3X_ibWUKSzHLR5T"
                  alt="Dashboard"
                />
              </div>
              <div
                className="trust-badge"
                style={{
                  position: 'absolute',
                  bottom: '-24px',
                  right: '-24px',
                  zIndex: 20,
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  maxWidth: '200px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#006e2f', marginBottom: '8px' }}>
                  <span className="material-symbols-outlined">verified_user</span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Terpercaya</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#3d4a3d' }}>
                  Telah mengelola 500+ unit kamar kos di seluruh Indonesia.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <h2
                className="feature-title"
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  fontFamily: 'Manrope, sans-serif',
                  lineHeight: 1.2,
                }}
              >
                Pengalaman Sewa Kos Berkelas Hotel
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="feature-list-item" style={{ display: 'flex', gap: '16px' }}>
                  <div
                    className="feature-icon"
                    style={{
                      flexShrink: 0,
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#006e2f',
                    }}
                  >
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Pembayaran Digital</h4>
                    <p style={{ color: '#3d4a3d' }}>
                      Bayar tagihan bulanan langsung dari aplikasi dengan berbagai metode pembayaran
                      aman.
                    </p>
                  </div>
                </div>

                <div className="feature-list-item" style={{ display: 'flex', gap: '16px' }}>
                  <div
                    className="feature-icon"
                    style={{
                      flexShrink: 0,
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#006e2f',
                    }}
                  >
                    <span className="material-symbols-outlined">support_agent</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Digital Concierge</h4>
                    <p style={{ color: '#3d4a3d' }}>
                      Layanan bantuan tenant 24/7 untuk perbaikan fasilitas atau pertanyaan seputar
                      kos.
                    </p>
                  </div>
                </div>

                <div className="feature-list-item" style={{ display: 'flex', gap: '16px' }}>
                  <div
                    className="feature-icon"
                    style={{
                      flexShrink: 0,
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#006e2f',
                    }}
                  >
                    <span className="material-symbols-outlined">key</span>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Akses Tanpa Kunci</h4>
                    <p style={{ color: '#3d4a3d' }}>
                      Beberapa unit kami telah dilengkapi sistem Smart Lock untuk keamanan maksimal
                      Anda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        id="bantuan"
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          paddingTop: '32px',
          paddingBottom: '32px',
          marginTop: 'auto',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            paddingLeft: '32px',
            paddingRight: '32px',
            maxWidth: '80rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Image
            src="/KosHandayani_Logo.png"
            alt="Kos Handayani"
            width={132}
            height={32}
            style={{ width: '132px', height: 'auto', objectFit: 'contain' }}
          />
          <div className="footer-links">
            <a
              href="#"
              style={{
                fontSize: '0.75rem',
                color: '#a0aec0',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#475569';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a0aec0';
              }}
            >
              Tentang Kami
            </a>
            <a
              href="#"
              style={{
                fontSize: '0.75rem',
                color: '#a0aec0',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#475569';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a0aec0';
              }}
            >
              Syarat &amp; Ketentuan
            </a>
            <a
              href="#"
              style={{
                fontSize: '0.75rem',
                color: '#a0aec0',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#475569';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a0aec0';
              }}
            >
              Kebijakan Privasi
            </a>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#708090', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            &copy; 2024 KosHandayani. Digital Concierge Property Management.
          </p>
        </div>
      </footer>
    </div>
  );
}
