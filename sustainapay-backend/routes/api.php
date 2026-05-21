<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\QrController; 
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminController;

// ==========================================
// PUBLIC ROUTES (Bisa diakses tanpa login)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// RUTE TOPUP MENGGUNAKAN MIDTRANS
Route::post('/transactions/topup', [TransactionController::class, 'topup']);

// ---> CALLBACK MIDTRANS (WAJIB PUBLIC & TIDAK BOLEH ADA DUPLIKAT) <---
Route::post('/midtrans-callback', [PaymentController::class, 'callback']);

// ==========================================
// RUTE ADMIN (SEMENTARA PUBLIC UNTUK TESTING UI)
// ==========================================
Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
Route::get('/admin/users', [AdminController::class, 'users']);
Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);


// ==========================================
// PROTECTED ROUTES (Harus login & pakai token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile (Mendapatkan Data & Saldo Asli)
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'user' => $request->user(),
            // Mengambil saldo dari kolom wallet_balance di database
            'balance' => $request->user()->wallet_balance ?? 0 
        ]);
    });

    // Update Profile
    Route::post('/user/update', function (Request $request) {
        $user = $request->user();
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'user' => $user
        ]);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Summary & History
    Route::get('/summary', [TransactionController::class, 'summary']);
    Route::get('/transactions/history', [TransactionController::class, 'history']);
    
    // Wallet Operations & Payments (Mendukung data AI tambahan di body)
    Route::post('/transactions/transfer', [TransactionController::class, 'transfer']);
    Route::post('/transactions/payment', [TransactionController::class, 'processPayment']);
    
    // TOPUP DIRECT (LANGSUNG NAMBAH SALDO TANPA MIDTRANS UNTUK UI REACT)
    Route::post('/transactions/direct-topup', [TransactionController::class, 'directTopup']);
    
    // QR Processing
    Route::post('/process-qr', [QrController::class, 'processQr']); 
    
    // AI Recommendations History & Endpoint
    Route::get('/ai/recommendations', [AiController::class, 'index']);
    Route::post('/ai/recommendations/generate', [AiController::class, 'generate']);
});