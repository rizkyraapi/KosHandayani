# Full End-to-End Audit — KosHandayani

Tanggal audit: 22 Juni 2026  
Scope: backend Laravel, frontend Next.js, database MySQL lokal, API, analytics, security, performance, UI/UX, dan automated tests.

## Ringkasan Eksekutif

- Total temuan terkelompok: **34**
- CRITICAL: **7** — seluruhnya diperbaiki
- HIGH: **13** — 9 diperbaiki, 1 diperbaiki sebagian, 3 tersisa
- MEDIUM: **10** — 3 diperbaiki, 7 tersisa
- LOW: **4** — tersisa
- Selesai penuh: **19**
- Selesai sebagian: **1**
- Masih tersisa: **15** termasuk temuan parsial

Kesimpulan: aplikasi **layak untuk demo/sidang** setelah perbaikan ini. Aplikasi **belum direkomendasikan untuk production publik penuh** sampai residual HIGH terkait penyimpanan bearer token, transaksi database yang mencakup request Midtrans, lifecycle refund/chargeback, dan rekonsiliasi schema produksi diselesaikan.

## Hasil Verifikasi Akhir

| Pemeriksaan | Hasil |
|---|---|
| `php artisan test` | **PASS — 86 tests, 648 assertions** |
| `npm run build` | **PASS — Next.js 16.2.9** |
| `npm run lint` | **PASS — 0 error, 29 warning** |
| `composer validate` | **PASS** |
| `composer audit --locked` | **PASS — 0 advisory** |
| `npm audit --omit=dev` | **0 critical, 0 high, 2 moderate** |
| Migration | Seluruh migration berstatus `Ran` |
| Browser smoke test | Seluruh halaman tenant/owner termuat, tanpa server error atau horizontal overflow |
| Security runtime check | Debug/test route 404, signature Midtrans invalid 401, tenant mutasi kamar 403 |

## Audit Business Flow

| Flow | Bukti verifikasi | Hasil |
|---|---|---|
| Tenant register, login, token, logout | `AuthTokenTest`, browser login | PASS |
| Email verification dan resend | `EmailVerificationFlowTest` | PASS |
| Browse dan detail kamar | Browser `/rooms`, `/room/[id]` | PASS |
| Pengajuan sewa dan upload KTP/KK | Feature tests dan signed document download | PASS |
| Approval/rejection owner | Approval tests, termasuk konflik kamar/pembayaran | PASS |
| Initial payment dan retry | `PaymentFlowTest` | PASS |
| Webhook settlement dan occupancy | Idempotency dan conflict tests | PASS |
| Reminder H-30/H-7/H-1/H-0/overdue | `LeaseReminderCommandTest` | PASS |
| Renewal dan renewal settlement | Renewal payment/settlement tests | PASS |
| Owner dashboard | Browser dan `OwnerAnalyticsTest` | PASS |
| Room management | CRUD, authorization, dan history guard tests | PASS |
| Rental application monitoring | Owner index/detail tests dan browser | PASS |
| Tenant/payment monitoring | Analytics tests dan browser | PASS |
| Expense management | CRUD/filter/receipt/soft-delete tests | PASS |
| Report dan PDF export | Analytics/PDF consistency tests | PASS |

## Audit Database

Snapshot data lokal setelah pembersihan akun audit:

| Tabel | Jumlah |
|---|---:|
| users | 12 |
| branches | 2 |
| rooms | 20 |
| rental_applications | 3 |
| payments | 4 |
| room_occupancies | 2 |
| lease_reminders | 1 |
| expenses | 8 |

Pemeriksaan tidak menemukan orphan record, duplicate payment/order aktif, duplicate occupancy aktif, atau duplicate reminder pada data saat audit. Migration tambahan memindahkan **6 dokumen penyewa** dan **2 receipt pengeluaran** ke private storage; tidak ada dokumen sensitif tersisa di public storage.

## Konsistensi Analytics

Snapshot bulan audit:

| Metrik | Nilai | Sumber pembanding |
|---|---:|---|
| Initial revenue | Rp2.100.000 | Payments dan Reports |
| Renewal revenue | Rp1.400.000 | Payments dan Reports |
| Total revenue | Rp3.500.000 | Dashboard, Payments, Reports |
| Expenses | Rp1.920.000 | Dashboard, Expenses, Reports |
| Net income | Rp1.580.000 | Dashboard dan Reports |
| Occupancy rate | 10% | Dashboard dan Reports |

Rumus dan filter cabang/tahun telah diuji konsisten pada dashboard, payments, reports, dan PDF.

## Temuan CRITICAL

| ID | Status | Lokasi | Akar masalah | Dampak | Rekomendasi dan cara memperbaiki |
|---|---|---|---|---|---|
| C-01 | FIXED | `backend/routes/api.php`, `backend/app/Http/Middleware/EnsureUserHasRole.php` | Endpoint mutasi kamar hanya memakai `auth:sanctum`, tanpa role owner. | Tenant dapat mencoba membuat, mengubah, atau menghapus kamar. | Tambahkan middleware role dan kelompokkan seluruh route owner. Runtime sekarang mengembalikan 403 untuk tenant. |
| C-02 | FIXED | `backend/routes/api.php`, `backend/bootstrap/app.php`, `backend/.env.example` | Debug preview, debug verification, dan test-email terekspos; debug mode aktif pada environment yang memakai URL tunnel. | Kebocoran endpoint internal, email testing, stack trace, dan informasi aplikasi. | Hapus test endpoint, batasi debug route ke local/testing plus owner auth, paksa response API JSON, dan default `APP_DEBUG=false`. |
| C-03 | FIXED | `backend/app/Services/MidtransService.php` | Validasi signature webhook dilewati saat `APP_ENV=local`. | Webhook palsu dapat mengubah status pembayaran pada deployment lokal/tunnel. | Bypass hanya di environment `testing`; request signature invalid sekarang mendapat 401. |
| C-04 | FIXED | `RentalApplicationController.php`, `ExpenseController.php`, migration `2026_06_22_000002` dan `000004` | KTP, KK, dan receipt disimpan pada disk publik. | Dokumen identitas/keuangan dapat diakses tanpa authorization bila URL diketahui. | Simpan di disk private, terbitkan signed URL singkat hanya dari response terotorisasi, jangan kirim path storage internal, migrasikan file lama, lalu hapus orphan publik. |
| C-05 | FIXED | `backend/app/Http/Controllers/PaymentController.php` | Webhook mempercayai `gross_amount`, dapat menurunkan status sukses, dan menganggap capture challenge sebagai sukses. | Manipulasi nilai, settlement salah, dan regresi status pembayaran. | Cocokkan nominal persis dengan nilai internal, terapkan monotonic state, validasi fraud status, dan tambahkan test mismatch/challenge/delayed failure. |
| C-06 | FIXED | `PaymentController.php`, `RentalApplicationController.php`, migration `2026_06_22_000003` | Approval/payment/occupancy tidak cukup dilindungi lock dan unique constraint. | Dua tenant dapat dialokasikan ke kamar yang sama saat request bersamaan. | Gunakan row lock, conflict preflight, blok multiple approved application, dan unique index occupancy per rental application. |
| C-07 | FIXED | `RoomController.php`, `RentalApplicationController.php` | Kamar dengan histori dapat dihapus dan aplikasi dapat ditolak setelah pembayaran aktif. | Histori finansial/hunian hilang atau lifecycle menjadi kontradiktif. | Blok penghapusan kamar yang memiliki application/occupancy serta blok rejection ketika initial payment pending/paid. |

## Temuan HIGH

| ID | Status | Lokasi | Akar masalah | Dampak | Rekomendasi dan cara memperbaiki |
|---|---|---|---|---|---|
| H-01 | FIXED | `backend/composer.lock`, `frontend/package.json`, `frontend/package-lock.json` | Dependency lama memiliki advisory Laravel/Symfony/Guzzle/Next. | Risiko email header injection, request parsing, dan kerentanan framework. | Laravel diperbarui ke 12.62.0, Next ke 16.2.9, Composer audit kini 0 advisory dan npm tidak memiliki HIGH/CRITICAL. |
| H-02 | OPEN | `frontend/lib/auth.ts` | Bearer token Sanctum disimpan dalam cookie yang dapat dibaca JavaScript. | XSS dapat mencuri token dan mengambil alih sesi. | Migrasikan ke HttpOnly secure cookie melalui BFF/same-origin Sanctum SPA auth. Perubahan ini memerlukan penyesuaian arsitektur login sehingga tidak diterapkan dalam audit non-business-flow. |
| H-03 | FIXED | `AuthController.php`, `backend/config/sanctum.php` | Token tidak memiliki expiry dan perubahan password tidak mencabut sesi lain. | Token bocor dapat dipakai tanpa batas waktu. | Tambahkan expiry per token, batas global Sanctum, opsi remember, dan revoke token lain saat password berubah. |
| H-04 | FIXED | `backend/routes/api.php` | Login, register, resend verification, dan webhook tidak diberi throttling memadai. | Brute force, spam email, dan request flood. | Terapkan throttle berbeda sesuai sensitivitas endpoint. |
| H-05 | FIXED | `PaymentController.php` | Endpoint sync memanggil Midtrans sebelum memastikan order milik tenant. | IDOR dan enumeration order eksternal. | Cari payment berdasarkan tenant/order terlebih dahulu, baru lakukan sinkronisasi eksternal. |
| H-06 | FIXED | `AuthController.php`, `EmailVerificationController.php` | Kegagalan mail setelah user dibuat dikembalikan sebagai kegagalan register total. | User mengulang register tetapi email sudah terpakai; state membingungkan. | Register tetap sukses dengan warning dan resend menangani kegagalan secara generik serta tercatat di log. |
| H-07 | FIXED | `backend/bootstrap/app.php` | Request API tanpa header JSON diarahkan ke route `login` web yang tidak ada. | Endpoint protected dapat menghasilkan 500 alih-alih 401. | Paksa exception rendering JSON untuk seluruh path API. |
| H-08 | FIXED | `backend/config/cors.php`, `.env.example` | Origin hard-coded dan credentials policy tidak konsisten dengan bearer auth. | Deployment gagal atau origin yang tidak tepat memperoleh akses. | Gunakan allow-list dari environment dan matikan credentialed CORS untuk bearer-token flow saat ini. |
| H-09 | FIXED | `backend/config/app.php`, `.env.example` | Default timezone UTC, sementara laporan/reminder memakai konteks Indonesia. | Boundary bulan, jatuh tempo, reminder, dan laporan dapat bergeser. | Default dan environment diubah ke `Asia/Jakarta`. |
| H-10 | FIXED | `backend/app/Console/Commands/SendLeaseReminders.php` | Satu kegagalan email menghentikan seluruh batch reminder. | Tenant lain tidak menerima reminder. | Tangkap exception per email, lanjutkan batch, log kegagalan, dan beri exit status gagal bila ada error. Pastikan cron `schedule:run` dikonfigurasi saat deployment. |
| H-11 | PARTIAL | migrations lama dan `2026_06_22_000003_reconcile_core_indexes_and_nullability.php` | Schema MySQL aktual pernah berbeda dari urutan migration terkait nullable, index, tipe, dan cascade. | Fresh install dan database lama dapat berperilaku berbeda; risiko integritas saat deploy. | Index penting dan nullable expense sudah direkonsiliasi. Sebelum production, buat schema dump staging dan migration eksplisit untuk setiap FK/cascade yang masih berbeda; jangan mengubah constraint production tanpa backup dan dry-run. |
| H-12 | OPEN | `backend/app/Http/Controllers/PaymentController.php` | Beberapa komunikasi Midtrans masih berada dalam cakupan transaksi/lock database. | Request lambat dapat menahan lock dan meningkatkan deadlock/timeout. | Pisahkan external call dari transaksi: reservasi state idempotent, commit, panggil Midtrans, lalu finalisasi dengan compare-and-set. Perlu desain failure recovery sehingga tidak diterapkan secara terburu-buru. |
| H-13 | OPEN | `PaymentController.php`, model/status pembayaran | Lifecycle refund, partial refund, chargeback, dan reversal belum dimodelkan lengkap. | Angka revenue dapat tetap dihitung setelah dana dikembalikan dan rekonsiliasi memerlukan intervensi manual. | Definisikan state machine finansial dan event ledger sebelum production. Ini mengubah business flow sehingga hanya didokumentasikan. |

## Temuan MEDIUM

| ID | Status | Lokasi | Akar masalah | Dampak | Rekomendasi dan cara memperbaiki |
|---|---|---|---|---|---|
| M-01 | FIXED | `backend/app/Services/OwnerAnalyticsService.php` | Perhitungan laporan bulanan dan tenant memicu query berulang/N+1. | Laporan melambat saat data tumbuh. | Preload occupancy tahunan dan relation tenant. Query reports turun sekitar 31→19, tenants 25→9 pada dataset audit. |
| M-02 | OPEN | owner/tenant list controllers dan `OwnerAnalyticsService.php` | Sejumlah endpoint mengembalikan seluruh record tanpa pagination. | Memory dan response time meningkat linear terhadap data. | Tambahkan pagination/filter server-side tanpa mengubah perhitungan agregat. |
| M-03 | OPEN | `frontend/app/page.tsx` | Angka cabang/unit/tenant pada landing page bersifat statis dan tidak sesuai database. | Klaim publik menyesatkan dan berbeda dari dashboard. | Ganti dengan copy non-numerik atau endpoint public aggregate yang terkontrol. |
| M-04 | OPEN | mayoritas `frontend/app/**/page.tsx` | Banyak CSS inline besar, card/button pattern duplikat, dan hierarchy visual berbeda antarhalaman. | Maintenance mahal dan pengalaman terasa tidak sepenuhnya konsisten. | Ekstrak design tokens dan komponen layout/card/button/state secara bertahap tanpa mengubah fitur. |
| M-05 | FIXED | `tenant/perpanjang-sewa/page.tsx`, `tenant/rental-applications/page.tsx`, `tenant/dashboard/page.tsx` | Beberapa state update memicu lint error dan renewal menampilkan pesan Axios mentah. | UX error tidak ramah dan potensi render loop. | Gunakan helper pesan API, stabilkan effect/callback, dan hilangkan direct set-state lint errors. |
| M-06 | FIXED | `frontend/app/tenant/profil/page.tsx`, `backend/app/Models/User.php` | Profil menampilkan ID dan tanggal bergabung palsu. | Data identitas UI tidak dapat dipercaya. | API mengirim `created_at`; UI memakai ID dan tanggal user aktual. |
| M-07 | OPEN | file frontend yang dilaporkan ESLint | Masih ada 27 penggunaan `<img>` dan 2 warning font. | LCP/bandwidth kurang optimal. | Migrasikan aset utama ke `next/image` dan font ke `next/font`; lint tetap 0 error. |
| M-08 | OPEN | repository tests | Tidak ada automated browser E2E yang mengunci flow lintas frontend/backend. | Regresi navigasi, cookie, dan schema response bisa lolos unit/feature tests. | Tambahkan suite Playwright/Cypress untuk register→payment dan owner approval→report. |
| M-09 | OPEN | `frontend/proxy.ts`, `frontend/lib/auth.ts` | Proxy frontend hanya dapat memperkirakan role dari cookie sisi klien. | Guard frontend dapat dimanipulasi untuk navigasi, walau backend tetap menolak API. | Setelah migrasi HttpOnly session, validasi session/role secara server-side pada proxy atau layout. |
| M-10 | OPEN | profile API/model dan tipe frontend | `profile_completed` dan beberapa field nullable/enum masih dihitung atau ditafsirkan di lebih dari satu tempat. | Risiko mismatch schema saat field bertambah. | Definisikan DTO/API resource tunggal dan generated/shared schema untuk frontend. |

## Temuan LOW

| ID | Status | Lokasi | Akar masalah | Dampak | Rekomendasi dan cara memperbaiki |
|---|---|---|---|---|---|
| L-01 | OPEN | beberapa layout/page frontend | Footer masih menampilkan tahun 2024. | Tampilan terasa usang. | Gunakan tahun dinamis atau perbarui copy. |
| L-02 | OPEN | login, footer, bantuan | Sejumlah link masih menggunakan `href="#"` atau placeholder. | Navigasi membingungkan dan kurang aksesibel. | Nonaktifkan sebagai text sampai halaman tersedia atau arahkan ke tujuan nyata. |
| L-03 | OPEN | `frontend/app/tenant/profile` dan `tenant/profil` | Dua route profil paralel dipertahankan. | Duplikasi dan potensi perilaku berbeda. | Pilih route kanonik dan jadikan route lain redirect. |
| L-04 | OPEN | migrations lama, README, page components | Terdapat migration legacy yang sulit dibalik, README/teks lama, file halaman sangat besar, dan logic/style duplikat. | Technical debt dan onboarding developer lebih lambat. | Rapikan bertahap setelah freeze fitur; jangan squash migration yang sudah pernah dijalankan di production. |

## Catatan API dan Response Schema

- Route tenant dan owner kini dikelompokkan berdasarkan role.
- Field expense `created_by` diselaraskan menjadi nullable pada tipe frontend.
- User profile kini memasukkan `created_at`.
- URL dokumen rental dan receipt berubah menjadi signed URL sementara.
- Error API protected selalu berbentuk JSON, termasuk request yang tidak mengirim `Accept: application/json`.
- Belum ditemukan mismatch yang memblokir flow aktif setelah build TypeScript dan browser smoke test.

## Kesiapan

| Target | Penilaian |
|---|---|
| Demo lokal | **READY** |
| Sidang/presentasi | **READY**, dengan data demo dan koneksi Midtrans/email yang sudah disiapkan |
| Staging terbatas | **READY WITH CONDITIONS** — gunakan HTTPS, queue/scheduler, backup, dan secret production |
| Production publik | **NOT YET FULLY READY** — selesaikan H-02, H-11, H-12, H-13 dan lakukan load/concurrency test |

## Checklist Deployment Wajib

1. Gunakan `APP_ENV=production`, `APP_DEBUG=false`, HTTPS, dan secret Midtrans/email production.
2. Set `APP_URL`, `FRONTEND_URL`, dan `CORS_ALLOWED_ORIGINS` ke origin production yang tepat.
3. Jalankan `php artisan migrate --force` setelah backup dan dry-run staging.
4. Konfigurasikan queue worker dan cron `php artisan schedule:run`.
5. Pastikan private storage tidak dipublish melalui web server.
6. Jalankan ulang test, build, lint, Composer audit, dan npm audit pada artefak deployment.
