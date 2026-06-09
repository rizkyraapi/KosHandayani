# KosHandayani Demo Checklist

## Tenant Flow

1. Register akun tenant baru.
2. Login sebagai tenant.
3. Lengkapi profil tenant sampai status profil complete.
4. Pilih kamar yang masih available.
5. Ajukan sewa dengan durasi, tanggal masuk, KTP, dan KK.
6. Tunggu owner approve pengajuan.
7. Buka tagihan atau detail pengajuan.
8. Bayar melalui Midtrans Sandbox Snap.
9. Pastikan status pembayaran berubah menjadi paid.
10. Pastikan riwayat pembayaran muncul.

## Owner Flow

1. Login sebagai owner.
2. Buka halaman Pengajuan Sewa.
3. Pastikan pengajuan tenant baru muncul dalam status Menunggu.
4. Buka detail pengajuan.
5. Approve pengajuan.
6. Buka halaman Pembayaran setelah tenant membayar.
7. Pastikan pembayaran masuk dengan status Lunas.
8. Buka halaman Tenant.
9. Pastikan tenant aktif muncul setelah settlement.
10. Buka halaman Rooms.
11. Pastikan kamar berubah menjadi occupied.

## Midtrans Webhook Check

1. Pastikan `POST /api/payments/notification` mengarah ke backend public URL/ngrok.
2. Pastikan GET ke endpoint tersebut tidak redirect ke login.
3. Pastikan `storage/logs/laravel.log` berisi `Midtrans notification received`.
4. Pastikan settlement mengisi `payments.paid_at`.
5. Pastikan settlement membuat `room_occupancies` hanya sekali.
