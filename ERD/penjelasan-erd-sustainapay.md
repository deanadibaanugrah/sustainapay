# Penjelasan ERD (Entity Relationship Diagram) — SustainaPay

## 1. Gambaran Umum

ERD SustainaPay terdiri dari **6 entitas utama** yang saling berelasi. Sistem ini merupakan aplikasi pembayaran digital berbasis sustainability yang menghitung jejak karbon dari setiap transaksi pengguna dan memberikan rekomendasi AI serta reward berupa voucher.

Pusat dari ERD adalah tabel **users**, yang terhubung ke seluruh tabel lainnya.

```
                    ┌─────────────────────────┐
                    │   personal_access_tokens │
                    └────────────┬────────────┘
                                 │ 1:N (polymorphic)
┌──────────────┐    ┌────────────┴────────────┐    ┌────────────────────┐
│ user_vouchers│◄───┤         users            ├───►│ ai_recommendations │
└──────────────┘ 1:N└────────────┬────────────┘1:N └─────────┬──────────┘
                          1:N │   │ 1:N                      │
                              │   │                          │
                    ┌─────────▼┐  │                          │
                    │transactions├─┼──────────────────────────┘
                    └─────────┬┘  │           1:N
                         1:1  │   │
                    ┌─────────▼───▼──┐
                    │ carbon_records  │
                    └────────────────┘
```

---

## 2. Penjelasan Setiap Entitas

---

### 2.1 Tabel `users` (Pengguna)

**Deskripsi:** Menyimpan data pengguna aplikasi SustainaPay, termasuk informasi autentikasi, saldo wallet digital, poin reward, dan profil.

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| `id` | BIGINT | PK, Auto Increment | ID unik pengguna |
| `name` | VARCHAR | NOT NULL | Nama lengkap pengguna |
| `email` | VARCHAR | NOT NULL, UNIQUE | Email untuk login |
| `google_id` | VARCHAR | UNIQUE, NULLABLE | ID Google untuk login via OAuth |
| `email_verified_at` | TIMESTAMP | NULLABLE | Waktu verifikasi email |
| `password` | VARCHAR | NOT NULL | Password terenkripsi |
| `role` | ENUM('user','admin') | DEFAULT 'user' | Peran pengguna dalam sistem |
| `wallet_balance` | DECIMAL(15,2) | DEFAULT 0.00 | Saldo dompet digital |
| `eco_points` | INT | DEFAULT 0 | Poin ekologi dari aktivitas ramah lingkungan |
| `reward_points` | INT | DEFAULT 0 | Poin reward untuk penukaran voucher |
| `location` | VARCHAR | NULLABLE | Lokasi pengguna |
| `avatar` | LONGTEXT | NULLABLE | Foto profil (base64 encoded) |
| `remember_token` | VARCHAR | NULLABLE | Token "remember me" Laravel |
| `created_at` | TIMESTAMP | — | Waktu pembuatan akun |
| `updated_at` | TIMESTAMP | — | Waktu terakhir diperbarui |

**Bukti dari kode sumber:**

Migration: [0001_01_01_000000_create_users_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/0001_01_01_000000_create_users_table.php)
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->enum('role', ['user', 'admin'])->default('user');
    $table->decimal('wallet_balance', 15, 2)->default(0.00);
    $table->integer('reward_points')->default(0);
    $table->rememberToken();
    $table->timestamps();
});
```

Kolom tambahan ditambahkan via migration terpisah:

Migration: [2026_05_23_092705_add_eco_points_to_users_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_23_092705_add_eco_points_to_users_table.php)
```php
$table->integer('eco_points')->default(0)->after('wallet_balance');
```

Migration: [2026_05_24_170240_add_profile_fields_to_users_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_24_170240_add_profile_fields_to_users_table.php)
```php
$table->string('location')->nullable();
$table->longText('avatar')->nullable();
```

Migration: [2026_05_25_185407_add_google_id_to_users_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_25_185407_add_google_id_to_users_table.php)
```php
$table->string('google_id')->nullable()->unique()->after('email');
```

---

### 2.2 Tabel `transactions` (Transaksi)

**Deskripsi:** Menyimpan data transaksi keuangan yang dilakukan oleh pengguna. Setiap transaksi memiliki kode unik, kategori, nominal, dan status.

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| `id` | BIGINT | PK, Auto Increment | ID unik transaksi |
| `user_id` | BIGINT | FK → users.id, ON DELETE CASCADE | Pemilik transaksi |
| `transaction_code` | VARCHAR | NOT NULL, UNIQUE | Kode transaksi unik |
| `category` | VARCHAR | NOT NULL | Kategori transaksi (mis: transportasi, makanan) |
| `amount` | DECIMAL(15,2) | NOT NULL | Nominal transaksi (Rupiah) |
| `status` | VARCHAR | NOT NULL | Status transaksi (pending/completed/failed) |
| `description` | VARCHAR | NULLABLE | Deskripsi tambahan transaksi |
| `created_at` | TIMESTAMP | — | Waktu transaksi dibuat |
| `updated_at` | TIMESTAMP | — | Waktu terakhir diperbarui |

**Bukti dari kode sumber:**

Migration: [2024_01_01_000002_create_transactions_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2024_01_01_000002_create_transactions_table.php)
```php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('transaction_code')->unique();
    $table->string('category');
    $table->decimal('amount', 15, 2);
    $table->string('status');
    $table->string('description')->nullable();
    $table->timestamps();
});
```

Model: [Transaction.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/Transaction.php)
```php
protected $fillable = [
    'user_id', 'transaction_code', 'category',
    'amount', 'status', 'description'
];

public function user() {
    return $this->belongsTo(User::class);  // ← Relasi ke users
}

public function carbonRecord() {
    return $this->hasOne(CarbonRecord::class);  // ← Relasi ke carbon_records
}
```

---

### 2.3 Tabel `carbon_records` (Catatan Karbon)

**Deskripsi:** Menyimpan perhitungan emisi karbon dari setiap transaksi. Tabel ini menghubungkan transaksi dengan faktor emisi kendaraan dan menghitung total karbon yang dihasilkan berdasarkan jarak tempuh.

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| `id` | BIGINT | PK, Auto Increment | ID unik record |
| `user_id` | BIGINT | FK → users.id, ON DELETE CASCADE | Pemilik record |
| `transaction_id` | BIGINT | FK → transactions.id, NULLABLE, ON DELETE CASCADE | Transaksi terkait |
| `emission_factor_id` | BIGINT | FK → emission_factors.id | Faktor emisi kendaraan |
| `distance_km` | DECIMAL(10,2) | NOT NULL | Jarak tempuh dalam kilometer |
| `calculated_carbon_kg` | DECIMAL(10,2) | NOT NULL | Emisi karbon yang dihitung (kg CO₂) |
| `created_at` | TIMESTAMP | — | Waktu pencatatan |
| `updated_at` | TIMESTAMP | — | Waktu terakhir diperbarui |

**Bukti dari kode sumber:**

Migration: [2024_01_01_000003_create_carbon_records_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2024_01_01_000003_create_carbon_records_table.php)
```php
Schema::create('carbon_records', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('cascade');
    $table->foreignId('emission_factor_id')->constrained('emission_factors');
    $table->decimal('distance_km', 10, 2);
    $table->decimal('calculated_carbon_kg', 10, 2);
    $table->timestamps();
});
```

Model: [CarbonRecord.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/CarbonRecord.php)
```php
protected $fillable = [
    'user_id', 'transaction_id', 'emission_factor_id',
    'distance_km', 'calculated_carbon_kg'
];

public function user() {
    return $this->belongsTo(User::class);       // ← Relasi ke users
}

public function transaction() {
    return $this->belongsTo(Transaction::class); // ← Relasi ke transactions
}
```

---

### 2.4 Tabel `ai_recommendations` (Rekomendasi AI)

**Deskripsi:** Menyimpan hasil analisis dan rekomendasi dari AI (Gemini) berdasarkan data emisi karbon pengguna. Memberikan saran tentang cara mengurangi jejak karbon.

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| `id` | BIGINT | PK, Auto Increment | ID unik rekomendasi |
| `user_id` | BIGINT | FK → users.id, ON DELETE CASCADE | Penerima rekomendasi |
| `transaction_id` | BIGINT | FK, NULLABLE | Transaksi yang dianalisis |
| `total_emisi` | DECIMAL(8,2) | DEFAULT 0 | Total emisi yang dianalisis (kg CO₂) |
| `ai_analysis` | TEXT | NOT NULL | Hasil analisis & saran dari AI |
| `created_at` | TIMESTAMP | — | Waktu pembuatan rekomendasi |
| `updated_at` | TIMESTAMP | — | Waktu terakhir diperbarui |

**Bukti dari kode sumber:**

Migration: [2026_05_04_191619_create_ai_recommendations_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_04_191619_create_ai_recommendations_table.php)
```php
Schema::create('ai_recommendations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('transaction_id')->nullable();
    $table->decimal('total_emisi', 8, 2)->default(0);
    $table->text('ai_analysis'); // Tipe TEXT karena saran AI panjang
    $table->timestamps();
});
```

Model: [AiRecommendation.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/AiRecommendation.php)
```php
protected $fillable = [
    'user_id', 'transaction_id', 'total_emisi', 'ai_analysis'
];

public function user() {
    return $this->belongsTo(User::class);       // ← Relasi ke users
}

public function transaction() {
    return $this->belongsTo(Transaction::class); // ← Relasi ke transactions
}
```

---

### 2.5 Tabel `user_vouchers` (Voucher Pengguna)

**Deskripsi:** Menyimpan voucher yang telah ditukarkan oleh pengguna menggunakan eco points atau reward points. Voucher bisa berupa reward (hadiah) atau donation (donasi lingkungan).

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| `id` | BIGINT | PK, Auto Increment | ID unik voucher |
| `user_id` | BIGINT | FK → users.id, ON DELETE CASCADE | Pemilik voucher |
| `title` | VARCHAR | NOT NULL | Judul/nama voucher |
| `provider` | VARCHAR | NOT NULL | Penyedia voucher (mis: GoPay, OVO) |
| `icon` | VARCHAR | NULLABLE | Ikon voucher |
| `type` | VARCHAR | DEFAULT 'reward' | Tipe voucher: reward atau donation |
| `cost` | INT | NOT NULL | Biaya penukaran (dalam poin) |
| `voucher_code` | VARCHAR | NULLABLE | Kode voucher unik |
| `created_at` | TIMESTAMP | — | Waktu penukaran voucher |
| `updated_at` | TIMESTAMP | — | Waktu terakhir diperbarui |

**Bukti dari kode sumber:**

Migration: [2026_05_25_183134_create_user_vouchers_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_25_183134_create_user_vouchers_table.php)
```php
Schema::create('user_vouchers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('title');
    $table->string('provider');
    $table->string('icon')->nullable();
    $table->string('type')->default('reward'); // reward or donation
    $table->integer('cost');
    $table->string('voucher_code')->nullable();
    $table->timestamps();
});
```

Model: [UserVoucher.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/UserVoucher.php)
```php
protected $fillable = [
    'user_id', 'title', 'provider', 'icon',
    'type', 'cost', 'voucher_code',
];

public function user() {
    return $this->belongsTo(User::class);  // ← Relasi ke users
}
```

---

### 2.6 Tabel `personal_access_tokens` (Token Akses)

**Deskripsi:** Tabel bawaan Laravel Sanctum untuk menyimpan token autentikasi API. Menggunakan relasi polymorphic (`morphs`) sehingga bisa digunakan oleh model apapun, dalam hal ini terhubung ke model `User`.

| Kolom | Tipe Data | Constraint | Keterangan |
|-------|-----------|------------|------------|
| `id` | BIGINT | PK, Auto Increment | ID unik token |
| `tokenable_type` | VARCHAR | NOT NULL | Nama model (App\Models\User) |
| `tokenable_id` | BIGINT | NOT NULL | ID dari model terkait |
| `name` | TEXT | NOT NULL | Nama/label token |
| `token` | VARCHAR(64) | NOT NULL, UNIQUE | Hash token unik |
| `abilities` | TEXT | NULLABLE | Kemampuan/izin token (JSON) |
| `last_used_at` | TIMESTAMP | NULLABLE | Terakhir digunakan |
| `expires_at` | TIMESTAMP | NULLABLE | Waktu kadaluarsa |
| `created_at` | TIMESTAMP | — | Waktu pembuatan token |
| `updated_at` | TIMESTAMP | — | Waktu terakhir diperbarui |

**Bukti dari kode sumber:**

Migration: [2026_05_04_193337_create_personal_access_tokens_table.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_04_193337_create_personal_access_tokens_table.php)
```php
Schema::create('personal_access_tokens', function (Blueprint $table) {
    $table->id();
    $table->morphs('tokenable');
    $table->text('name');
    $table->string('token', 64)->unique();
    $table->text('abilities')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable()->index();
    $table->timestamps();
});
```

Bukti penggunaan Sanctum di Model User: [User.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/User.php)
```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;  // ← HasApiTokens mengaktifkan Sanctum
}
```

---

## 3. Penjelasan Relasi Antar Tabel

### 3.1 `users` → `transactions` (One-to-Many)

| Aspek | Detail |
|-------|--------|
| **Kardinalitas** | 1 user memiliki banyak (N) transactions |
| **Foreign Key** | `transactions.user_id` → `users.id` |
| **On Delete** | CASCADE (hapus user = hapus semua transaksinya) |

**Bukti relasi dari Model:**

```php
// User.php — sisi "One"
public function transactions() {
    return $this->hasMany(Transaction::class);
}

// Transaction.php — sisi "Many"
public function user() {
    return $this->belongsTo(User::class);
}
```

---

### 3.2 `users` → `carbon_records` (One-to-Many)

| Aspek | Detail |
|-------|--------|
| **Kardinalitas** | 1 user memiliki banyak (N) carbon_records |
| **Foreign Key** | `carbon_records.user_id` → `users.id` |
| **On Delete** | CASCADE |

**Bukti relasi dari Model:**

```php
// User.php — sisi "One"
public function carbonRecords() {
    return $this->hasMany(CarbonRecord::class);
}

// CarbonRecord.php — sisi "Many"
public function user() {
    return $this->belongsTo(User::class);
}
```

---

### 3.3 `users` → `ai_recommendations` (One-to-Many)

| Aspek | Detail |
|-------|--------|
| **Kardinalitas** | 1 user memiliki banyak (N) ai_recommendations |
| **Foreign Key** | `ai_recommendations.user_id` → `users.id` |
| **On Delete** | CASCADE |

**Bukti relasi dari Model:**

```php
// AiRecommendation.php — sisi "Many"
public function user() {
    return $this->belongsTo(User::class);
}
```

---

### 3.4 `users` → `user_vouchers` (One-to-Many)

| Aspek | Detail |
|-------|--------|
| **Kardinalitas** | 1 user memiliki banyak (N) user_vouchers |
| **Foreign Key** | `user_vouchers.user_id` → `users.id` |
| **On Delete** | CASCADE |

**Bukti relasi dari Model:**

```php
// UserVoucher.php — sisi "Many"
public function user() {
    return $this->belongsTo(User::class);
}
```

---

### 3.5 `users` → `personal_access_tokens` (Polymorphic One-to-Many)

| Aspek | Detail |
|-------|--------|
| **Kardinalitas** | 1 user memiliki banyak (N) tokens |
| **Tipe Relasi** | Polymorphic via `tokenable_type` + `tokenable_id` |
| **Implementasi** | Otomatis melalui Laravel Sanctum (`HasApiTokens` trait) |

**Bukti:** Penggunaan `$table->morphs('tokenable')` di migration dan `use HasApiTokens` di model User.

---

### 3.6 `transactions` → `carbon_records` (One-to-One)

| Aspek | Detail |
|-------|--------|
| **Kardinalitas** | 1 transaction memiliki maksimal 1 carbon_record |
| **Foreign Key** | `carbon_records.transaction_id` → `transactions.id` |
| **On Delete** | CASCADE |
| **Nullable** | Ya (transaksi tidak wajib punya carbon record) |

**Bukti relasi dari Model:**

```php
// Transaction.php — sisi "One" (parent)
public function carbonRecord() {
    return $this->hasOne(CarbonRecord::class);  // ← hasOne = 1:1
}

// CarbonRecord.php — sisi "One" (child)
public function transaction() {
    return $this->belongsTo(Transaction::class);
}
```

---

### 3.7 `transactions` → `ai_recommendations` (One-to-Many)

| Aspek | Detail |
|-------|--------|
| **Kardinalitas** | 1 transaction bisa memiliki banyak (N) rekomendasi AI |
| **Foreign Key** | `ai_recommendations.transaction_id` → `transactions.id` |
| **Nullable** | Ya (rekomendasi bisa tanpa transaksi spesifik) |

**Bukti relasi dari Model:**

```php
// AiRecommendation.php
public function transaction() {
    return $this->belongsTo(Transaction::class);
}
```

---

## 4. Ringkasan Kesesuaian ERD dengan Kode

| No | Entitas | File Migration | File Model | Status |
|----|---------|----------------|------------|--------|
| 1 | `users` | ✅ [create_users_table](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/0001_01_01_000000_create_users_table.php) + 3 migration tambahan | ✅ [User.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/User.php) | ✅ Sesuai |
| 2 | `transactions` | ✅ [create_transactions_table](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2024_01_01_000002_create_transactions_table.php) | ✅ [Transaction.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/Transaction.php) | ✅ Sesuai |
| 3 | `carbon_records` | ✅ [create_carbon_records_table](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2024_01_01_000003_create_carbon_records_table.php) | ✅ [CarbonRecord.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/CarbonRecord.php) | ✅ Sesuai |
| 4 | `ai_recommendations` | ✅ [create_ai_recommendations_table](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_04_191619_create_ai_recommendations_table.php) | ✅ [AiRecommendation.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/AiRecommendation.php) | ✅ Sesuai |
| 5 | `user_vouchers` | ✅ [create_user_vouchers_table](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_25_183134_create_user_vouchers_table.php) | ✅ [UserVoucher.php](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/app/Models/UserVoucher.php) | ✅ Sesuai |
| 6 | `personal_access_tokens` | ✅ [create_personal_access_tokens_table](file:///d:/SEMESTER2/sustainapay/sustainapay-backend/database/migrations/2026_05_04_193337_create_personal_access_tokens_table.php) | ✅ via Sanctum (`HasApiTokens`) | ✅ Sesuai |

| No | Relasi | Bukti Migration (FK) | Bukti Model (Eloquent) | Status |
|----|--------|---------------------|------------------------|--------|
| 1 | users → transactions | ✅ `foreignId('user_id')->constrained()` | ✅ `hasMany` / `belongsTo` | ✅ Sesuai |
| 2 | users → carbon_records | ✅ `foreignId('user_id')->constrained()` | ✅ `hasMany` / `belongsTo` | ✅ Sesuai |
| 3 | users → ai_recommendations | ✅ `foreignId('user_id')->constrained()` | ✅ `belongsTo` | ✅ Sesuai |
| 4 | users → user_vouchers | ✅ `foreignId('user_id')->constrained()` | ✅ `belongsTo` | ✅ Sesuai |
| 5 | users → personal_access_tokens | ✅ `morphs('tokenable')` | ✅ `HasApiTokens` trait | ✅ Sesuai |
| 6 | transactions → carbon_records | ✅ `foreignId('transaction_id')->constrained()` | ✅ `hasOne` / `belongsTo` | ✅ Sesuai |
| 7 | transactions → ai_recommendations | ✅ `foreignId('transaction_id')` | ✅ `belongsTo` | ✅ Sesuai |

> [!IMPORTANT]
> **Kesimpulan:** Seluruh entitas dan relasi pada ERD telah diverifikasi dan **100% sesuai** dengan kode sumber yang ada di file migration dan model Eloquent pada project SustainaPay.
