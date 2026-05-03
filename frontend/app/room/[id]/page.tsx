'use client';

import { useEffect } from 'react';
import Image from 'next/image';
export default function Page() {
      useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }

      ::-webkit-scrollbar {
        width: 6px;
      }

      ::-webkit-scrollbar-track {
        background: #f0f3ff;
      }

      ::-webkit-scrollbar-thumb {
        background: #bccbb9;
        border-radius: 10px;
      }

      .glass-effect {
        backdrop-filter: blur(24px);
        background-color: rgba(255, 255, 255, 0.8);
      }

      .primary-gradient {
        background: linear-gradient(135deg, #006e2f 0%, #22c55e 100%);
      }
    `;
    document.head.appendChild(style);
  }, []);
  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md font-headline tracking-tight text-slate-900 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center">
            <Image
              src="/KosHandayani_Logo.png"
              alt="KosHandayani Logo"
              width={180}
              height={56}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a className="text-green-700 font-bold border-b-2 border-green-600 transition-colors" href="#">Beranda</a>
            <a className="text-slate-600 font-medium hover:text-green-500 transition-colors" href="#">Bantuan</a>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button className="px-3 sm:px-5 py-2 text-slate-600 font-medium hover:text-green-600 transition-colors text-sm sm:text-base">Login</button>
            <button className="px-4 sm:px-6 py-2 primary-gradient text-white rounded-lg font-bold shadow-md hover:scale-95 duration-200 text-sm sm:text-base">Daftar</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Image Gallery Bento Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-2 sm:gap-4 h-75 sm:h-100 md:h-137.5 mb-8 sm:mb-10 overflow-hidden rounded-xl">
          <div className="col-span-2 row-span-2 relative group overflow-hidden cursor-pointer">
            <img
              alt="Suite Room Interior"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhw2GbdcdAxyaA6YuzRDpRzIdp93vsGUai7Z0Au0xsM5Z8NMkY8wMc_ixi0b0hc_0xEVkCQPJezw7lbJuWtuR-0k396c4hl6BO86luEgg_Ewo1Q5EtvorJfsfa_Kyb-zP0IICLOFfvSl2Vq0LSVYE8jjzHUDmS5nCsMgDd6ctMWiggXjQKLAxLOID7iPtGfLaDTqks6ObCVrBkMDY5iAbXkGH5Jh_57N0dwHqUPveuRoAGOkfeJZk4tWZeJxR08qka5n6VWXmdY8-Z"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          </div>
          <div className="col-span-1 row-span-1 relative group overflow-hidden cursor-pointer">
            <img
              alt="Modern Bathroom"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAio1yc-cV224k0TBpgewVm2uxUYQcncVSLxIahdhS5YjDSwt8ZMhIEQbqWcByUgERefHsdpUtU3RfP1PFCJF_zuZ5uKspwRpVvhGhh0KRGeYgIm0dJjcBSFNWeszhrjadfp0ghAmHzqYqpu_XuUX9cHuLm4vQmTbxm-HoHA1zvUzipUMIPGC_kNXlvdG3GvzzAd9nCPIC06Mm5fDx-P79fY3SmomLxBDYuJQ19UPaYwd047wkCWnri8f12dPwwFHN5XOD4fRJMQ6Yh"
            />
          </div>
          <div className="col-span-1 row-span-1 relative group overflow-hidden cursor-pointer">
            <img
              alt="Study Desk Area"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoHGsfpyoLtzIBgcYYARkXF_U88Jp6x5CXC-2zWtkCbVMSkefVYdp_9y12tIzQ5H1pxovqRNixv2CTUcdtzYwtXZVmMJW-gnEVnDl8FU8M11BPMCBnqsnyt83OPJ_2xdVyRzkrB92W3Q9wR3eWyVKCdyK0Zqp4xvva0SP5xmvVLl9PcFOfQU56sB7SOzFiHwUavoMjOqAlJLKqeRs76LwNu441Zd_50r93D2iSy85KhMUAc4ClzW9_Dq3MioT47cqoKoM2KKm4zFvf"
            />
          </div>
          <div className="col-span-2 row-span-1 relative group overflow-hidden cursor-pointer">
            <img
              alt="Balcony View"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0DbXdPqOxDviTu1TVHBp11qSE0NZOFR_flDGKq_aBrCMJnW48pmgEA-dSf1bpbd8ze_tpO7igZsXeqHxlvrSc_heP621llQDi9sovbDiirOKA1NKqndv0ukjVYQvcTWdaDijtfgDFSJpF98csBT8lcDIS5a1qhLufZXxhb5BjTEfFVnnqZUBGhfha83ZEl3L3TN8tcNrzblo_De1vIZXC2Ze56JYEheWIZq_gBezHWY4n3PWcFskWKOs1WbREaxtpZCvJcQjmesjd"
            />
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/90 backdrop-blur px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2 text-on-surface shadow-lg">
              <span className="material-symbols-outlined text-xs sm:text-sm">photo_library</span>
              <span className="hidden sm:inline">Lihat Semua Foto</span>
              <span className="sm:hidden">Semua Foto</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Content */}
          <div className="lg:col-span-8 space-y-8 sm:space-y-10">
            <header>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-primary-container/20 text-on-primary-container text-xs font-bold rounded-full uppercase tracking-wider">Tersedia</span>
                <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full uppercase tracking-wider">Wanita/Pria</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Suite Room B-12 Platinum</h1>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <span className="font-medium">Cabang Kebon Jeruk, Jakarta Barat</span>
              </div>
            </header>

            <div className="p-6 sm:p-8 bg-surface-container-lowest rounded-xl shadow-sm border-l-4 border-primary">
              <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Deskripsi Kamar
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                Nikmati pengalaman tinggal premium di Suite Room B-12 Platinum. Kamar ini dirancang untuk profesional muda yang menginginkan kenyamanan hotel berbintang dengan fleksibilitas tempat tinggal. Dilengkapi dengan furnitur berkualitas tinggi dan pencahayaan yang dipikirkan matang untuk produktivitas sekaligus relaksasi.
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Terletak di lantai dua dengan akses balkon pribadi yang menghadap ke taman dalam. Luas kamar 24m² memberikan ruang gerak yang sangat leluasa.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-headline font-bold mb-6">Fasilitas Kamar &amp; Gedung</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { icon: 'wifi', label: 'Wi-fi 50Mbps' },
                  { icon: 'ac_unit', label: 'AC 1 PK' },
                  { icon: 'hot_tub', label: 'Water Heater' },
                  { icon: 'king_bed', label: 'Springbed Queen' },
                  { icon: 'desk', label: 'Meja Kerja' },
                  { icon: 'kitchen', label: 'Kulkas Mini' },
                  { icon: 'security', label: 'CCTV 24 Jam' },
                  { icon: 'local_parking', label: 'Parkir Luas' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center p-4 bg-surface-container-low rounded-xl group hover:bg-white hover:shadow-md transition-all">
                    <span className="material-symbols-outlined text-primary text-3xl mb-2">{icon}</span>
                    <span className="text-sm font-medium text-on-surface-variant text-center">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-headline font-bold">Lokasi Strategis</h2>
                <a className="text-primary font-bold text-sm hover:underline" href="#">Lihat di Google Maps</a>
              </div>
              <div className="relative h-70 sm:h-87.5 rounded-xl overflow-hidden shadow-sm group">
                <img
                  alt="Location Map"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFy0syikBgXEaZf5x9qpGJDB4QcIQVF7o-rGzn0cwJH-Q0pv7d1gV3wA0OPWKEpjzgkvGVHhQ3LMDdW_zY1KwgbCiuq9OXaP2K9VhclpibtJFD-b15q-YRXZonePSR1X0Chz_Yw3unVnx4tokjwhpNRmcFBHn0MOY95da7ugPCIthtFELriv8AwDql1SRX38Eb3_6gOk7vtqxEzSr4wJVkVxAcM4SN9rZgOLFsxeBEj6UH1lDNJWDpAz-gGT3rkDB4SpUeSEcVTLrg"
                />
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-white p-2 rounded-full shadow-2xl animate-bounce">
                    <span className="material-symbols-outlined text-primary text-4xl">location_on</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary">directions_walk</span>
                  <div>
                    <h4 className="font-bold text-sm">3 Menit ke Halte TransJakarta</h4>
                    <p className="text-xs text-on-surface-variant">Akses mudah ke pusat kota</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-surface-container rounded-xl">
                  <span className="material-symbols-outlined text-primary">shopping_cart</span>
                  <div>
                    <h4 className="font-bold text-sm">5 Menit ke Mall Ciputra</h4>
                    <p className="text-xs text-on-surface-variant">Pusat belanja dan hiburan</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Pricing Card */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden border-t-8 border-primary">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-on-surface-variant font-medium">Mulai dari</span>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-headline font-extrabold text-primary">Rp 3.250.000</div>
                    <div className="text-xs font-medium text-on-surface-variant">per bulan</div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-xl">event_available</span>
                      <span className="text-sm font-semibold">Ready to move in</span>
                    </div>
                    <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-xl">verified_user</span>
                      <span className="text-sm font-semibold">Pemilik Terverifikasi</span>
                    </div>
                    <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full primary-gradient text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">flash_on</span>
                    Ajukan Sewa
                  </button>
                  <button className="w-full bg-white border-2 border-primary text-primary py-4 rounded-xl font-bold text-lg hover:bg-primary-container/10 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">chat</span>
                    Tanya Pemilik
                  </button>
                </div>
              </div>
              <div className="bg-surface-container p-6 text-center">
                <p className="text-xs text-on-surface-variant mb-1">Butuh bantuan reservasi?</p>
                <a className="text-sm font-bold text-primary flex items-center justify-center gap-1" href="tel:08123456789">
                  <span className="material-symbols-outlined text-sm">call</span>
                  Hubungi CS KosHandayani
                </a>
              </div>
            </div>

            {/* Owner Card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 shrink-0">
                <img
                  alt="Owner Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA97xPpdGtwi3XO9frjjWk-wEnDNUST1EH-1yaPovM7y2xH77br6gz-qHPSMAj0rFPyt0vJBWemmMAlrtp_OlScasahtwosVsbY8yw9CrU50LtxbdYpLL64VJ2Lk5GbjwI00hv5sPG7WgwImv_-fcc2awtdRRDCVvucfsdbIvE_Tl6OAtftfIzT5MhSxIOhcx5ZuQ-9cbYj1OSIgbtFqTXs6_EPvMSERlZSUhbj8fNIHztvr9skkWC4hlR00JjfYhgm6JNIr_Ow5_mO"
                />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Bp. Handayani</h4>
                <p className="text-xs text-on-surface-variant mb-1">Pemilik Properti</p>
                <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">
                  <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>verified</span>
                  Super Host
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Rooms */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-headline font-extrabold mb-6 sm:mb-8">Kamar Lain di Cabang Ini</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Room Card 1 */}
            <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img
                  alt="Superior Room"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQI4kt5WBVPk8pz63A41YfZsoG9jNTstZryBwAojlKlyahtvecVETRgIxfQlFHNM6uVPNlFREzAk0TyoCYY9VbUJjEeqTM9pD569xLi2cdN7ibbqYYDyer4osa63ZtIfBCcNQZFgCejjRKvwKk8LroDGjIE6665MXMU2F7LcSyGC9X7W7d2rShvbNFUZ2Y80SkyqzIg_vaNYDjVG8KfWyLGashqTTwe9luwNW-z4ZIGnl2KOt0b-LA5HPdvzXBLLVC4M40Y6nOpbkZ"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-on-surface">Superior</div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Superior Room B-05</h3>
                <p className="text-xs text-on-surface-variant mb-4">Lantai 1 • Kamar Mandi Dalam</p>
                <div className="flex justify-between items-end">
                  <div className="text-primary font-bold">Rp 2.800.000<span className="text-[10px] text-on-surface-variant font-normal">/bln</span></div>
                  <button className="p-2 bg-surface-container-high rounded-full hover:bg-primary-container/20 hover:text-primary transition-all">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Room Card 2 */}
            <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img
                  alt="Deluxe Room"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbi7vtUoHGFHhZbWCn6T7EFsnbxeDvzZl6BJ8aP04Phyock_5otcB0-tlaLjVQVkJJsOEuBvv9rcerbp5rsiJHLWpqsnZj6LOzeUFzYxti08-80-vxgLB6i8DPGyVPWJvwILsvR6luBk98AKp855yNTKMHmiiF5OnSLU7gVxXwXtWzsphv2pPb7P7L_OE4lzy3jsdNjIdpEXs8jnj5f5WqXCLBYE-qGmblSM6jM4DeqpCXHkRkyTx6MMhBdoV2bLkXXK6Kp8vSrnoy"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-on-surface">Deluxe</div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Deluxe Loft A-02</h3>
                <p className="text-xs text-on-surface-variant mb-4">Lantai 3 • Mezzanine Area</p>
                <div className="flex justify-between items-end">
                  <div className="text-primary font-bold">Rp 3.500.000<span className="text-[10px] text-on-surface-variant font-normal">/bln</span></div>
                  <button className="p-2 bg-surface-container-high rounded-full hover:bg-primary-container/20 hover:text-primary transition-all">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Room Card 3 */}
            <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img
                  alt="Standard Room"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmh5IcEs6NCbNgyRellYfbkzGL_ZIQM527h6jCIUscxsNOz53ZthjPRTHskcS_0lol5ezNsfBhswPOd6DOLCQCjC00hRndIt_gDNFj_0-7juoHBY-lm8pJpWlFDrex_4T_M0uZtqgMQxzG63jeHEjIvR3sVUHJJ3o8YH0lqrIzqc8r0IlerKbfA2h6KkVIAN8bsK3wKBGcwdY33IkZlmvKyC1K7mJLA3-Qs0LDH_ESMSaFWcXlJb1VgzY3ookxpE2hHmQMgsramY8k"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-on-surface">Standard</div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Standard Room C-08</h3>
                <p className="text-xs text-on-surface-variant mb-4">Lantai 1 • Dekat Pintu Masuk</p>
                <div className="flex justify-between items-end">
                  <div className="text-primary font-bold">Rp 2.200.000<span className="text-[10px] text-on-surface-variant font-normal">/bln</span></div>
                  <button className="p-2 bg-surface-container-high rounded-full hover:bg-primary-container/20 hover:text-primary transition-all">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-white border-t border-slate-100 font-body text-xs text-slate-500">
        <div className="flex flex-col items-center gap-4 px-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-2">
            <a className="text-slate-400 hover:text-slate-600 transition-colors duration-200" href="#">Tentang Kami</a>
            <a className="text-slate-400 hover:text-slate-600 transition-colors duration-200" href="#">Syarat &amp; Ketentuan</a>
            <a className="text-slate-400 hover:text-slate-600 transition-colors duration-200" href="#">Kebijakan Privasi</a>
          </div>
          <p className="text-center">© 2024 KosHandayani. Digital Concierge Property Management.</p>
        </div>
      </footer>
    </div>
  );
}
