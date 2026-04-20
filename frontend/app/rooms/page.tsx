'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Globe,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import RoomCard from '../../components/RoomCard';
import { getRooms } from '../../lib/api';
import type { ApiRoom } from '../../lib/api';

const roomTypeFilters = [
  { label: 'Semua', value: 'semua' },
  { label: 'AC', value: 'ac' },
  { label: 'Kipas', value: 'kipas' },
];

type Amenity = { icon: string; label: string };

const fallbackRoomImages = [
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const informasiLinks = ['Tentang Kami', 'Pusat Bantuan'];
const legalitasLinks = ['Syarat & Ketentuan', 'Kebijakan Privasi'];

type ListingRoom = {
  id: number;
  image: string;
  statusAvailable: boolean;
  branch: string;
  name: string;
  amenities: Amenity[];
  roomType: 'ac' | 'kipas';
  price: string;
  priceValue: number;
  priceGreen: boolean;
  perMonth: string;
  available: boolean;
};

function formatRupiah(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

function getRoomAmenities(room: ApiRoom, index: number): { amenities: Amenity[]; roomType: 'ac' | 'kipas' } {
  const name = room.name.toLowerCase();
  const roomType = name.includes('kipas') || index % 3 === 1 ? 'kipas' : 'ac';

  if (roomType === 'kipas') {
    return {
      roomType,
      amenities: [
        { icon: 'wifi', label: 'WiFi' },
        { icon: 'mode_fan', label: 'Kipas' },
      ],
    };
  }

  return {
    roomType,
    amenities: [
      { icon: 'wifi', label: 'WiFi' },
      { icon: 'ac_unit', label: 'AC' },
      { icon: 'local_laundry_service', label: 'Laundry' },
    ],
  };
}

function mapRoomToListing(room: ApiRoom, index: number): ListingRoom {
  const { amenities, roomType } = getRoomAmenities(room, index);

  return {
    id: room.id,
    image: room.image_url || fallbackRoomImages[index % fallbackRoomImages.length],
    statusAvailable: room.is_available,
    branch: room.branch,
    name: room.name,
    amenities,
    roomType,
    price: formatRupiah(room.price),
    priceValue: room.price,
    priceGreen: room.is_available,
    perMonth: '/ bulan',
    available: room.is_available,
  };
}

function StyledSelect({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-full bg-[#f0f3ff] border-0 rounded-lg px-3 pr-8 text-[#111c2d] text-sm leading-5 font-normal cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#111c2d] pointer-events-none"
      />
    </div>
  );
}

export default function Page() {
  const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState('');
  const [activeRoomType, setActiveRoomType] = useState('semua');
  const [branch, setBranch] = useState('semua-cabang');
  const [sortBy, setSortBy] = useState('harga-termurah');
  const [activePage, setActivePage] = useState(1);
  const roomsPerPage = 6;

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

  const allRooms = useMemo(() => apiRooms.map(mapRoomToListing), [apiRooms]);
  const branchOptions = useMemo(
    () => [
      { value: 'semua-cabang', label: 'Semua Cabang' },
      ...Array.from(new Set(apiRooms.map((room) => room.branch))).map((branchName) => ({
        value: branchName,
        label: branchName,
      })),
    ],
    [apiRooms],
  );
  const filteredRooms = useMemo(() => {
    const filtered = allRooms.filter((room) => {
      const matchesBranch = branch === 'semua-cabang' || room.branch === branch;
      const matchesRoomType = activeRoomType === 'semua' || room.roomType === activeRoomType;

      return matchesBranch && matchesRoomType;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'harga-termahal') {
        return b.priceValue - a.priceValue;
      }

      if (sortBy === 'terbaru') {
        return b.id - a.id;
      }

      return a.priceValue - b.priceValue;
    });
  }, [activeRoomType, allRooms, branch, sortBy]);
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / roomsPerPage));
  const currentPage = Math.min(activePage, totalPages);
  const visibleRooms = filteredRooms.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div
      className="flex flex-col items-start w-full min-h-screen"
      style={{ backgroundColor: '#f9f9ff', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Main content wrapper ────────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 md:gap-12 px-6 md:px-8 pt-10 pb-20">
        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-col items-start gap-2 w-full">
          <h1
            className="font-extrabold text-[#111c2d] text-4xl md:text-5xl tracking-[-1.2px] leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Semua Kamar
          </h1>
          <p className="text-[#3d4a3d] text-base md:text-lg leading-7 max-w-2xl">
            Temukan kamar terbaik sesuai kebutuhanmu. Hunian nyaman dengan fasilitas
            <br className="hidden sm:block" />
            premium untuk pengalaman tinggal yang lebih baik.
          </p>
        </div>

        {/* ── Content Grid: Sidebar + Listing ──────────────────────── */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 w-full items-start">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-3 w-full flex flex-col items-start gap-8 p-6 bg-white rounded-xl shadow-[0px_1px_2px_rgba(0,0,0,0.05)] self-start">
            {/* Branch filter */}
            <div className="flex flex-col items-start gap-3 w-full">
              <span className="text-[#3d4a3d] text-sm tracking-[0.7px] leading-5">CABANG</span>
              <StyledSelect
                className="w-full h-12"
                value={branch}
                onChange={(value) => { setBranch(value); setActivePage(1); }}
                options={branchOptions}
              />
            </div>

            {/* Room type filter */}
            <div className="flex flex-col items-start gap-3 w-full">
              <span className="text-[#3d4a3d] text-sm tracking-[0.7px] leading-5">TIPE KAMAR</span>
              <div className="flex flex-wrap items-start gap-2 w-full">
                {roomTypeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => { setActiveRoomType(filter.value); setActivePage(1); }}
                    className={`px-4 py-2 rounded-full text-sm leading-5 border-0 cursor-pointer transition-colors ${
                      activeRoomType === filter.value
                        ? 'bg-green-500 text-[#004b1e] font-normal'
                        : 'bg-[#f0f3ff] text-[#3d4a3d] font-medium'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col items-start gap-3 pt-4 w-full">
              <button
                className="w-full py-3 rounded-lg text-white text-base text-center leading-6 font-normal border-0 shadow-md transition-opacity hover:opacity-90"
                style={{
                  background: 'linear-gradient(178deg, rgba(0,110,47,1) 0%, rgba(34,197,94,1) 100%)',
                }}
              >
                Terapkan Filter
              </button>
              <button
                onClick={() => { setActiveRoomType('semua'); setBranch('semua-cabang'); setSortBy('harga-termurah'); }}
                className="w-full py-2 rounded-lg text-[#006e2f] text-sm text-center leading-5 font-normal bg-transparent border-0 cursor-pointer hover:bg-green-50 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </aside>

          {/* Room Listing */}
          <div className="lg:col-span-9 flex flex-col items-start gap-8 w-full">
            {/* Sort bar */}
            <div className="flex items-center justify-between w-full flex-wrap gap-3">
              <span className="text-base leading-6">
                <span className="font-medium text-[#3d4a3d]">Menampilkan </span>
                <span className="text-[#111c2d]">{filteredRooms.length}</span>
                <span className="font-medium text-[#3d4a3d]"> Kamar Pilihan</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium text-[#3d4a3d] text-sm leading-5 whitespace-nowrap">
                  Urutkan:
                </span>
                <StyledSelect
                  className="w-36 h-9"
                  value={sortBy}
                  onChange={(value) => { setSortBy(value); setActivePage(1); }}
                  options={[
                    { value: 'harga-termurah', label: 'Harga termurah' },
                    { value: 'harga-termahal', label: 'Harga termahal' },
                    { value: 'terbaru', label: 'Terbaru' },
                  ]}
                />
              </div>
            </div>

            {/* Room cards */}
            {isLoadingRooms ? (
              <div className="w-full py-16 text-center text-[#3d4a3d] bg-white rounded-xl">
                Memuat data kamar...
              </div>
            ) : roomsError ? (
              <div className="w-full py-16 px-6 text-center text-red-700 bg-white rounded-xl">
                {roomsError}. Pastikan backend Laravel berjalan di http://127.0.0.1:8000.
              </div>
            ) : visibleRooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {visibleRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    name={room.name}
                    location={room.branch}
                    price={room.price}
                    imageUrl={room.image}
                    status={room.statusAvailable ? 'Kosong' : 'Terisi'}
                    amenities={room.amenities}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full py-16 text-center text-[#3d4a3d] bg-white rounded-xl">
                Tidak ada kamar yang cocok dengan filter saat ini.
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 w-full">
              <button
                onClick={() => setActivePage(Math.max(1, currentPage - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border-0 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base leading-6 border-0 cursor-pointer transition-colors ${
                    currentPage === page
                      ? 'bg-green-500 text-[#004b1e] font-normal shadow-md'
                      : 'bg-white font-medium text-[#3d4a3d] hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setActivePage(Math.min(totalPages, currentPage + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border-0 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer id="bantuan" className="flex flex-col items-start gap-12 px-6 md:px-8 py-12 w-full bg-slate-50 mt-auto">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12">
          {/* Brand info */}
          <div className="flex flex-col items-start gap-4">
            <p
              className="font-bold text-slate-900 text-lg leading-7"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              KosHandayani
            </p>
            <p className="text-slate-500 text-sm leading-5 max-w-sm">
              Solusi hunian modern dengan manajemen transparan dan
              <br />
              fasilitas lengkap untuk kenyamanan hidup Anda.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            {/* INFORMASI */}
            <div className="flex flex-col items-start gap-4">
              <span className="text-[#111c2d] text-sm tracking-[1.4px] leading-5">
                INFORMASI
              </span>
              <div className="flex flex-col gap-2">
                {informasiLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-slate-500 text-sm leading-5 hover:text-slate-700 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            {/* LEGALITAS */}
            <div className="flex flex-col items-start gap-4">
              <span className="text-[#111c2d] text-sm tracking-[1.4px] leading-5">
                LEGALITAS
              </span>
              <div className="flex flex-col gap-2">
                {legalitasLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-slate-500 text-sm leading-5 hover:text-slate-700 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm leading-5">
            © 2024 KosHandayani Digital Concierge. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <Globe size={14} className="text-slate-400" />
            <span className="text-slate-400 text-xs leading-4">Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
