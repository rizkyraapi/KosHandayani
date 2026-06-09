# KosHandayani Demo Data

## Seed Bawaan

Seeder bawaan Laravel saat ini membuat akun:

- Email: `test@example.com`
- Password: `password`
- Catatan: role mengikuti default schema/factory lokal. Gunakan akun ini hanya bila role-nya sesuai kebutuhan demo.

## Akun Tenant Demo

Untuk demo paling aman, buat tenant baru lewat halaman register:

- Nama: `Tenant Demo`
- WhatsApp: `081234567890`
- Email: `tenant.demo@example.com`
- Password: `Password123`

## Akun Owner Demo

Pastikan ada satu user dengan role `owner` di database lokal sebelum presentasi.

Rekomendasi kredensial demo:

- Nama: `Owner Demo`
- Email: `owner.demo@example.com`
- Password: `Password123`
- Role: `owner`

## Data Kamar Demo

Siapkan minimal satu kamar dengan kondisi:

- `room_status`: `available`
- `is_available`: `true`
- Harga bulanan realistis, misalnya `500000`
- Minimal 4 foto kamar
- Cabang sudah terisi

Setelah payment settlement, kamar yang dipakai tenant harus berubah menjadi:

- `room_status`: `occupied`
- `is_available`: `false`
