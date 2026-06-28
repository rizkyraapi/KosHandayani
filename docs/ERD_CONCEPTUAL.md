# ERD Conceptual KosHandayani

Dokumen ini adalah versi konseptual untuk ERD Chen. Bahasa yang digunakan adalah bahasa bisnis/non-teknis dan tidak menampilkan nama kolom database.

## Tujuan

Dokumen ini membantu menggambar ERD Chen dengan bentuk:

- Persegi panjang untuk entitas.
- Belah ketupat untuk relasi.
- Oval untuk atribut bisnis.
- Garis kardinalitas untuk hubungan antar entitas.

## Entitas Konseptual

## User

Makna bisnis:
Orang yang menggunakan sistem KosHandayani.

Atribut bisnis:

- Nama
- Email
- Nomor telepon
- Role
- Pekerjaan
- Alamat
- Status verifikasi email
- Status kelengkapan profil
- Foto profil

Peran:

- Tenant mengajukan sewa dan membayar.
- Owner mengelola kos dan laporan.

## Cabang

Makna bisnis:
Lokasi atau cabang kos.

Atribut bisnis:

- Nama cabang
- Kota
- Alamat
- Deskripsi cabang

Peran:

- Mengelompokkan kamar dan pengeluaran.

## Kamar

Makna bisnis:
Unit kamar yang disewakan kepada tenant.

Atribut bisnis:

- Nama kamar
- Harga sewa
- Tipe penghuni
- Deskripsi kamar
- Kapasitas
- Status kamar
- Ketersediaan
- Foto utama

Peran:

- Menjadi objek utama yang dipilih tenant.

## Fasilitas Kamar

Makna bisnis:
Daftar fasilitas yang tersedia pada kamar.

Atribut bisnis:

- Nama fasilitas

Peran:

- Menjelaskan nilai tambah kamar.

## Gambar Kamar

Makna bisnis:
Dokumentasi foto kamar.

Atribut bisnis:

- Foto kamar
- Status foto utama

Peran:

- Membantu tenant melihat kondisi kamar.

## Pengajuan Sewa

Makna bisnis:
Permintaan tenant untuk menyewa kamar.

Atribut bisnis:

- Tanggal mulai sewa
- Durasi sewa
- Dokumen identitas
- Dokumen keluarga
- Status pengajuan
- Catatan owner
- Status pembayaran
- Waktu persetujuan
- Waktu pembayaran

Peran:

- Menjadi proses formal sebelum tenant dapat menempati kamar.

## Pembayaran

Makna bisnis:
Transaksi pembayaran sewa oleh tenant.

Atribut bisnis:

- Kategori pembayaran
- Nominal sewa
- Diskon
- Total pembayaran
- Durasi pembayaran
- Periode pembayaran
- Metode pembayaran
- Status transaksi
- Waktu pembayaran

Peran:

- Membuktikan pembayaran sewa awal atau perpanjangan.

## Hunian Kamar

Makna bisnis:
Catatan bahwa tenant menempati kamar.

Atribut bisnis:

- Tanggal mulai hunian
- Tanggal akhir hunian
- Status hunian

Peran:

- Menjadi bukti periode tinggal tenant.
- Menjadi dasar pengingat dan perpanjangan.

## Pengingat Sewa

Makna bisnis:
Notifikasi kepada tenant tentang masa akhir sewa.

Atribut bisnis:

- Media pengiriman
- Jenis pengingat
- Waktu pengiriman

Peran:

- Mengingatkan tenant agar memperpanjang atau mengakhiri sewa tepat waktu.

## Pengeluaran

Makna bisnis:
Biaya operasional cabang kos.

Atribut bisnis:

- Kategori pengeluaran
- Deskripsi
- Nominal
- Bukti pengeluaran
- Tanggal pengeluaran

Peran:

- Mendukung laporan keuangan owner.

## Relasi Konseptual dan Kardinalitas

| Entitas A | Nama Relasi Chen | Entitas B | Kardinalitas | Makna Bisnis |
| --------- | ---------------- | --------- | ------------ | ------------ |
| User | membuat | Pengajuan Sewa | 1:N | Satu tenant dapat membuat banyak pengajuan sewa. |
| User | menempati | Hunian Kamar | 1:N | Satu tenant dapat memiliki banyak riwayat hunian. |
| User | menerima | Pengingat Sewa | 1:N | Satu tenant dapat menerima banyak pengingat. |
| User | mencatat | Pengeluaran | 1:N | Satu owner dapat mencatat banyak pengeluaran. |
| Cabang | memiliki | Kamar | 1:N | Satu cabang memiliki banyak kamar. |
| Cabang | memiliki | Pengeluaran | 1:N | Satu cabang memiliki banyak catatan pengeluaran. |
| Kamar | dilengkapi oleh | Fasilitas Kamar | 1:N | Satu kamar dapat memiliki banyak fasilitas. |
| Kamar | didokumentasikan oleh | Gambar Kamar | 1:N | Satu kamar dapat memiliki banyak gambar. |
| Kamar | dipilih dalam | Pengajuan Sewa | 1:N | Satu kamar dapat diajukan berkali-kali sepanjang waktu. |
| Kamar | ditempati dalam | Hunian Kamar | 1:N | Satu kamar dapat memiliki banyak riwayat hunian. |
| Pengajuan Sewa | dibayar melalui | Pembayaran | 1:N | Satu pengajuan dapat memiliki pembayaran awal dan pembayaran lanjutan. |
| Pengajuan Sewa | menghasilkan | Hunian Kamar | 1:0..1 | Pengajuan yang belum dibayar belum menghasilkan hunian. |
| Hunian Kamar | diperpanjang melalui | Pembayaran | 1:N | Satu hunian dapat diperpanjang beberapa kali. |
| Hunian Kamar | diingatkan melalui | Pengingat Sewa | 1:N | Satu hunian dapat memiliki beberapa pengingat masa sewa. |

## Panduan Chen Diagram

Entitas yang sebaiknya digambar di tengah:

- Pengajuan Sewa
- Pembayaran
- Hunian Kamar

Entitas aktor:

- User

Entitas objek:

- Cabang
- Kamar

Entitas detail:

- Fasilitas Kamar
- Gambar Kamar

Entitas operasional:

- Pengingat Sewa
- Pengeluaran

Relasi utama yang sebaiknya diberi belah ketupat:

- User membuat Pengajuan Sewa
- Pengajuan Sewa memilih Kamar
- Owner menyetujui Pengajuan Sewa
- Pengajuan Sewa dibayar melalui Pembayaran
- Pembayaran menghasilkan Hunian Kamar
- Hunian Kamar menerima Pengingat Sewa
- Hunian Kamar diperpanjang melalui Pembayaran
- Owner mencatat Pengeluaran

## Narasi Konseptual

KosHandayani memiliki user yang terdiri dari tenant dan owner. Tenant memilih kamar pada cabang tertentu, lalu membuat pengajuan sewa. Owner memproses pengajuan tersebut. Jika pengajuan disetujui, tenant melakukan pembayaran. Pembayaran yang berhasil menghasilkan hunian kamar. Selama masa hunian berjalan, sistem dapat mengirim pengingat sewa. Jika tenant ingin tetap tinggal, tenant melakukan pembayaran perpanjangan, lalu masa hunian diperpanjang. Owner juga mencatat pengeluaran operasional cabang untuk kebutuhan laporan.
