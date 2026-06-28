# Data Dictionary KosHandayani

Dokumen ini berisi kamus data untuk seluruh tabel domain KosHandayani. Tabel framework Laravel seperti cache, jobs, sessions, password reset, dan personal access tokens tidak dimasukkan.

Jumlah tabel domain: 10

Tabel domain:

- users
- branches
- rooms
- room_facilities
- room_images
- rental_applications
- payments
- room_occupancies
- lease_reminders
- expenses

Keterangan nullable:

- Ya: kolom dapat kosong di database.
- Tidak: kolom wajib terisi di database.
- Timestamps Laravel umumnya nullable secara skema dan diisi otomatis oleh Eloquent.

## users

Deskripsi:
Menyimpan akun tenant dan owner.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key user. |
| name | varchar | Tidak | Nama lengkap user. |
| email | varchar | Tidak | Email login user, harus unik. |
| email_verified_at | timestamp | Ya | Waktu email berhasil diverifikasi. |
| password | varchar | Tidak | Password user dalam bentuk hash. |
| role | varchar | Tidak | Peran user, misalnya tenant atau owner. |
| phone | varchar | Ya | Nomor telepon atau WhatsApp user. |
| job | varchar | Ya | Pekerjaan user. |
| address | text | Ya | Alamat user. |
| profile_completed | boolean | Tidak | Penanda apakah profil user sudah lengkap. |
| profile_photo | varchar | Ya | Path foto profil user. |
| remember_token | varchar | Ya | Token remember me Laravel. |
| created_at | timestamp | Ya | Waktu user dibuat. |
| updated_at | timestamp | Ya | Waktu user terakhir diperbarui. |

## branches

Deskripsi:
Menyimpan cabang atau lokasi kos.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key cabang. |
| branch_name | varchar | Tidak | Nama cabang. |
| city | varchar | Ya | Kota cabang. |
| address | text | Ya | Alamat cabang. |
| description | text | Ya | Deskripsi cabang. |
| created_at | timestamp | Ya | Waktu cabang dibuat. |
| updated_at | timestamp | Ya | Waktu cabang terakhir diperbarui. |

## rooms

Deskripsi:
Menyimpan data kamar kos.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key kamar. |
| room_name | varchar | Tidak | Nama kamar. |
| price | integer | Tidak | Harga sewa kamar per bulan. |
| branch | varchar | Tidak | Nama cabang legacy dari skema lama. Sumber relasi utama saat ini adalah branch_id. |
| is_available | boolean | Tidak | Penanda apakah kamar tersedia. |
| description | text | Ya | Deskripsi kamar. |
| thumbnail | varchar | Ya | Path gambar utama kamar. |
| max_guest | integer | Tidak | Jumlah maksimal penghuni. |
| branch_id | bigint unsigned | Ya | Foreign key ke branches.id. Nullable untuk kompatibilitas data lama. |
| gender_type | varchar/enum | Tidak | Tipe penghuni kamar: male, female, atau mixed. |
| room_status | varchar/enum | Tidak | Status kamar: available, occupied, atau maintenance. |
| created_at | timestamp | Ya | Waktu kamar dibuat. |
| updated_at | timestamp | Ya | Waktu kamar terakhir diperbarui. |

## room_facilities

Deskripsi:
Menyimpan fasilitas per kamar.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key fasilitas kamar. |
| room_id | bigint unsigned | Tidak | Foreign key ke rooms.id. |
| facility_name | varchar | Tidak | Nama fasilitas kamar. |
| created_at | timestamp | Ya | Waktu fasilitas dibuat. |
| updated_at | timestamp | Ya | Waktu fasilitas terakhir diperbarui. |

## room_images

Deskripsi:
Menyimpan foto-foto kamar.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key gambar kamar. |
| room_id | bigint unsigned | Tidak | Foreign key ke rooms.id. |
| image_url | varchar | Tidak | Path gambar kamar. |
| is_primary | boolean | Tidak | Penanda gambar utama. |
| created_at | timestamp | Ya | Waktu gambar dibuat. |
| updated_at | timestamp | Ya | Waktu gambar terakhir diperbarui. |

## rental_applications

Deskripsi:
Menyimpan pengajuan sewa tenant.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key pengajuan sewa. |
| user_id | bigint unsigned | Tidak | Foreign key ke users.id sebagai tenant pembuat pengajuan. |
| room_id | bigint unsigned | Ya | Foreign key ke rooms.id. Nullable jika kamar dihapus dengan aturan set null. |
| move_in_date | date | Ya | Tanggal mulai masuk yang diajukan tenant. |
| duration | varchar | Ya | Durasi sewa, misalnya 1 Bulan, 3 Bulan, 6 Bulan, atau 12 Bulan. |
| ktp_file | varchar | Ya | Path file KTP tenant. |
| kk_file | varchar | Ya | Path file KK tenant. |
| status | varchar/enum | Tidak | Status pengajuan: pending, approved, rejected, atau cancelled. |
| owner_notes | text | Ya | Catatan owner saat memproses pengajuan. |
| payment_status | varchar | Tidak | Status pembayaran pengajuan, misalnya pending, unpaid, paid, atau failed. |
| approved_at | timestamp | Ya | Waktu pengajuan disetujui. |
| paid_at | timestamp | Ya | Waktu pembayaran awal berhasil. |
| created_at | timestamp | Ya | Waktu pengajuan dibuat. |
| updated_at | timestamp | Ya | Waktu pengajuan terakhir diperbarui. |

## payments

Deskripsi:
Menyimpan pembayaran sewa awal dan perpanjangan.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key pembayaran. |
| rental_application_id | bigint unsigned | Tidak | Foreign key ke rental_applications.id. |
| payment_category | varchar | Tidak | Kategori pembayaran: initial_rent atau renewal. |
| room_occupancy_id | bigint unsigned | Ya | Foreign key ke room_occupancies.id untuk pembayaran perpanjangan. |
| subtotal_amount | bigint unsigned | Tidak | Total sebelum diskon. |
| discount_amount | bigint unsigned | Tidak | Nominal diskon. |
| duration_months | smallint unsigned | Ya | Durasi pembayaran dalam bulan. |
| monthly_price | bigint unsigned | Ya | Harga sewa bulanan saat transaksi dibuat. |
| period_start | date | Ya | Awal periode yang dibayar. |
| period_end | date | Ya | Akhir periode yang dibayar. |
| order_id | varchar | Tidak | ID order pembayaran, unik untuk Midtrans. |
| transaction_id | varchar | Ya | ID transaksi dari Midtrans. |
| gross_amount | bigint unsigned | Tidak | Total pembayaran setelah diskon. |
| payment_type | varchar | Ya | Metode pembayaran dari Midtrans. |
| transaction_status | varchar | Tidak | Status transaksi, misalnya pending, settlement, capture, expire, cancel, atau deny. |
| snap_token | varchar | Ya | Token Snap Midtrans. |
| paid_at | timestamp | Ya | Waktu pembayaran berhasil. |
| settlement_time | timestamp | Ya | Waktu settlement dari Midtrans. |
| created_at | timestamp | Ya | Waktu pembayaran dibuat. |
| updated_at | timestamp | Ya | Waktu pembayaran terakhir diperbarui. |

## room_occupancies

Deskripsi:
Menyimpan data hunian kamar.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key hunian. |
| user_id | bigint unsigned | Tidak | Foreign key ke users.id sebagai tenant penghuni. |
| room_id | bigint unsigned | Tidak | Foreign key ke rooms.id sebagai kamar yang dihuni. |
| rental_application_id | bigint unsigned | Tidak | Foreign key unik ke rental_applications.id. |
| start_date | date | Tidak | Tanggal mulai hunian. |
| end_date | date | Ya | Tanggal akhir hunian. |
| status | varchar | Tidak | Status hunian, misalnya active. |
| created_at | timestamp | Ya | Waktu hunian dibuat. |
| updated_at | timestamp | Ya | Waktu hunian terakhir diperbarui. |

## lease_reminders

Deskripsi:
Menyimpan riwayat pengingat masa sewa.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key pengingat sewa. |
| room_occupancy_id | bigint unsigned | Tidak | Foreign key ke room_occupancies.id. |
| user_id | bigint unsigned | Tidak | Foreign key ke users.id sebagai penerima pengingat. |
| channel | varchar | Tidak | Media pengiriman pengingat, default email. |
| reminder_type | varchar(32) | Tidak | Jenis pengingat, misalnya H-30, H-7, H-1, H-0, atau OVERDUE. |
| sent_at | timestamp | Ya | Waktu pengingat dikirim. |
| created_at | timestamp | Ya | Waktu data pengingat dibuat. |
| updated_at | timestamp | Ya | Waktu data pengingat terakhir diperbarui. |

## expenses

Deskripsi:
Menyimpan pengeluaran operasional cabang.

| Kolom | Tipe Data | Nullable | Deskripsi |
| ----- | --------- | -------- | --------- |
| id | bigint unsigned | Tidak | Primary key pengeluaran. |
| branch_id | bigint unsigned | Tidak | Foreign key ke branches.id. |
| category | varchar | Tidak | Kategori pengeluaran. |
| description | text | Ya | Deskripsi pengeluaran. |
| amount | bigint unsigned | Tidak | Nominal pengeluaran. |
| receipt_path | varchar | Ya | Path file bukti pengeluaran. |
| expense_date | date | Tidak | Tanggal pengeluaran. |
| created_by | bigint unsigned | Tidak | Foreign key ke users.id sebagai owner pembuat data. |
| deleted_at | timestamp | Ya | Waktu soft delete. |
| created_at | timestamp | Ya | Waktu pengeluaran dibuat. |
| updated_at | timestamp | Ya | Waktu pengeluaran terakhir diperbarui. |
