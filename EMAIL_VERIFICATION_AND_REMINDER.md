# Email Verification and Lease Reminder

## Arsitektur

Fitur ini memakai email verification native Laravel dan sistem reminder sewa berbasis tabel `lease_reminders` yang sudah tersedia di database. Backend tetap memakai Sanctum untuk auth API, Midtrans flow tidak berubah, dan reminder dijalankan melalui Artisan command terjadwal.

## Flow Email Verification

1. Tenant register melalui `POST /api/register`.
2. User dibuat dengan `email_verified_at = null`.
3. Laravel mengirim email verification link ke email user.
4. Link email mengarah ke signed route `GET /api/email/verify/{id}/{hash}`.
5. Backend memvalidasi signature dan hash email.
6. Jika valid, `email_verified_at` diisi.
7. User diarahkan ke frontend: `/email-verification/success`.

## Endpoint Baru

- `GET /api/email/verify/{id}/{hash}`  
  Signed public endpoint dari email verification Laravel.

- `POST /api/email/resend-verification`  
  Protected by `auth:sanctum`. Mengirim ulang link verifikasi.

- `GET /api/email/verification-status`  
  Protected by `auth:sanctum`. Mengembalikan `{ "verified": true }` atau `{ "verified": false }`.

## Proteksi Email Verified

User belum verifikasi email masih bisa login, logout, melihat profil, dan mengedit profil.

User belum verifikasi email tidak bisa:

- membuat rental application
- membuat payment
- melakukan flow perpanjangan sewa jika endpoint renewal ditambahkan dan memakai middleware yang sama

Middleware yang digunakan: `verified.email`.

Response:

```json
{
  "message": "Silakan verifikasi email terlebih dahulu"
}
```

## Flow Lease Reminder

Command `lease:send-reminders`:

1. Mengambil `room_occupancies` aktif dengan `end_date`.
2. Menghitung selisih hari dari tanggal hari ini ke `end_date`.
3. Membaca durasi dari `rental_application.duration`.
4. Menentukan reminder type:
   - `H-30`
   - `H-7`
   - `H-1`
   - `H-0`
   - `OVERDUE_D1`, `OVERDUE_D2`, dan seterusnya untuk overdue harian
5. Mengecek tabel `lease_reminders` berdasarkan `room_occupancy_id`, `reminder_type`, dan `channel=email`.
6. Jika belum pernah terkirim, email dikirim dan record reminder dibuat.

## Reminder Rules

Durasi `1 Bulan`:

- H-7
- H-1
- H-0
- overdue harian

Durasi `3 Bulan`, `6 Bulan`, dan `12 Bulan`:

- H-30
- H-7
- H-1
- H-0
- overdue harian

## Scheduler

Command didaftarkan di `routes/console.php`:

```php
Schedule::command('lease:send-reminders')->dailyAt('08:00')->timezone('Asia/Jakarta');
```

Jalankan scheduler lokal:

```bash
php artisan schedule:work
```

Atau uji command manual:

```bash
php artisan lease:send-reminders
```

## Frontend

Tenant dashboard menampilkan card `Masa Sewa Aktif` berisi:

- nama kamar
- tanggal berakhir sewa
- sisa hari

Tenant profile menampilkan badge:

- `Email Terverifikasi`
- `Belum Terverifikasi`

Jika belum terverifikasi, user dapat menekan tombol `Kirim Ulang Email Verifikasi`.

## Testing

Jalankan seluruh test backend:

```bash
php artisan test
```

Jalankan build frontend:

```bash
npm run build
```

## Troubleshooting SMTP Gmail

- Pastikan `MAIL_MAILER=smtp`.
- Pastikan `MAIL_HOST=smtp.gmail.com`.
- Gunakan port `587` dengan TLS.
- Pastikan `MAIL_USERNAME` adalah email Gmail pengirim.
- Gunakan App Password Gmail, bukan password akun utama.
- Pastikan `MAIL_FROM_ADDRESS` sama atau sesuai dengan akun SMTP.
- Cek `storage/logs/laravel.log` untuk error authentication, timeout, atau blocked sign-in.
