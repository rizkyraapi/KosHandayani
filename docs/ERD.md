# ERD KosHandayani

Dokumen ini adalah hasil audit read-only terhadap migration, model Eloquent, controller, command, service, dan konfigurasi Laravel pada proyek KosHandayani. Dokumen ini dapat dipakai sebagai sumber tunggal untuk membuat ERD Crow's Foot dan ERD Chen.

Catatan audit:

- Tidak ada kode aplikasi yang diubah.
- Tidak ada migration baru yang dibuat.
- Relasi dihitung dalam dua kelompok: foreign key eksplisit di database dan relasi logis Laravel/framework yang tidak memakai constraint FK.

# 1. Ringkasan Database

Jumlah tabel: 18

Jumlah relasi terdokumentasi: 17

- 14 relasi foreign key eksplisit.
- 3 relasi logis Laravel/framework tanpa foreign key database eksplisit.

Tabel utama:

- users
- branches
- rooms
- rental_applications
- payments
- room_occupancies

Tabel transaksi:

- rental_applications
- payments
- room_occupancies
- lease_reminders
- expenses

Tabel master:

- users
- branches
- rooms
- room_facilities
- room_images

Tabel pendukung/framework:

- personal_access_tokens
- password_reset_tokens
- sessions
- cache
- cache_locks
- jobs
- job_batches
- failed_jobs

Tabel domain yang benar-benar dipakai aplikasi:

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

Tabel framework yang dipakai atau disiapkan oleh Laravel:

- personal_access_tokens: token API Sanctum.
- password_reset_tokens: token reset password Laravel.
- sessions: penyimpanan session jika session driver memakai database.
- cache dan cache_locks: penyimpanan cache/lock jika cache driver memakai database.
- jobs, job_batches, failed_jobs: queue dan job tracking jika queue driver memakai database.

Tabel legacy/tidak terpakai:

- Tidak ditemukan tabel domain legacy yang benar-benar tidak terpakai.
- Ditemukan kolom legacy `rooms.branch`, bukan tabel. Kolom ini masih diisi untuk kompatibilitas dengan skema lama, sedangkan relasi cabang yang benar sekarang adalah `rooms.branch_id -> branches.id`.

# 2. Daftar Entitas

## users

Deskripsi:
Menyimpan data akun pengguna, baik tenant maupun owner. User adalah aktor utama sistem.

Primary Key:

- id

Foreign Key:

- -

Kolom penting:

- name
- email
- email_verified_at
- password
- role
- phone
- job
- address
- profile_completed
- profile_photo
- remember_token
- created_at
- updated_at

## password_reset_tokens

Deskripsi:
Menyimpan token reset password Laravel berdasarkan email.

Primary Key:

- email

Foreign Key:

- Tidak ada FK database. Secara logis `email` mengacu ke `users.email`.

Kolom penting:

- email
- token
- created_at

## sessions

Deskripsi:
Menyimpan session Laravel jika konfigurasi session memakai driver database.

Primary Key:

- id

Foreign Key:

- Tidak ada FK database. Secara logis `user_id` mengacu ke `users.id`.

Kolom penting:

- id
- user_id
- ip_address
- user_agent
- payload
- last_activity

## cache

Deskripsi:
Menyimpan cache aplikasi jika konfigurasi cache memakai driver database.

Primary Key:

- key

Foreign Key:

- -

Kolom penting:

- key
- value
- expiration

## cache_locks

Deskripsi:
Menyimpan lock cache/database untuk mencegah proses paralel saling bertabrakan.

Primary Key:

- key

Foreign Key:

- -

Kolom penting:

- key
- owner
- expiration

## jobs

Deskripsi:
Menyimpan antrean job Laravel jika queue driver memakai database.

Primary Key:

- id

Foreign Key:

- -

Kolom penting:

- queue
- payload
- attempts
- reserved_at
- available_at
- created_at

## job_batches

Deskripsi:
Menyimpan metadata batch job Laravel.

Primary Key:

- id

Foreign Key:

- -

Kolom penting:

- name
- total_jobs
- pending_jobs
- failed_jobs
- failed_job_ids
- options
- cancelled_at
- created_at
- finished_at

## failed_jobs

Deskripsi:
Menyimpan job yang gagal diproses.

Primary Key:

- id

Foreign Key:

- -

Kolom penting:

- uuid
- connection
- queue
- payload
- exception
- failed_at

## rooms

Deskripsi:
Menyimpan data kamar kos, status ketersediaan, harga, kapasitas, cabang, dan ringkasan media.

Primary Key:

- id

Foreign Key:

- branch_id -> branches.id, nullable, nullOnDelete

Kolom penting:

- room_name
- branch_id
- branch
- gender_type
- description
- thumbnail
- max_guest
- price
- room_status
- is_available
- created_at
- updated_at

## personal_access_tokens

Deskripsi:
Menyimpan token autentikasi Laravel Sanctum untuk API login/logout.

Primary Key:

- id

Foreign Key:

- Tidak ada FK database. Relasi memakai polymorphic `tokenable_type` dan `tokenable_id`.

Kolom penting:

- tokenable_type
- tokenable_id
- name
- token
- abilities
- last_used_at
- expires_at
- created_at
- updated_at

## rental_applications

Deskripsi:
Menyimpan pengajuan sewa kamar oleh tenant, termasuk dokumen KTP/KK, status review owner, dan status pembayaran awal.

Primary Key:

- id

Foreign Key:

- user_id -> users.id, cascadeOnDelete
- room_id -> rooms.id, nullable, nullOnDelete

Kolom penting:

- user_id
- room_id
- move_in_date
- duration
- ktp_file
- kk_file
- status
- owner_notes
- payment_status
- approved_at
- paid_at
- created_at
- updated_at

## branches

Deskripsi:
Menyimpan data cabang atau lokasi kos.

Primary Key:

- id

Foreign Key:

- -

Kolom penting:

- branch_name
- city
- address
- description
- created_at
- updated_at

## room_facilities

Deskripsi:
Menyimpan daftar fasilitas per kamar.

Primary Key:

- id

Foreign Key:

- room_id -> rooms.id, cascadeOnDelete

Kolom penting:

- room_id
- facility_name
- created_at
- updated_at

## room_images

Deskripsi:
Menyimpan gambar kamar dan penanda gambar utama.

Primary Key:

- id

Foreign Key:

- room_id -> rooms.id, cascadeOnDelete

Kolom penting:

- room_id
- image_url
- is_primary
- created_at
- updated_at

## payments

Deskripsi:
Menyimpan pembayaran sewa awal dan pembayaran perpanjangan sewa melalui Midtrans.

Primary Key:

- id

Foreign Key:

- rental_application_id -> rental_applications.id, cascadeOnDelete
- room_occupancy_id -> room_occupancies.id, nullable, nullOnDelete

Kolom penting:

- rental_application_id
- payment_category
- room_occupancy_id
- subtotal_amount
- discount_amount
- duration_months
- monthly_price
- period_start
- period_end
- order_id
- transaction_id
- gross_amount
- payment_type
- transaction_status
- snap_token
- paid_at
- settlement_time
- created_at
- updated_at

## room_occupancies

Deskripsi:
Menyimpan riwayat dan status hunian kamar setelah pembayaran awal berhasil.

Primary Key:

- id

Foreign Key:

- user_id -> users.id, cascadeOnDelete
- room_id -> rooms.id, cascadeOnDelete
- rental_application_id -> rental_applications.id, cascadeOnDelete

Kolom penting:

- user_id
- room_id
- rental_application_id
- start_date
- end_date
- status
- created_at
- updated_at

Catatan unik:

- `rental_application_id` unik. Satu pengajuan sewa maksimal menghasilkan satu record hunian.

## lease_reminders

Deskripsi:
Menyimpan histori pengingat masa sewa yang sudah dikirim kepada tenant.

Primary Key:

- id

Foreign Key:

- room_occupancy_id -> room_occupancies.id, cascadeOnDelete
- user_id -> users.id, cascadeOnDelete

Kolom penting:

- room_occupancy_id
- user_id
- channel
- reminder_type
- sent_at
- created_at
- updated_at

Catatan unik:

- Kombinasi `room_occupancy_id`, `reminder_type`, dan `channel` dibuat unik jika data lama tidak memiliki duplikat.

## expenses

Deskripsi:
Menyimpan pengeluaran operasional cabang, termasuk kategori, nominal, bukti pembayaran, dan owner pembuat data.

Primary Key:

- id

Foreign Key:

- branch_id -> branches.id, restrictOnDelete
- created_by -> users.id, restrictOnDelete

Kolom penting:

- branch_id
- category
- description
- amount
- receipt_path
- expense_date
- created_by
- deleted_at
- created_at
- updated_at

Catatan:

- Menggunakan soft delete melalui `deleted_at`.

# 3. Relasi Antar Entitas

users (1)
-> (N) rental_applications

Penjelasan:
Satu user tenant dapat membuat banyak pengajuan sewa.

users (1)
-> (N) room_occupancies

Penjelasan:
Satu user tenant dapat memiliki banyak histori hunian, meskipun secara bisnis biasanya hanya satu hunian aktif pada satu waktu.

users (1)
-> (N) lease_reminders

Penjelasan:
Satu user dapat menerima banyak pengingat masa sewa.

users (1)
-> (N) expenses

Penjelasan:
Satu user owner dapat mencatat banyak pengeluaran melalui kolom `expenses.created_by`.

users (1)
-> (N) personal_access_tokens

Penjelasan:
Satu user dapat memiliki banyak token API Sanctum. Ini relasi polymorphic/logis, bukan FK database.

users (1)
-> (N) sessions

Penjelasan:
Satu user dapat memiliki banyak session. Ini relasi logis karena `sessions.user_id` hanya berupa index nullable, bukan FK.

users (1)
-> (0..1) password_reset_tokens

Penjelasan:
Satu email user dapat memiliki nol atau satu token reset password aktif karena `password_reset_tokens.email` adalah primary key. Ini relasi logis melalui email, bukan FK database.

branches (1)
-> (N) rooms

Penjelasan:
Satu cabang dapat memiliki banyak kamar. Pada database, `rooms.branch_id` nullable untuk kompatibilitas data lama.

branches (1)
-> (N) expenses

Penjelasan:
Satu cabang dapat memiliki banyak pengeluaran operasional.

rooms (1)
-> (N) room_facilities

Penjelasan:
Satu kamar dapat memiliki banyak fasilitas.

rooms (1)
-> (N) room_images

Penjelasan:
Satu kamar dapat memiliki banyak gambar.

rooms (1)
-> (N) rental_applications

Penjelasan:
Satu kamar dapat diajukan oleh banyak tenant sepanjang waktu. Pada database, `rental_applications.room_id` nullable karena kamar bisa dihapus dan FK diset null.

rooms (1)
-> (N) room_occupancies

Penjelasan:
Satu kamar dapat memiliki banyak riwayat hunian dari waktu ke waktu.

rental_applications (1)
-> (N) payments

Penjelasan:
Satu pengajuan sewa dapat memiliki pembayaran awal dan beberapa pembayaran perpanjangan. Relasi `payment()` pada model hanya mengambil pembayaran awal, sedangkan `payments()` mengambil seluruh histori pembayaran.

rental_applications (1)
-> (0..1) room_occupancies

Penjelasan:
Satu pengajuan sewa yang sudah dibayar menghasilkan maksimal satu hunian. Pengajuan yang masih pending, ditolak, atau dibatalkan belum memiliki hunian.

room_occupancies (1)
-> (N) payments

Penjelasan:
Satu hunian dapat memiliki banyak pembayaran perpanjangan. Untuk pembayaran awal, `room_occupancy_id` biasanya null karena hunian baru dibuat setelah pembayaran sukses.

room_occupancies (1)
-> (N) lease_reminders

Penjelasan:
Satu hunian dapat memiliki banyak pengingat masa sewa, misalnya H-30, H-7, H-1, H-0, dan overdue.

# 4. Kardinalitas

| Entitas A | Relasi | Entitas B | Kardinalitas |
| --------- | ------ | --------- | ------------ |
| users | membuat | rental_applications | 1:N |
| users | menempati melalui | room_occupancies | 1:N |
| users | menerima | lease_reminders | 1:N |
| users | mencatat | expenses | 1:N |
| users | memiliki token | personal_access_tokens | 1:N, polymorphic/logis |
| users | memiliki session | sessions | 1:N, logis |
| users | memiliki reset token | password_reset_tokens | 1:0..1, logis melalui email |
| branches | menaungi | rooms | 1:N, child nullable |
| branches | memiliki | expenses | 1:N |
| rooms | memiliki | room_facilities | 1:N |
| rooms | memiliki | room_images | 1:N |
| rooms | diajukan dalam | rental_applications | 1:N, child nullable |
| rooms | dihuni dalam | room_occupancies | 1:N |
| rental_applications | memiliki | payments | 1:N |
| rental_applications | menghasilkan | room_occupancies | 1:0..1 |
| room_occupancies | diperpanjang melalui | payments | 1:N, child nullable |
| room_occupancies | memiliki | lease_reminders | 1:N |

# 5. ERD Crow's Foot Source

Mermaid `erDiagram` source:

```mermaid
erDiagram
    users {
        bigint id PK
        string name
        string email UK
        timestamp email_verified_at
        string password
        string role
        string phone
        string job
        text address
        boolean profile_completed
        string profile_photo
        string remember_token
        timestamp created_at
        timestamp updated_at
    }

    password_reset_tokens {
        string email PK
        string token
        timestamp created_at
    }

    sessions {
        string id PK
        bigint user_id
        string ip_address
        text user_agent
        longtext payload
        integer last_activity
    }

    cache {
        string key PK
        mediumtext value
        integer expiration
    }

    cache_locks {
        string key PK
        string owner
        integer expiration
    }

    jobs {
        bigint id PK
        string queue
        longtext payload
        tinyint attempts
        integer reserved_at
        integer available_at
        integer created_at
    }

    job_batches {
        string id PK
        string name
        integer total_jobs
        integer pending_jobs
        integer failed_jobs
        longtext failed_job_ids
        mediumtext options
        integer cancelled_at
        integer created_at
        integer finished_at
    }

    failed_jobs {
        bigint id PK
        string uuid UK
        text connection
        text queue
        longtext payload
        longtext exception
        timestamp failed_at
    }

    branches {
        bigint id PK
        string branch_name
        string city
        text address
        text description
        timestamp created_at
        timestamp updated_at
    }

    rooms {
        bigint id PK
        string room_name
        bigint branch_id FK
        string branch
        string gender_type
        text description
        string thumbnail
        integer max_guest
        integer price
        string room_status
        boolean is_available
        timestamp created_at
        timestamp updated_at
    }

    room_facilities {
        bigint id PK
        bigint room_id FK
        string facility_name
        timestamp created_at
        timestamp updated_at
    }

    room_images {
        bigint id PK
        bigint room_id FK
        string image_url
        boolean is_primary
        timestamp created_at
        timestamp updated_at
    }

    rental_applications {
        bigint id PK
        bigint user_id FK
        bigint room_id FK
        date move_in_date
        string duration
        string ktp_file
        string kk_file
        string status
        text owner_notes
        string payment_status
        timestamp approved_at
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }

    payments {
        bigint id PK
        bigint rental_application_id FK
        string payment_category
        bigint room_occupancy_id FK
        bigint subtotal_amount
        bigint discount_amount
        smallint duration_months
        bigint monthly_price
        date period_start
        date period_end
        string order_id UK
        string transaction_id
        bigint gross_amount
        string payment_type
        string transaction_status
        string snap_token
        timestamp paid_at
        timestamp settlement_time
        timestamp created_at
        timestamp updated_at
    }

    room_occupancies {
        bigint id PK
        bigint user_id FK
        bigint room_id FK
        bigint rental_application_id FK_UK
        date start_date
        date end_date
        string status
        timestamp created_at
        timestamp updated_at
    }

    lease_reminders {
        bigint id PK
        bigint room_occupancy_id FK
        bigint user_id FK
        string channel
        string reminder_type
        timestamp sent_at
        timestamp created_at
        timestamp updated_at
    }

    expenses {
        bigint id PK
        bigint branch_id FK
        string category
        text description
        bigint amount
        string receipt_path
        date expense_date
        bigint created_by FK
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }

    personal_access_tokens {
        bigint id PK
        string tokenable_type
        bigint tokenable_id
        text name
        string token UK
        text abilities
        timestamp last_used_at
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ rental_applications : membuat
    users ||--o{ room_occupancies : menempati
    users ||--o{ lease_reminders : menerima
    users ||--o{ expenses : mencatat
    users ||--o{ personal_access_tokens : tokenable
    users ||--o{ sessions : memiliki
    users ||--o| password_reset_tokens : reset_password

    branches |o--o{ rooms : menaungi
    branches ||--o{ expenses : memiliki

    rooms ||--o{ room_facilities : memiliki
    rooms ||--o{ room_images : memiliki
    rooms |o--o{ rental_applications : diajukan
    rooms ||--o{ room_occupancies : dihuni

    rental_applications ||--o{ payments : memiliki
    rental_applications ||--o| room_occupancies : menghasilkan

    room_occupancies |o--o{ payments : perpanjangan
    room_occupancies ||--o{ lease_reminders : diingatkan
```

Crow's Foot relation lines sederhana:

```text
users ||--o{ rental_applications
users ||--o{ room_occupancies
users ||--o{ lease_reminders
users ||--o{ expenses
users ||--o{ personal_access_tokens
users ||--o{ sessions
users ||--o| password_reset_tokens

branches |o--o{ rooms
branches ||--o{ expenses

rooms ||--o{ room_facilities
rooms ||--o{ room_images
rooms |o--o{ rental_applications
rooms ||--o{ room_occupancies

rental_applications ||--o{ payments
rental_applications ||--o| room_occupancies

room_occupancies |o--o{ payments
room_occupancies ||--o{ lease_reminders
```

DBML/dbdiagram.io `Ref` source untuk FK eksplisit:

```dbml
Ref: rental_applications.user_id > users.id [delete: cascade]
Ref: rental_applications.room_id > rooms.id [delete: set null]
Ref: rooms.branch_id > branches.id [delete: set null]
Ref: room_facilities.room_id > rooms.id [delete: cascade]
Ref: room_images.room_id > rooms.id [delete: cascade]
Ref: payments.rental_application_id > rental_applications.id [delete: cascade]
Ref: payments.room_occupancy_id > room_occupancies.id [delete: set null]
Ref: room_occupancies.user_id > users.id [delete: cascade]
Ref: room_occupancies.room_id > rooms.id [delete: cascade]
Ref: room_occupancies.rental_application_id > rental_applications.id [delete: cascade]
Ref: lease_reminders.room_occupancy_id > room_occupancies.id [delete: cascade]
Ref: lease_reminders.user_id > users.id [delete: cascade]
Ref: expenses.branch_id > branches.id [delete: restrict]
Ref: expenses.created_by > users.id [delete: restrict]
```

DBML/dbdiagram.io full schema source:

```dbml
Table users {
  id bigint [pk, increment]
  name varchar
  email varchar [unique]
  email_verified_at timestamp [null]
  password varchar
  role varchar
  phone varchar [null]
  job varchar [null]
  address text [null]
  profile_completed boolean
  profile_photo varchar [null]
  remember_token varchar [null]
  created_at timestamp [null]
  updated_at timestamp [null]
}

Table password_reset_tokens {
  email varchar [pk]
  token varchar
  created_at timestamp [null]
}

Table sessions {
  id varchar [pk]
  user_id bigint [null]
  ip_address varchar(45) [null]
  user_agent text [null]
  payload longtext
  last_activity int

  indexes {
    user_id
    last_activity
  }
}

Table cache {
  key varchar [pk]
  value mediumtext
  expiration int

  indexes {
    expiration
  }
}

Table cache_locks {
  key varchar [pk]
  owner varchar
  expiration int

  indexes {
    expiration
  }
}

Table jobs {
  id bigint [pk, increment]
  queue varchar
  payload longtext
  attempts tinyint
  reserved_at int [null]
  available_at int
  created_at int

  indexes {
    queue
  }
}

Table job_batches {
  id varchar [pk]
  name varchar
  total_jobs int
  pending_jobs int
  failed_jobs int
  failed_job_ids longtext
  options mediumtext [null]
  cancelled_at int [null]
  created_at int
  finished_at int [null]
}

Table failed_jobs {
  id bigint [pk, increment]
  uuid varchar [unique]
  connection text
  queue text
  payload longtext
  exception longtext
  failed_at timestamp
}

Table branches {
  id bigint [pk, increment]
  branch_name varchar
  city varchar [null]
  address text [null]
  description text [null]
  created_at timestamp [null]
  updated_at timestamp [null]
}

Table rooms {
  id bigint [pk, increment]
  room_name varchar
  price int
  branch varchar
  is_available boolean
  description text [null]
  thumbnail varchar [null]
  max_guest int
  branch_id bigint [null]
  gender_type varchar
  room_status varchar
  created_at timestamp [null]
  updated_at timestamp [null]
}

Table room_facilities {
  id bigint [pk, increment]
  room_id bigint
  facility_name varchar
  created_at timestamp [null]
  updated_at timestamp [null]
}

Table room_images {
  id bigint [pk, increment]
  room_id bigint
  image_url varchar
  is_primary boolean
  created_at timestamp [null]
  updated_at timestamp [null]
}

Table rental_applications {
  id bigint [pk, increment]
  user_id bigint
  room_id bigint [null]
  move_in_date date [null]
  duration varchar [null]
  ktp_file varchar [null]
  kk_file varchar [null]
  status varchar
  owner_notes text [null]
  payment_status varchar
  approved_at timestamp [null]
  paid_at timestamp [null]
  created_at timestamp [null]
  updated_at timestamp [null]

  indexes {
    (user_id, created_at)
    (room_id, status, payment_status)
  }
}

Table payments {
  id bigint [pk, increment]
  rental_application_id bigint
  payment_category varchar
  room_occupancy_id bigint [null]
  subtotal_amount bigint
  discount_amount bigint
  duration_months smallint [null]
  monthly_price bigint [null]
  period_start date [null]
  period_end date [null]
  order_id varchar [unique]
  transaction_id varchar [null]
  gross_amount bigint
  payment_type varchar [null]
  transaction_status varchar
  snap_token varchar [null]
  paid_at timestamp [null]
  settlement_time timestamp [null]
  created_at timestamp [null]
  updated_at timestamp [null]

  indexes {
    rental_application_id
    (payment_category, transaction_status)
    (room_occupancy_id, payment_category)
    (rental_application_id, payment_category, transaction_status)
  }
}

Table room_occupancies {
  id bigint [pk, increment]
  user_id bigint
  room_id bigint
  rental_application_id bigint [unique]
  start_date date
  end_date date [null]
  status varchar
  created_at timestamp [null]
  updated_at timestamp [null]

  indexes {
    (user_id, status)
    (room_id, status)
    (status, end_date)
  }
}

Table lease_reminders {
  id bigint [pk, increment]
  room_occupancy_id bigint
  user_id bigint
  channel varchar
  reminder_type varchar(32)
  sent_at timestamp [null]
  created_at timestamp [null]
  updated_at timestamp [null]

  indexes {
    (room_occupancy_id, reminder_type, channel) [unique]
  }
}

Table expenses {
  id bigint [pk, increment]
  branch_id bigint
  category varchar
  description text [null]
  amount bigint
  receipt_path varchar [null]
  expense_date date
  created_by bigint
  deleted_at timestamp [null]
  created_at timestamp [null]
  updated_at timestamp [null]

  indexes {
    (expense_date, branch_id)
    (category, expense_date)
  }
}

Table personal_access_tokens {
  id bigint [pk, increment]
  tokenable_type varchar
  tokenable_id bigint
  name text
  token varchar(64) [unique]
  abilities text [null]
  last_used_at timestamp [null]
  expires_at timestamp [null]
  created_at timestamp [null]
  updated_at timestamp [null]

  indexes {
    (tokenable_type, tokenable_id)
    expires_at
  }
}

Ref: rental_applications.user_id > users.id [delete: cascade]
Ref: rental_applications.room_id > rooms.id [delete: set null]
Ref: rooms.branch_id > branches.id [delete: set null]
Ref: room_facilities.room_id > rooms.id [delete: cascade]
Ref: room_images.room_id > rooms.id [delete: cascade]
Ref: payments.rental_application_id > rental_applications.id [delete: cascade]
Ref: payments.room_occupancy_id > room_occupancies.id [delete: set null]
Ref: room_occupancies.user_id > users.id [delete: cascade]
Ref: room_occupancies.room_id > rooms.id [delete: cascade]
Ref: room_occupancies.rental_application_id > rental_applications.id [delete: cascade]
Ref: lease_reminders.room_occupancy_id > room_occupancies.id [delete: cascade]
Ref: lease_reminders.user_id > users.id [delete: cascade]
Ref: expenses.branch_id > branches.id [delete: restrict]
Ref: expenses.created_by > users.id [delete: restrict]
```

Relasi logis non-FK yang dapat digambar opsional:

```text
personal_access_tokens.tokenable_id + tokenable_type -> users.id + App\Models\User
sessions.user_id -> users.id
password_reset_tokens.email -> users.email
```

# 6. ERD Chen Diagram Explanation

Entitas:
User

Atribut utama:

- Nama
- Email
- Password
- Role
- Nomor telepon
- Pekerjaan
- Alamat
- Status profil lengkap
- Status verifikasi email
- Foto profil

Berelasi dengan:

- Pengajuan Sewa
- Hunian Kamar
- Pengingat Sewa
- Pengeluaran
- Token Akses
- Session
- Token Reset Password

Penjelasan:
User adalah aktor yang menggunakan sistem. Tenant membuat pengajuan sewa, membayar sewa, dan menerima pengingat masa sewa. Owner mengelola kamar, melihat laporan, dan mencatat pengeluaran.

Entitas:
Password Reset Token

Atribut utama:

- Email
- Token
- Waktu dibuat

Berelasi dengan:

- User

Penjelasan:
Password Reset Token adalah data sementara untuk membantu user mengganti password. Relasinya menggunakan email, bukan foreign key.

Entitas:
Session

Atribut utama:

- ID session
- User ID
- IP address
- User agent
- Payload
- Aktivitas terakhir

Berelasi dengan:

- User

Penjelasan:
Session menyimpan informasi sesi login jika aplikasi memakai database session. Relasinya ke user bersifat logis karena tidak ada foreign key.

Entitas:
Cache

Atribut utama:

- Key
- Value
- Expiration

Berelasi dengan:

- Tidak ada relasi domain

Penjelasan:
Cache menyimpan data sementara agar aplikasi lebih cepat.

Entitas:
Cache Lock

Atribut utama:

- Key
- Owner
- Expiration

Berelasi dengan:

- Tidak ada relasi domain

Penjelasan:
Cache Lock membantu mencegah proses paralel menjalankan pekerjaan yang sama pada waktu bersamaan.

Entitas:
Job

Atribut utama:

- Queue
- Payload
- Attempts
- Reserved at
- Available at
- Created at

Berelasi dengan:

- Tidak ada relasi domain

Penjelasan:
Job adalah pekerjaan latar belakang yang menunggu diproses oleh worker Laravel.

Entitas:
Job Batch

Atribut utama:

- Nama batch
- Total job
- Pending job
- Failed job
- Status selesai/dibatalkan

Berelasi dengan:

- Tidak ada relasi domain

Penjelasan:
Job Batch mengelompokkan beberapa job agar bisa dipantau sebagai satu batch.

Entitas:
Failed Job

Atribut utama:

- UUID
- Connection
- Queue
- Payload
- Exception
- Failed at

Berelasi dengan:

- Tidak ada relasi domain

Penjelasan:
Failed Job menyimpan pekerjaan latar belakang yang gagal, sehingga developer dapat melakukan investigasi.

Entitas:
Room

Atribut utama:

- Nama kamar
- Harga
- Cabang
- Tipe gender
- Deskripsi
- Thumbnail
- Maksimal penghuni
- Status kamar
- Ketersediaan

Berelasi dengan:

- Cabang
- Fasilitas Kamar
- Gambar Kamar
- Pengajuan Sewa
- Hunian Kamar

Penjelasan:
Room adalah kamar kos yang ditawarkan kepada tenant. Kamar dapat memiliki fasilitas, gambar, dan histori pengajuan/hunian.

Entitas:
Personal Access Token

Atribut utama:

- Tokenable type
- Tokenable ID
- Nama token
- Token
- Abilities
- Last used at
- Expires at

Berelasi dengan:

- User

Penjelasan:
Personal Access Token adalah token API Sanctum untuk autentikasi user. Relasinya polymorphic, sehingga secara teknis bisa dipakai oleh model lain, tetapi aplikasi ini memakainya untuk User.

Entitas:
Rental Application

Atribut utama:

- User
- Kamar
- Tanggal mulai
- Durasi
- File KTP
- File KK
- Status pengajuan
- Catatan owner
- Status pembayaran
- Tanggal disetujui
- Tanggal dibayar

Berelasi dengan:

- User
- Room
- Payment
- Room Occupancy

Penjelasan:
Rental Application adalah pengajuan sewa dari tenant untuk kamar tertentu. Owner dapat menyetujui atau menolak. Jika disetujui dan dibayar, pengajuan menghasilkan hunian kamar.

Entitas:
Branch

Atribut utama:

- Nama cabang
- Kota
- Alamat
- Deskripsi

Berelasi dengan:

- Room
- Expense

Penjelasan:
Branch adalah lokasi/cabang kos. Cabang menaungi banyak kamar dan menjadi tempat pengeluaran operasional dicatat.

Entitas:
Room Facility

Atribut utama:

- Kamar
- Nama fasilitas

Berelasi dengan:

- Room

Penjelasan:
Room Facility adalah daftar fasilitas yang melekat pada satu kamar, misalnya kasur, lemari, Wi-Fi, atau kamar mandi.

Entitas:
Room Image

Atribut utama:

- Kamar
- URL gambar
- Penanda gambar utama

Berelasi dengan:

- Room

Penjelasan:
Room Image menyimpan foto-foto kamar. Satu foto dapat ditandai sebagai gambar utama.

Entitas:
Payment

Atribut utama:

- Pengajuan sewa
- Hunian kamar
- Kategori pembayaran
- Subtotal
- Diskon
- Durasi bulan
- Harga bulanan
- Periode mulai
- Periode akhir
- Order ID
- Transaction ID
- Gross amount
- Tipe pembayaran
- Status transaksi
- Snap token
- Paid at
- Settlement time

Berelasi dengan:

- Rental Application
- Room Occupancy

Penjelasan:
Payment adalah tagihan dan histori pembayaran. Ada pembayaran awal untuk masuk kamar dan pembayaran renewal untuk memperpanjang masa sewa.

Entitas:
Room Occupancy

Atribut utama:

- User
- Kamar
- Pengajuan sewa
- Tanggal mulai
- Tanggal akhir
- Status hunian

Berelasi dengan:

- User
- Room
- Rental Application
- Payment
- Lease Reminder

Penjelasan:
Room Occupancy adalah bukti bahwa tenant sedang atau pernah menempati kamar. Data ini dibuat setelah pembayaran awal berhasil.

Entitas:
Lease Reminder

Atribut utama:

- Hunian kamar
- User
- Channel
- Tipe pengingat
- Waktu terkirim

Berelasi dengan:

- Room Occupancy
- User

Penjelasan:
Lease Reminder mencatat pengingat masa sewa yang sudah dikirim agar sistem tidak mengirim pengingat yang sama berulang kali.

Entitas:
Expense

Atribut utama:

- Cabang
- Kategori
- Deskripsi
- Nominal
- Bukti pembayaran
- Tanggal pengeluaran
- Dibuat oleh
- Deleted at

Berelasi dengan:

- Branch
- User

Penjelasan:
Expense adalah pengeluaran operasional kos, misalnya perawatan, utilitas, internet, kebersihan, keamanan, perlengkapan, pajak, atau lainnya.

# 7. Relasi Bisnis End-to-End

Alur bisnis utama:

User -> Rental Application -> Payment -> Room Occupancy -> Lease Reminder -> Renewal Payment -> Occupancy Extension

Penjelasan non-teknis:

1. Tenant membuat akun sebagai User.
2. Tenant melengkapi profil dan memilih kamar.
3. Tenant membuat Rental Application dengan tanggal mulai, durasi sewa, KTP, dan KK.
4. Owner meninjau pengajuan.
5. Jika owner menyetujui, pengajuan berubah menjadi siap dibayar.
6. Tenant membuat Payment awal melalui Midtrans.
7. Jika Payment berhasil, sistem membuat Room Occupancy.
8. Kamar berubah menjadi occupied dan tidak tersedia untuk calon tenant lain.
9. Menjelang tanggal akhir sewa, sistem mengirim Lease Reminder.
10. Jika tenant ingin lanjut tinggal, tenant membuat Renewal Payment.
11. Jika Renewal Payment berhasil, tanggal akhir Room Occupancy diperpanjang.
12. Histori pembayaran dan histori hunian tetap tersimpan untuk laporan owner.

Aturan bisnis penting:

- Tenant hanya dapat mengajukan kamar yang tersedia.
- Tenant tidak boleh memiliki pengajuan aktif ganda untuk kamar yang sama.
- Kamar yang sudah memiliki pengajuan atau hunian tidak boleh dihapus melalui aplikasi.
- Pembayaran awal membuat hunian baru.
- Pembayaran renewal memperpanjang hunian yang sudah aktif.
- Pengingat sewa dikirim berdasarkan tanggal akhir hunian.

# 8. Validasi

### Foreign Key Eksplisit

| Child Table | Foreign Key | Parent Table | Delete Rule | Nullable |
| ----------- | ----------- | ------------ | ----------- | -------- |
| rental_applications | user_id | users | cascade | Tidak |
| rental_applications | room_id | rooms | set null | Ya |
| rooms | branch_id | branches | set null | Ya |
| room_facilities | room_id | rooms | cascade | Tidak |
| room_images | room_id | rooms | cascade | Tidak |
| payments | rental_application_id | rental_applications | cascade | Tidak pada fresh schema |
| payments | room_occupancy_id | room_occupancies | set null | Ya |
| room_occupancies | user_id | users | cascade | Tidak pada fresh schema |
| room_occupancies | room_id | rooms | cascade | Tidak pada fresh schema |
| room_occupancies | rental_application_id | rental_applications | cascade | Tidak pada fresh schema |
| lease_reminders | room_occupancy_id | room_occupancies | cascade | Tidak |
| lease_reminders | user_id | users | cascade | Tidak |
| expenses | branch_id | branches | restrict | Tidak |
| expenses | created_by | users | restrict | Tidak |

### Relasi Eloquent

users:

- hasMany rentalApplications
- hasMany roomOccupancies
- hasMany createdExpenses
- hasMany personal_access_tokens melalui trait Sanctum `HasApiTokens`

branches:

- hasMany rooms
- hasMany expenses

rooms:

- belongsTo branch
- hasMany facilities
- hasMany images
- hasMany rentalApplications
- hasMany roomOccupancies

room_facilities:

- belongsTo room

room_images:

- belongsTo room

rental_applications:

- belongsTo user
- belongsTo room
- hasOne payment, khusus pembayaran awal `payment_category = initial_rent`
- hasMany payments
- hasMany renewalPayments, khusus `payment_category = renewal`
- hasOne roomOccupancy

payments:

- belongsTo rentalApplication
- belongsTo roomOccupancy

room_occupancies:

- belongsTo user
- belongsTo room
- belongsTo rentalApplication
- hasMany payments
- hasMany leaseReminders

lease_reminders:

- belongsTo roomOccupancy
- belongsTo user

expenses:

- belongsTo branch
- belongsTo creator melalui `created_by -> users.id`

### Relasi Nullable

- `rooms.branch_id` nullable. Kamar lama atau kamar yang cabangnya dihapus dapat tidak memiliki cabang.
- `rental_applications.room_id` nullable. Jika kamar dihapus langsung di database, pengajuan tetap ada tetapi kehilangan kamar.
- `payments.room_occupancy_id` nullable. Pembayaran awal biasanya belum punya hunian saat dibuat; pembayaran renewal harus terkait hunian.
- `sessions.user_id` nullable dan tidak memiliki FK.
- Pada fresh schema, `payments.rental_application_id`, `room_occupancies.user_id`, `room_occupancies.room_id`, dan `room_occupancies.rental_application_id` tidak nullable. Namun migration idempoten pernah menambahkan kolom tersebut sebagai nullable jika tabel sudah ada sebelumnya, sehingga database lama perlu dicek secara manual.

### Risiko Orphan Data

- `personal_access_tokens` tidak punya FK ke users karena menggunakan polymorphic relation. Jika user dihapus langsung tanpa membersihkan token, token bisa menjadi orphan.
- `sessions.user_id` tidak punya FK. Jika user dihapus, session lama bisa tetap ada.
- `password_reset_tokens.email` tidak punya FK ke `users.email`. Token reset password bisa tersisa setelah user dihapus atau email berubah.
- `rooms.branch` adalah kolom legacy string. Nilainya bisa berbeda dari `branches.branch_name` jika cabang diubah langsung di database.
- `rental_applications.room_id` memakai `nullOnDelete`. Jika kamar dihapus di luar aturan aplikasi, histori pengajuan tetap ada tetapi detail kamar hilang.
- `payments.room_occupancy_id` memakai `nullOnDelete`. Jika hunian dihapus, pembayaran renewal kehilangan konteks hunian.
- `expenses.branch_id` dan `expenses.created_by` memakai `restrictOnDelete`, sehingga mencegah cabang/user dihapus ketika masih dipakai pengeluaran. Ini aman dari orphan, tetapi dapat memblokir operasi delete.

### Konsistensi Migration vs Model Laravel

Konsisten:

- FK `rental_applications.user_id` cocok dengan `RentalApplication::user()` dan `User::rentalApplications()`.
- FK `rental_applications.room_id` cocok dengan `RentalApplication::room()` dan `Room::rentalApplications()`.
- FK `rooms.branch_id` cocok dengan `Room::branch()` dan `Branch::rooms()`.
- FK `room_facilities.room_id` cocok dengan `RoomFacility::room()` dan `Room::facilities()`.
- FK `room_images.room_id` cocok dengan `RoomImage::room()` dan `Room::images()`.
- FK `payments.rental_application_id` cocok dengan `Payment::rentalApplication()` dan `RentalApplication::payments()`.
- FK `payments.room_occupancy_id` cocok dengan `Payment::roomOccupancy()` dan `RoomOccupancy::payments()`.
- FK `room_occupancies.user_id` cocok dengan `RoomOccupancy::user()` dan `User::roomOccupancies()`.
- FK `room_occupancies.room_id` cocok dengan `RoomOccupancy::room()` dan `Room::roomOccupancies()`.
- FK `room_occupancies.rental_application_id` cocok dengan `RoomOccupancy::rentalApplication()` dan `RentalApplication::roomOccupancy()`.
- FK `lease_reminders.room_occupancy_id` cocok dengan `LeaseReminder::roomOccupancy()` dan `RoomOccupancy::leaseReminders()`.
- FK `expenses.branch_id` cocok dengan `Expense::branch()` dan `Branch::expenses()`.
- FK `expenses.created_by` cocok dengan `Expense::creator()` dan `User::createdExpenses()`.

Perlu dicatat:

- `lease_reminders.user_id` memiliki `LeaseReminder::user()`, tetapi `User` belum mendefinisikan inverse `leaseReminders()`. Ini tidak merusak aplikasi, tetapi bisa ditambahkan jika nanti sering query pengingat dari user.
- `RentalApplication::payment()` adalah `hasOne` bersyarat untuk pembayaran awal. Secara database, `rental_applications -> payments` adalah 1:N karena ada pembayaran renewal.
- `payments.room_occupancy_id` nullable tetapi model `Payment::roomOccupancy()` tidak memakai `withDefault()`. Kode harus siap menerima `null`, dan saat ini beberapa controller memang memuat relasi ini sebagai opsional.
- `rooms.branch_id` nullable tetapi `Room::branch()` tidak memakai `withDefault()`. Formatter controller sudah menangani cabang null.
- `rooms.branch` masih ada di fillable model sebagai kolom legacy. Sumber relasi cabang yang benar adalah `branch_id`.

Kesimpulan validasi:

- Tidak ditemukan relasi FK utama yang bertentangan langsung dengan model Laravel.
- Ada beberapa relasi logis Laravel/framework tanpa FK, yaitu token, session, dan reset password. Ini normal untuk Laravel/Sanctum, tetapi perlu digambar sebagai relasi opsional/logis bila ERD ingin sangat lengkap.
- Ada risiko data lama pada migration idempoten karena beberapa kolom relasi dibuat nullable jika tabel sudah ada sebelumnya. Fresh migration menghasilkan struktur yang lebih ketat.

# 9. Diagram Readiness Checklist

- [x] Siap untuk ERD Crow's Foot
- [x] Siap untuk ERD Chen
- [x] Siap untuk Draw.io
- [x] Siap untuk Mermaid
- [x] Siap untuk dbdiagram.io
- [x] Seluruh tabel domain tercakup
- [x] Tabel framework Laravel tercakup
- [x] Relasi FK eksplisit tercakup
- [x] Relasi logis non-FK tercakup
- [x] Nullable relation dan orphan data risk dicatat

# Output Akhir

Jumlah entitas:

- 18 tabel total.
- 10 tabel domain/model aplikasi.
- 8 tabel framework pendukung.

Jumlah relasi:

- 17 relasi terdokumentasi.
- 14 relasi FK eksplisit.
- 3 relasi logis non-FK.

Daftar tabel yang benar-benar dipakai aplikasi:

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
- personal_access_tokens

Daftar tabel framework pendukung:

- password_reset_tokens
- sessions
- cache
- cache_locks
- jobs
- job_batches
- failed_jobs

Daftar tabel legacy/tidak terpakai:

- Tidak ditemukan tabel domain legacy/tidak terpakai.
- Legacy yang ditemukan adalah kolom `rooms.branch`, bukan tabel.

Ringkasan sederhana:

Database KosHandayani berpusat pada user, cabang, kamar, pengajuan sewa, pembayaran, dan hunian. Tenant membuat pengajuan untuk kamar tertentu. Owner menyetujui pengajuan. Setelah tenant membayar, sistem membuat data hunian dan menandai kamar sebagai ditempati. Menjelang akhir masa sewa, sistem mengirim pengingat. Jika tenant membayar perpanjangan, tanggal akhir hunian diperpanjang. Owner juga dapat mencatat pengeluaran per cabang untuk laporan operasional.
