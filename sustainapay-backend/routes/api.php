<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CarbonImpactController;
use App\Http\Controllers\QrController; 
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminController;

// ==========================================
// PUBLIC ROUTES (Bisa diakses tanpa login)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// RUTE TOPUP MENGGUNAKAN MIDTRANS
Route::post('/transactions/topup', [TransactionController::class, 'topup']);

// ---> CALLBACK MIDTRANS (WAJIB PUBLIC & TIDAK BOLEH ADA DUPLIKAT) <---
Route::post('/midtrans-callback', [PaymentController::class, 'callback']);

Route::get('/statistics', [DashboardController::class, 'globalStatistics']);


// ==========================================
// RUTE ADMIN (SEMENTARA PUBLIC UNTUK TESTING UI)
// ==========================================
Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
Route::get('/admin/users', [AdminController::class, 'users']);
Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
Route::post('/admin/users/{id}/points', [AdminController::class, 'updatePoints']);

Route::get('/admin/vouchers', [AdminController::class, 'vouchers']);
Route::post('/admin/vouchers', [AdminController::class, 'storeVoucher']);
Route::put('/admin/vouchers/{id}', [AdminController::class, 'updateVoucher']);
Route::delete('/admin/vouchers/{id}', [AdminController::class, 'deleteVoucher']);


// ==========================================
// PROTECTED ROUTES (Harus login & pakai token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile (Mendapatkan Data & Saldo Asli)
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        
        // Calculate real carbon saved from CarbonRecord
        $carbonSavedKg = \App\Models\CarbonRecord::where('user_id', $user->id)->sum('calculated_carbon_kg');
        
        // Mock Impact Rank calculation based on carbon saved
        $rank = 'Top 50%';
        if ($carbonSavedKg > 50) $rank = 'Top 10%';
        else if ($carbonSavedKg > 20) $rank = 'Top 25%';
        else if ($carbonSavedKg > 0) $rank = 'Top 40%';

        return response()->json([
            'success' => true,
            'user' => $user,
            'balance' => $user->wallet_balance ?? 0,
            'points' => $user->reward_points ?? 0,
            'carbonSaved' => round($carbonSavedKg, 2),
            'impactRank' => $rank
        ]);
    });

    // Update Profile
    Route::post('/user/update', function (Request $request) {
        $user = $request->user();
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'location' => 'nullable|string',
            'avatar' => 'nullable|string'
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->has('location')) {
            $user->location = $request->location;
        }
        if ($request->has('avatar') && !empty($request->avatar)) {
            $user->avatar = $request->avatar;
        }
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully!',
            'user' => $user
        ]);
    });

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Dashboard & Carbon Impact
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/carbon-impact', [CarbonImpactController::class, 'index']);
    
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

    // Rewards
    Route::get('/rewards', [\App\Http\Controllers\RewardController::class, 'index']);
    Route::post('/rewards/redeem', [\App\Http\Controllers\RewardController::class, 'redeem']);

});