# To do list by SustainaPay:

## 1. Overview:
SustainaPay adalah platform web e-wallet berbasis sustainability yang tidak hanya berfungsi sebagai alat transaksi digital, tetapi juga memiliki fitur perhitungan jejak karbon (carbon footprint) dari setiap transaksi pengguna. Tujuan utama platform ini adalah meningkatkan kesadaran pengguna terhadap dampak lingkungan yang dihasilkan dari aktivitas sehari-hari, khususnya penggunaan transportasi. Data emisi karbon yang digunakan didasarkan pada perhitungan dari sumber terpercaya yaitu Jejakin. Selain itu, pengguna dapat memperoleh eco-points dari aktivitas ramah lingkungan yang dapat ditukarkan dengan voucher reward maupun donasi penanaman pohon. Platform ini juga terintegrasi dengan AI (Gemini) untuk memberikan rekomendasi personal dalam mengurangi jejak karbon, serta menggunakan Midtrans sebagai payment gateway untuk top-up saldo wallet.

## 2. Provide page informasi:

### a. User:
- **Landing Page** (`/`) — Halaman utama yang menampilkan informasi tentang SustainaPay, fitur "Apa Itu SustainaPay" dan "Cara Kerja" dengan accordion interaktif, statistik pengguna, serta tombol navigasi ke login/dashboard. Mendukung dua bahasa (Indonesia & English).
- **Login** (`/login`) — Halaman login pengguna menggunakan email & password, serta opsi login via Google OAuth.
- **Register** (`/register`) — Halaman pendaftaran akun baru dengan input nama, email, dan password.
- **Dashboard / Beranda** (`/dashboard`) — Halaman utama setelah login yang menampilkan ringkasan saldo wallet, eco points, reward points, grafik emisi karbon, riwayat transaksi terbaru, dan statistik aktivitas pengguna.
- **Transactions** (`/transactions`) — Halaman untuk membuat transaksi baru (termasuk memilih kategori transportasi, memasukkan jarak tempuh, dan menghitung emisi karbon), melihat riwayat transaksi, serta fitur top-up saldo wallet via Midtrans payment gateway.
- **Carbon Impact** (`/carbon-impact`) — Halaman monitoring jejak karbon pengguna secara detail, menampilkan grafik emisi, riwayat perhitungan karbon, dan perbandingan emisi per kategori transportasi.
- **AI Recommendations** (`/recommendations`) — Halaman rekomendasi AI (Gemini) yang memberikan analisis dan saran personal berdasarkan data emisi karbon pengguna untuk membantu mengurangi jejak karbon.
- **Rewards** (`/rewards`) — Halaman penukaran eco points dengan voucher reward (seperti GoPay, OVO) atau donasi lingkungan (penanaman pohon). Menampilkan katalog voucher yang tersedia dan riwayat voucher yang sudah ditukarkan.
- **Profile** (`/profile`) — Halaman profil pengguna untuk melihat dan mengedit informasi akun (nama, email, lokasi, foto profil/avatar), serta menampilkan statistik ringkasan akun.

### b. Admin:
- **Admin Dashboard / Overview** (`/admin` → tab Overview) — Halaman overview untuk admin yang menampilkan statistik keseluruhan sistem: total users, total emisi karbon, transaksi aktif, jumlah AI requests, grafik tren emisi 6 bulan terakhir (chart), dan daftar recent activity (5 transaksi terakhir dari semua user).
- **Manage Users** (`/admin` → tab Manage Users) — Halaman CRUD manajemen pengguna:
  - **Read**: Menampilkan tabel daftar semua pengguna dengan informasi ID, nama, email, password (hash), wallet balance, dan role.
  - **Update**: Modal edit untuk mengubah nama, email, password, dan role pengguna.
  - **Delete**: Modal konfirmasi untuk menghapus pengguna beserta seluruh data terkait (cascade delete).

## 3. Provide detail informasi struggle terkait:

### a. Integrasi Perhitungan Emisi Karbon
Salah satu tantangan utama adalah mengintegrasikan perhitungan emisi karbon yang akurat ke dalam setiap transaksi. Harus menentukan emission factor yang tepat berdasarkan data dari Jejakin untuk berbagai jenis kendaraan/transportasi, serta memastikan tabel `emission_factors` terisi dengan data yang valid. Migration untuk tabel `emission_factors` sempat tidak tersedia di repository sehingga harus ditangani secara manual.

### b. Integrasi AI (Gemini) untuk Rekomendasi
Mengintegrasikan API Gemini AI untuk menghasilkan rekomendasi yang relevan dan personal berdasarkan data emisi pengguna. Tantangannya termasuk mengelola prompt engineering agar hasil analisis AI meaningful, menangani rate limiting API, dan menyimpan hasil rekomendasi agar tidak perlu memanggil API berulang kali untuk data yang sama.

### c. Integrasi Payment Gateway (Midtrans)
Mengimplementasikan Midtrans Snap sebagai payment gateway untuk fitur top-up saldo wallet. Tantangan meliputi konfigurasi environment sandbox vs production, handling callback/webhook dari Midtrans, serta memastikan sinkronisasi status pembayaran antara Midtrans dan database internal SustainaPay.

### d. Autentikasi Multi-Method (Email + Google OAuth)
Implementasi sistem login yang mendukung dua metode (email/password konvensional dan Google OAuth) memerlukan penanganan khusus. Harus menambahkan kolom `google_id` di tabel users dan menangani skenario dimana user sudah terdaftar via email kemudian mencoba login via Google (atau sebaliknya), serta memastikan token Sanctum bekerja konsisten untuk kedua metode autentikasi.

### e. Sistem Eco Points dan Reward Voucher
Mendesain mekanisme perolehan eco points yang adil berdasarkan pengurangan emisi karbon, serta membangun sistem penukaran voucher yang reliable. Tantangannya termasuk menghitung kapan dan berapa banyak eco points yang diberikan, validasi bahwa pengguna memiliki cukup poin sebelum penukaran, dan generate kode voucher yang unik.

### f. Multi-Language Support (Indonesia & English)
Mengimplementasikan dukungan dua bahasa di seluruh halaman frontend menggunakan Context API React. Tantangannya adalah memastikan semua teks di setiap komponen dan halaman memiliki terjemahan yang konsisten, serta menjaga state bahasa tetap sinkron di seluruh aplikasi.
