'use client';   
import { useState } from 'react';

export default function KosHandayaniPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const rooms = [
    { id: 1, name: 'Kamar A-101', floor: 'Lantai 1 • King Bed', branch: 'Emerald Heights', price: 'Rp 2.500.000', status: 'Lunas / Terisi', statusType: 'occupied' },
    { id: 2, name: 'Kamar A-102', floor: 'Lantai 1 • Queen Bed', branch: 'Emerald Heights', price: 'Rp 2.200.000', status: 'Kosong', statusType: 'empty' },
    { id: 3, name: 'Kamar B-205', floor: 'Lantai 2 • Studio Luxe', branch: 'Ruby Residence', price: 'Rp 3.100.000', status: 'Lunas / Terisi', statusType: 'occupied' },
    { id: 4, name: 'Kamar C-008', floor: 'Lantai Dasar • Single Bed', branch: 'Ruby Residence', price: 'Rp 1.800.000', status: 'Maintenance', statusType: 'maintenance' },
  ];

  return (
    <div className="light">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100%;
          height: 100%;
        }

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

        body {
          background-color: var(--color-background);
          font-family: 'Inter', sans-serif;
          color: var(--color-on-background);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: #bccbb9;
          border-radius: 10px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(24px);
        }

        .gradient-primary {
          background: linear-gradient(135deg, #006e2f 0%, #22c55e 100%);
        }

        .text-headline {
          font-family: 'Manrope', sans-serif;
        }

        .text-body {
          font-family: 'Inter', sans-serif;
        }

        .text-label {
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          body {
            padding: 0;
          }
        }

        .rooms-page-shell {
          min-height: 100vh;
          background: #f9f9ff;
        }

        .rooms-main {
          width: 100%;
          min-height: 100vh;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .rooms-main-inner {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .rooms-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
        }

        .rooms-eyebrow {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(61, 74, 61, 0.66);
        }

        .rooms-title {
          font-family: 'Manrope', sans-serif;
          font-size: 44px;
          line-height: 1.05;
          font-weight: 900;
          color: #111c2d;
          letter-spacing: 0;
        }

        .rooms-subtitle {
          margin-top: 8px;
          color: #3d4a3d;
          font-size: 16px;
          line-height: 1.5;
        }

        .rooms-add-button {
          min-height: 48px;
          padding: 0 22px;
          border: 0;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 14px 28px rgba(0, 110, 47, 0.18);
          white-space: nowrap;
          cursor: pointer;
        }

        .rooms-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .rooms-stat-card {
          min-height: 148px;
          background: white;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(188, 203, 185, 0.18);
          box-shadow: 0 12px 32px rgba(17, 28, 45, 0.05);
        }

        .rooms-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .rooms-stat-icon {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
        }

        .rooms-stat-badge {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .rooms-stat-label {
          color: #3d4a3d;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .rooms-stat-value {
          font-family: 'Manrope', sans-serif;
          color: #111c2d;
          font-size: 36px;
          line-height: 1;
          font-weight: 900;
        }

        .rooms-table-card {
          background: white;
          border-radius: 16px;
          border: 1px solid rgba(188, 203, 185, 0.18);
          box-shadow: 0 12px 32px rgba(17, 28, 45, 0.05);
          overflow: hidden;
        }

        .rooms-filter {
          padding: 24px 32px;
          border-bottom: 1px solid rgba(188, 203, 185, 0.14);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .rooms-tabs {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .rooms-tab {
          border: 0;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .rooms-search {
          position: relative;
          max-width: 480px;
        }

        .rooms-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(61, 74, 61, 0.62);
        }

        .rooms-search-input {
          width: 100%;
          height: 44px;
          padding: 0 16px 0 44px;
          background: #f0f3ff;
          border: 0;
          border-radius: 12px;
          color: #111c2d;
          font-size: 14px;
          outline: none;
        }

        .rooms-table-wrap {
          overflow-x: auto;
        }

        .rooms-table {
          width: 100%;
          min-width: 940px;
          border-collapse: collapse;
          text-align: left;
        }

        .rooms-table th {
          padding: 18px 28px;
          background: rgba(240, 243, 255, 0.7);
          color: #3d4a3d;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(188, 203, 185, 0.16);
          white-space: nowrap;
        }

        .rooms-table td {
          padding: 20px 28px;
          border-bottom: 1px solid rgba(188, 203, 185, 0.12);
          vertical-align: middle;
        }

        .rooms-name-cell {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 260px;
        }

        .rooms-room-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rooms-room-name {
          color: #111c2d;
          font-size: 17px;
          font-weight: 800;
          line-height: 1.25;
        }

        .rooms-room-floor {
          color: #3d4a3d;
          font-size: 13px;
          margin-top: 4px;
        }

        .rooms-pagination {
          padding: 20px 32px;
          background: rgba(240, 243, 255, 0.25);
          border-top: 1px solid rgba(188, 203, 185, 0.14);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .rooms-footer {
          margin-top: 40px;
          padding: 28px 0;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }

        @media (max-width: 1023px) {
          .rooms-main {
            padding: 24px;
          }

          .rooms-header {
            flex-direction: column;
            align-items: stretch;
          }

          .rooms-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .rooms-main {
            padding: 18px;
          }

          .rooms-title {
            font-size: 34px;
          }

          .rooms-filter,
          .rooms-pagination {
            padding: 18px;
          }

          .rooms-pagination {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="rooms-page-shell">
        {/* Main Content */}
        <main className="rooms-main">
          {/* Background Shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#006e2f]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-[#2f6a3c]/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="rooms-main-inner">

          {/* Header Section */}
          <header className="rooms-header">
            <div>
              <nav>
                <span className="rooms-eyebrow">Manajemen Properti</span>
              </nav>
              <h2 className="rooms-title">Daftar Kamar</h2>
              <p className="rooms-subtitle">Pantau dan kelola ketersediaan unit di seluruh cabang.</p>
            </div>
            <button className="rooms-add-button gradient-primary">
              <span className="material-symbols-outlined text-xl">add</span>
              <span className="hidden sm:inline">Tambah Kamar Baru</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </header>

          {/* Stats Grid */}
          <section className="rooms-stats-grid">
            <div className="rooms-stat-card">
              <div className="rooms-stat-top">
                <span className="material-symbols-outlined rooms-stat-icon text-[#006e2f] bg-[#006e2f]/10">door_open</span>
                <span className="rooms-stat-badge text-[#006e2f] bg-[#006e2f]/10">+4 Bulan Ini</span>
              </div>
              <p className="rooms-stat-label">Total Unit</p>
              <h3 className="rooms-stat-value">128</h3>
            </div>
            <div className="rooms-stat-card">
              <div className="rooms-stat-top">
                <span className="material-symbols-outlined rooms-stat-icon text-[#2f6a3c] bg-[#2f6a3c]/10">check_circle</span>
                <span className="rooms-stat-badge text-[#2f6a3c] bg-[#2f6a3c]/10">92% Okupansi</span>
              </div>
              <p className="rooms-stat-label">Terisi</p>
              <h3 className="rooms-stat-value">114</h3>
            </div>
            <div className="rooms-stat-card">
              <div className="rooms-stat-top">
                <span className="material-symbols-outlined rooms-stat-icon text-[#9e4036] bg-[#9e4036]/10">error</span>
                <span className="rooms-stat-badge text-[#9e4036] bg-[#9e4036]/10">Tersedia</span>
              </div>
              <p className="rooms-stat-label">Kosong</p>
              <h3 className="rooms-stat-value">14</h3>
            </div>
          </section>

          {/* Table Section */}
          <div className="rooms-table-card">
            {/* Filter Bar */}
            <div className="rooms-filter">
              <div className="rooms-tabs">
                <button
                  onClick={() => setSelectedBranch('all')}
                  className={`rooms-tab ${selectedBranch === 'all' ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#dee8ff]'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedBranch('emerald')}
                  className={`rooms-tab ${selectedBranch === 'emerald' ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#dee8ff]'}`}
                >
                  Cabang 1 (Emerald Heights)
                </button>
                <button
                  onClick={() => setSelectedBranch('ruby')}
                  className={`rooms-tab ${selectedBranch === 'ruby' ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#dee8ff]'}`}
                >
                  Cabang 2 (Ruby Residence)
                </button>
              </div>
              <div className="rooms-search">
                <span className="material-symbols-outlined rooms-search-icon">search</span>
                <input
                  type="text"
                  placeholder="Cari nomor kamar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rooms-search-input"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rooms-table-wrap">
              <table className="rooms-table">
                <thead>
                  <tr>
                    <th>Nama Kamar</th>
                    <th>Cabang</th>
                    <th>Harga Bulanan</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-[#f0f3ff]/30 transition-colors group">
                      <td>
                        <div className="rooms-name-cell">
                          <div className="rooms-room-icon">
                            <span className="material-symbols-outlined text-[#3d4a3d]/40 text-lg">meeting_room</span>
                          </div>
                          <div className="min-w-0">
                            <p className="rooms-room-name">{room.name}</p>
                            <p className="rooms-room-floor">{room.floor}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-medium text-[#111c2d]">{room.branch}</span>
                      </td>
                      <td>
                        <span className="text-sm font-bold text-[#006e2f]">{room.price}</span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          room.statusType === 'occupied' ? 'bg-[#afefb4] text-[#346e40]' :
                          room.statusType === 'empty' ? 'bg-[#ff8b7c] text-[#76231b]' :
                          'bg-[#e7eeff] text-[#3d4a3d]/60'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{
                            backgroundColor: room.statusType === 'occupied' ? '#2f6a3c' :
                              room.statusType === 'empty' ? '#9e4036' :
                              '#6d7b6c'
                          }}></span>
                          {room.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-[#006e2f] hover:bg-[#006e2f]/10 rounded-lg transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button className="p-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-lg transition-colors" title="Hapus">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="rooms-pagination">
              <p className="text-xs text-[#3d4a3d] font-medium">Menampilkan 1-10 dari 128 Kamar</p>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-[#dee8ff] transition-colors disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#006e2f] text-white text-xs font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#dee8ff] text-xs font-bold text-[#3d4a3d] transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#dee8ff] text-xs font-bold text-[#3d4a3d] transition-colors">3</button>
                <button className="p-2 rounded-lg hover:bg-[#dee8ff] transition-colors">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="rooms-footer">
            <p className="text-xs text-slate-500">© 2024 KosHandayani. Digital Concierge Property Management.</p>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              <a href="#" className="text-slate-400 hover:text-[#006e2f] transition-colors text-xs">Tentang Kami</a>
              <a href="#" className="text-slate-400 hover:text-[#006e2f] transition-colors text-xs">Syarat &amp; Ketentuan</a>
              <a href="#" className="text-slate-400 hover:text-[#006e2f] transition-colors text-xs">Kebijakan Privasi</a>
            </div>
          </footer>
          </div>
        </main>

        {/* Mobile FAB */}
        <button className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 gradient-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>
    </div>
  );
}
