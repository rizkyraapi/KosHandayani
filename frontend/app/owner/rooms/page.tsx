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
      `}</style>

      <div className="flex min-h-screen bg-[#f9f9ff]">
        {/* Sidebar */}
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-slate-50 flex-col p-4 gap-2 z-40 border-r border-slate-200">
          <div className="mb-8 px-2">
            <h1 className="text-xl font-black text-slate-900">KosHandayani</h1>
            <p className="text-xs text-slate-500">Owner Dashboard</p>
          </div>
          <nav className="flex-1 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-all rounded-lg group">
              <span className="material-symbols-outlined text-xl">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-xl font-semibold transition-all">
              <span className="material-symbols-outlined text-xl">bed</span>
              <span className="text-sm">Data Kamar</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-all rounded-lg">
              <span className="material-symbols-outlined text-xl">group</span>
              <span className="text-sm font-medium">Data Penyewa</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-all rounded-lg">
              <span className="material-symbols-outlined text-xl">payments</span>
              <span className="text-sm font-medium">Tagihan</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-all rounded-lg">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
              <span className="text-sm font-medium">Pengeluaran</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:translate-x-1 transition-all rounded-lg">
              <span className="material-symbols-outlined text-xl">analytics</span>
              <span className="text-sm font-medium">Laporan</span>
            </a>
          </nav>
          <div className="mt-auto border-t border-slate-200 pt-4 px-2">
            <button className="w-full flex items-center justify-between bg-green-100/50 text-green-700 px-4 py-2 rounded-lg text-xs font-bold mb-4 hover:bg-green-100 transition-colors">
              Semua Cabang
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors rounded-lg">
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full md:ml-64 min-h-screen p-4 md:p-8 lg:p-12 relative overflow-hidden">
          {/* Background Shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#006e2f]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-[#2f6a3c]/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-10 relative z-10">
            <div className="w-full md:w-auto">
              <nav className="mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#3d4a3d]/60">Manajemen Properti</span>
              </nav>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-headline text-[#111c2d]">Daftar Kamar</h2>
              <p className="text-[#3d4a3d] mt-1 text-sm md:text-base">Pantau dan kelola ketersediaan unit di seluruh cabang.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-bold shadow-lg shadow-[#006e2f]/20 hover:shadow-[#006e2f]/40 transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
              <span className="material-symbols-outlined text-xl">add</span>
              <span className="hidden sm:inline">Tambah Kamar Baru</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </header>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="bg-white p-6 rounded-xl border border-[#bccbb9]/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-2xl text-[#006e2f] p-2 bg-[#006e2f]/10 rounded-lg">door_open</span>
                <span className="text-xs font-bold text-[#006e2f] bg-[#006e2f]/10 px-2 py-1 rounded-full">+4 Bulan Ini</span>
              </div>
              <p className="text-[#3d4a3d] text-sm font-medium mb-1">Total Unit</p>
              <h3 className="text-3xl font-black text-headline text-[#111c2d]">128</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#bccbb9]/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-2xl text-[#2f6a3c] p-2 bg-[#2f6a3c]/10 rounded-lg">check_circle</span>
                <span className="text-xs font-bold text-[#2f6a3c] bg-[#2f6a3c]/10 px-2 py-1 rounded-full">92% Okupansi</span>
              </div>
              <p className="text-[#3d4a3d] text-sm font-medium mb-1">Terisi</p>
              <h3 className="text-3xl font-black text-headline text-[#111c2d]">114</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#bccbb9]/15 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-2xl text-[#9e4036] p-2 bg-[#9e4036]/10 rounded-lg">error</span>
                <span className="text-xs font-bold text-[#9e4036] bg-[#9e4036]/10 px-2 py-1 rounded-full">Tersedia</span>
              </div>
              <p className="text-[#3d4a3d] text-sm font-medium mb-1">Kosong</p>
              <h3 className="text-3xl font-black text-headline text-[#111c2d]">14</h3>
            </div>
          </section>

          {/* Table Section */}
          <div className="bg-white rounded-xl border border-[#bccbb9]/15 shadow-sm overflow-hidden">
            {/* Filter Bar */}
            <div className="px-4 md:px-8 py-4 md:py-6 border-b border-[#bccbb9]/10 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedBranch('all')}
                  className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedBranch === 'all' ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#dee8ff]'}`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setSelectedBranch('emerald')}
                  className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedBranch === 'emerald' ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#dee8ff]'}`}
                >
                  Cabang 1 (Emerald Heights)
                </button>
                <button
                  onClick={() => setSelectedBranch('ruby')}
                  className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${selectedBranch === 'ruby' ? 'bg-[#006e2f] text-white' : 'bg-[#f0f3ff] text-[#3d4a3d] hover:bg-[#dee8ff]'}`}
                >
                  Cabang 2 (Ruby Residence)
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4a3d]/60 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Cari nomor kamar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#f0f3ff] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#006e2f]/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#f0f3ff]/50 border-b border-[#bccbb9]/10">
                    <th className="px-4 md:px-8 py-4 text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">Nama Kamar</th>
                    <th className="px-4 md:px-8 py-4 text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">Cabang</th>
                    <th className="px-4 md:px-8 py-4 text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">Harga Bulanan</th>
                    <th className="px-4 md:px-8 py-4 text-xs font-bold text-[#3d4a3d] uppercase tracking-wider">Status</th>
                    <th className="px-4 md:px-8 py-4 text-xs font-bold text-[#3d4a3d] uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bccbb9]/10">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-[#f0f3ff]/30 transition-colors group">
                      <td className="px-4 md:px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#3d4a3d]/40 text-lg">meeting_room</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#111c2d] truncate">{room.name}</p>
                            <p className="text-xs text-[#3d4a3d] truncate">{room.floor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-5">
                        <span className="text-sm font-medium text-[#111c2d]">{room.branch}</span>
                      </td>
                      <td className="px-4 md:px-8 py-5">
                        <span className="text-sm font-bold text-[#006e2f]">{room.price}</span>
                      </td>
                      <td className="px-4 md:px-8 py-5">
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
                      <td className="px-4 md:px-8 py-5 text-right">
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
            <div className="px-4 md:px-8 py-6 bg-[#f0f3ff]/20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#bccbb9]/10">
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
          <footer className="mt-12 py-8 border-t border-slate-200 flex flex-col items-center gap-4 text-center">
            <p className="text-xs text-slate-500">© 2024 KosHandayani. Digital Concierge Property Management.</p>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              <a href="#" className="text-slate-400 hover:text-[#006e2f] transition-colors text-xs">Tentang Kami</a>
              <a href="#" className="text-slate-400 hover:text-[#006e2f] transition-colors text-xs">Syarat &amp; Ketentuan</a>
              <a href="#" className="text-slate-400 hover:text-[#006e2f] transition-colors text-xs">Kebijakan Privasi</a>
            </div>
          </footer>
        </main>

        {/* Mobile FAB */}
        <button className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 gradient-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>
    </div>
  );
}
