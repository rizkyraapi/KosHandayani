# Email Templates KosHandayani

Dokumen ini menjelaskan template email HTML yang digunakan aplikasi KosHandayani.

## Layout Utama

Semua email menggunakan layout:

- `backend/resources/views/emails/layout.blade.php`

Layout ini memuat struktur HTML responsif, background, container, header logo KosHandayani, card konten, dan footer.

## Komponen Email

Komponen reusable tersedia di:

- `backend/resources/views/emails/components/header.blade.php`
- `backend/resources/views/emails/components/content.blade.php`
- `backend/resources/views/emails/components/cta-button.blade.php`
- `backend/resources/views/emails/components/footer.blade.php`

Gunakan komponen ini agar seluruh email tetap konsisten dengan branding KosHandayani.

## Template Yang Tersedia

### Verifikasi Akun

View:

- `backend/resources/views/emails/verification.blade.php`

Notification:

- `App\Notifications\VerifyEmailNotification`

Subject:

- `Verifikasi Akun KosHandayani`

Data:

- `userName`
- `verificationUrl`

Isi:

- Sapaan nama user
- Penjelasan verifikasi akun
- Tombol `Verifikasi Email`
- Fallback URL
- Footer KosHandayani

### Reminder H-30 / H-7 / H-1

View:

- `backend/resources/views/emails/lease-reminder.blade.php`

Mailable:

- `App\Mail\LeaseReminderMail`

Subject:

- `Pengingat Masa Sewa Akan Berakhir`

Data:

- `tenantName`
- `roomName`
- `branchName`
- `endDate`
- `daysLeft`
- `actionUrl`
- `message`

### Reminder H-0

Subject:

- `Masa Sewa Anda Berakhir Hari Ini`

Data sama seperti reminder sewa biasa, dengan `daysLeft = 0`.

### Reminder Overdue

Subject:

- `Masa Sewa Telah Berakhir`

Data:

- `tenantName`
- `roomName`
- `branchName`
- `endDate`
- `overdueDays`
- `actionUrl`
- `message`

Jika jumlah hari keterlambatan tersedia, template menampilkannya dalam card peringatan.

## Preview Lokal

Route preview hanya aktif saat `APP_ENV=local`.

- `GET /api/debug/email-preview/verification`
- `GET /api/debug/email-preview/reminder`
- `GET /api/debug/email-preview/overdue`

Route ini hanya merender HTML email di browser dan tidak mengirim email.

## Cara Menambah Template Baru

1. Buat view baru di `backend/resources/views/emails`.
2. Extend `emails.layout`.
3. Gunakan komponen di `backend/resources/views/emails/components`.
4. Buat `Mailable` atau `Notification` yang mengarah ke view tersebut.
5. Tambahkan route preview lokal bila template perlu dicek visualnya.
6. Tambahkan test yang memastikan subject, penerima, dan data utama sudah benar.

## Branding

- Nama aplikasi: `KosHandayani`
- Warna utama: `#006e2f`
- Warna aksen: `#22c55e`
- Logo: `backend/public/KosHandayani_Logo.png`

Jangan gunakan template email default Laravel untuk email aplikasi.
