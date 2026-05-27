<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Transaction;
use App\Models\CarbonRecord;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // WAJIB untuk Enkripsi Password Baru
use Carbon\Carbon;

class AdminController extends Controller
{
    // Mengambil data ASLI untuk halaman Dashboard / Overview
    public function dashboard()
    {
        // 1. Total Users
        $totalUsers = User::count();
        
        // 2. Transaksi Aktif (Status Pending)
        try {
            $activeTransactions = Transaction::where('status', 'Pending')->count();
        } catch (\Exception $e) {
            $activeTransactions = 0;
        }

        // 3. Emisi Karbon & AI Requests
        try {
            // Hitung total emisi (dibagi 1000 untuk konversi ke Ton)
            $totalCarbon = CarbonRecord::sum('calculated_carbon_kg') / 1000; 
            
            // Menggunakan jumlah scan CarbonRecord sebagai ganti ai_requests
            $aiRequests = CarbonRecord::count(); 
        } catch (\Exception $e) {
            $totalCarbon = 0;
            $aiRequests = 0;
        }

        // 4. Data Chart (Emisi 6 Bulan Terakhir secara Dinamis)
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            
            try {
                $monthlyEmissions = CarbonRecord::whereYear('created_at', $month->year)
                                    ->whereMonth('created_at', $month->month)
                                    ->sum('calculated_carbon_kg');
            } catch (\Exception $e) {
                $monthlyEmissions = 0; // Jika error tabel, beri nilai 0
            }

            $chartData[] = [
                'name' => $month->format('M'), // Contoh: 'Jan', 'Feb'
                'emissions' => round($monthlyEmissions, 2)
            ];
        }

        // 5. Recent Activity (Ambil 5 transaksi terakhir dari semua user)
        try {
            $recentTransactions = Transaction::with('user')
                                    ->orderBy('created_at', 'desc')
                                    ->take(5)
                                    ->get();

            $recentActivity = $recentTransactions->map(function($trx) {
                return [
                    'id' => $trx->id,
                    'user' => $trx->user ? $trx->user->name : 'Unknown User',
                    'action' => $trx->category . ' (' . ($trx->description ?? 'No desc') . ')',
                    'date' => $trx->created_at->format('Y-m-d H:i:s'),
                    'status' => $trx->status
                ];
            });
        } catch (\Exception $e) {
            $recentActivity = [];
        }

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_carbon_tons' => number_format($totalCarbon, 2),
                'active_transactions' => $activeTransactions,
                'ai_requests' => $aiRequests
            ],
            'chart_data' => $chartData,
            'recent_activity' => $recentActivity
        ]);
    }

    // Mengambil data ASLI & LENGKAP untuk halaman Manage Users
    public function users()
    {
        try {
            // Ambil semua user, urutkan dari yang terbaru daftar
            $users = User::orderBy('created_at', 'desc')->get()->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'password' => $user->password, // Password hash untuk tampilan admin
                    'balance' => $user->wallet_balance ?? 0, // SUDAH DISESUAIKAN DENGAN DATABASE
                    'role' => $user->role ?? 'User',  // Menampilkan role (Admin/User)
                    'status' => 'Active', 
                    'joined_date' => $user->created_at->format('Y-m-d H:i')
                ];
            });

            return response()->json(['users' => $users]);
        } catch (\Exception $e) {
            return response()->json(['users' => []]);
        }
    }

    // FUNGSI BARU: Untuk Mengedit / Update Data User
    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            // Update data basic
            $user->name = $request->name;
            $user->email = $request->email;
            
            // Update role jika dikirim dari frontend
            if ($request->has('role')) {
                $user->role = $request->role;
            }

            // Update password HANYA jika field password diisi (tidak kosong)
            if ($request->filled('password')) {
                $user->password = $request->password; // Disimpan plain text
            }

            $user->save();

            return response()->json([
                'message' => 'Data pengguna berhasil diubah!',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengubah data pengguna', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // FUNGSI BARU: Untuk Menghapus Data User
    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'message' => 'Data pengguna berhasil dihapus!'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus data pengguna', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // FUNGSI CRUD VOUCHERS / REWARDS
    // ==========================================
    
    public function vouchers()
    {
        try {
            $vouchers = Voucher::orderBy('created_at', 'desc')->get();
            return response()->json(['vouchers' => $vouchers]);
        } catch (\Exception $e) {
            return response()->json(['vouchers' => [], 'error' => $e->getMessage()], 500);
        }
    }

    public function storeVoucher(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'provider' => 'required|string',
            'type' => 'required|in:reward,donation',
            'cost' => 'required|integer|min:1',
            'tier_required' => 'required|string'
        ]);

        try {
            $voucher = Voucher::create($request->all());
            return response()->json([
                'message' => 'Voucher berhasil ditambahkan!',
                'voucher' => $voucher
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menambah voucher', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateVoucher(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'provider' => 'required|string',
            'type' => 'required|in:reward,donation',
            'cost' => 'required|integer|min:1',
            'tier_required' => 'required|string'
        ]);

        try {
            $voucher = Voucher::findOrFail($id);
            $voucher->update($request->all());
            return response()->json([
                'message' => 'Voucher berhasil diubah!',
                'voucher' => $voucher
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengubah voucher', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteVoucher($id)
    {
        try {
            $voucher = Voucher::findOrFail($id);
            $voucher->delete();
            return response()->json([
                'message' => 'Voucher berhasil dihapus!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus voucher', 
                'error' => $e->getMessage()
            ], 500);
        }
    }
}