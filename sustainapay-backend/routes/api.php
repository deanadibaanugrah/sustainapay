<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import Controller yang akan kita buat
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\CarbonController;
use App\Http\Controllers\API\AiController;

// ==========================================
// ENDPOINT PUBLIC (Tidak Perlu Login)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// ==========================================
// ENDPOINT PROTECTED (Wajib Login/Token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    // Endpoint AI Recommendations
    Route::get('/ai/recommendations', [AiController::class, 'index']);
    Route::post('/ai/recommendations/generate', [AiController::class, 'generate']);
    // Endpoint bawaan Laravel untuk mengambil data user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Endpoint Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Endpoint E-Wallet & Riwayat Transaksi
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions/topup', [TransactionController::class, 'topup']);
    Route::post('/transactions/transfer', [TransactionController::class, 'transfer']);
    
    // Endpoint Kalkulator Karbon
    Route::post('/carbon/calculate', [CarbonController::class, 'calculateTransport']);
    
});