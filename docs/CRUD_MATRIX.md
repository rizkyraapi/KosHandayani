# CRUD Matrix KosHandayani

Dokumen ini menjelaskan hak akses Create, Read, Update, Delete untuk role Tenant dan Owner terhadap entitas domain bisnis.

Keterangan:

- C: Create
- R: Read
- U: Update
- D: Delete
- Ya: role memiliki akses melalui fitur aplikasi.
- Terbatas: role hanya dapat melakukan aksi pada data miliknya sendiri atau melalui proses tertentu.
- Tidak: role tidak memiliki akses langsung.

## Ringkasan Role

Tenant:

- Membuat akun dan melengkapi profil.
- Melihat kamar dan cabang.
- Membuat pengajuan sewa.
- Membayar sewa awal dan perpanjangan.
- Melihat riwayat pembayaran dan pengajuan miliknya.

Owner:

- Mengelola kamar.
- Melihat dan memproses pengajuan sewa.
- Melihat pembayaran, tenant, dashboard, dan laporan.
- Mengelola pengeluaran.

## CRUD Matrix Tenant

| Entitas | Create | Read | Update | Delete | Catatan |
| ------- | ------ | ---- | ------ | ------ | ------- |
| User/Profile | Terbatas | Ya | Terbatas | Tidak | Tenant dapat register, melihat profil sendiri, dan memperbarui profil/password sendiri. |
| Branch | Tidak | Ya | Tidak | Tidak | Tenant dapat melihat daftar cabang untuk memilih kamar. |
| Room | Tidak | Ya | Tidak | Tidak | Tenant dapat melihat daftar dan detail kamar. |
| Room Facility | Tidak | Ya | Tidak | Tidak | Dibaca sebagai bagian dari detail kamar. |
| Room Image | Tidak | Ya | Tidak | Tidak | Dibaca sebagai bagian dari detail kamar. |
| Rental Application | Ya | Terbatas | Terbatas | Tidak | Tenant dapat membuat pengajuan, melihat miliknya sendiri, dan membatalkan pengajuan saat masih pending. Pembatalan dicatat sebagai update status, bukan delete. |
| Payment | Ya | Terbatas | Terbatas | Tidak | Tenant dapat membuat pembayaran awal, membuat pembayaran perpanjangan, dan sinkronisasi status pembayaran miliknya. |
| Room Occupancy | Tidak | Terbatas | Tidak | Tidak | Tenant dapat membaca hunian aktif melalui konteks perpanjangan. Hunian dibuat otomatis setelah pembayaran berhasil. |
| Lease Reminder | Tidak | Tidak langsung | Tidak | Tidak | Pengingat dibuat otomatis oleh command dan dikirim via email; tenant tidak mengelola data reminder. |
| Expense | Tidak | Tidak | Tidak | Tidak | Pengeluaran hanya untuk owner. |

## CRUD Matrix Owner

| Entitas | Create | Read | Update | Delete | Catatan |
| ------- | ------ | ---- | ------ | ------ | ------- |
| User/Profile | Tidak langsung | Ya | Tidak langsung | Tidak | Owner dapat melihat data tenant melalui dashboard/tenant list, tetapi tidak ada fitur CRUD user tenant langsung. |
| Branch | Tidak | Ya | Tidak | Tidak | Aplikasi menyediakan endpoint baca cabang. Tidak ditemukan endpoint create/update/delete cabang. |
| Room | Ya | Ya | Ya | Terbatas | Owner dapat membuat, melihat, mengubah, dan menghapus kamar. Kamar yang sudah punya pengajuan atau hunian tidak boleh dihapus. |
| Room Facility | Ya | Ya | Ya | Ya | Fasilitas dibuat/diperbarui/dihapus sebagai bagian dari create/update Room. |
| Room Image | Ya | Ya | Ya | Ya | Gambar dibuat/diperbarui/dihapus sebagai bagian dari create/update Room. |
| Rental Application | Tidak | Ya | Ya | Tidak | Owner dapat melihat dan memproses pengajuan menjadi approved atau rejected. Owner tidak membuat atau menghapus pengajuan. |
| Payment | Tidak | Ya | Tidak | Tidak | Owner dapat melihat daftar pembayaran dan laporan pembayaran, tetapi tidak membuat/mengubah/menghapus transaksi. |
| Room Occupancy | Tidak langsung | Ya | Tidak langsung | Tidak | Hunian dibuat dan diperpanjang otomatis dari pembayaran berhasil. Owner membaca data hunian melalui dashboard/tenant/report. |
| Lease Reminder | Tidak langsung | Ya | Tidak | Tidak | Reminder dibuat otomatis oleh command. Owner dapat melihat ringkasannya melalui analytics/laporan jika tersedia. |
| Expense | Ya | Ya | Ya | Ya | Owner dapat membuat, melihat, mengubah, dan soft delete pengeluaran. |

## Matriks Gabungan

| Entitas | Tenant C | Tenant R | Tenant U | Tenant D | Owner C | Owner R | Owner U | Owner D |
| ------- | -------- | -------- | -------- | -------- | ------- | ------- | ------- | ------- |
| User/Profile | Terbatas | Ya | Terbatas | Tidak | Tidak langsung | Ya | Tidak langsung | Tidak |
| Branch | Tidak | Ya | Tidak | Tidak | Tidak | Ya | Tidak | Tidak |
| Room | Tidak | Ya | Tidak | Tidak | Ya | Ya | Ya | Terbatas |
| Room Facility | Tidak | Ya | Tidak | Tidak | Ya | Ya | Ya | Ya |
| Room Image | Tidak | Ya | Tidak | Tidak | Ya | Ya | Ya | Ya |
| Rental Application | Ya | Terbatas | Terbatas | Tidak | Tidak | Ya | Ya | Tidak |
| Payment | Ya | Terbatas | Terbatas | Tidak | Tidak | Ya | Tidak | Tidak |
| Room Occupancy | Tidak | Terbatas | Tidak | Tidak | Tidak langsung | Ya | Tidak langsung | Tidak |
| Lease Reminder | Tidak | Tidak langsung | Tidak | Tidak | Tidak langsung | Ya | Tidak | Tidak |
| Expense | Tidak | Tidak | Tidak | Tidak | Ya | Ya | Ya | Ya |

## Catatan Hak Akses

Tenant hanya boleh mengakses data miliknya sendiri untuk pengajuan, pembayaran, profil, dan hunian.

Owner memiliki akses baca yang luas untuk kebutuhan operasional dan laporan.

Beberapa data tidak dibuat langsung oleh manusia:

- Room Occupancy dibuat otomatis saat pembayaran awal sukses.
- Lease Reminder dibuat otomatis oleh command pengingat sewa.
- Perpanjangan Room Occupancy terjadi otomatis saat pembayaran renewal sukses.

Delete yang benar-benar menghapus data dibatasi:

- Room hanya dapat dihapus jika belum memiliki pengajuan atau hunian.
- Expense menggunakan soft delete.
- Rental Application tidak dihapus oleh tenant, tetapi dapat dibatalkan saat pending.
