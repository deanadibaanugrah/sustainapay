<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\CarbonRecord;
use App\Models\User;
use App\Models\AiRecommendation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;

class TransactionController extends Controller
{
    public function topup(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:10000']);
        
        /** @var \App\Models\User $user */
        $user = Auth::user() ?? User::first();

        if (!$user) {
            return response()->json([
                'success' => false, 
                'message' => 'Belum ada user di database! Silakan daftar 1 user dulu.'
            ], 404);
        }

        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
        
        Config::$curlOptions = [
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_HTTPHEADER => [], 
        ];

        $orderId = 'TPUP-' . strtoupper(Str::random(8));

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $request->amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ]
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            DB::transaction(function () use ($user, $request, $orderId) {
                Transaction::create([
                    'user_id' => $user->id,
                    'transaction_code' => $orderId,
                    'category' => 'Top Up',
                    'amount' => $request->amount,
                    'status' => 'Pending', 
                    'description' => 'Top up saldo e-wallet via Midtrans'
                ]);
            });

            return response()->json([
                'success' => true, 
                'token' => $snapToken,
                'order_id' => $orderId,
                'message' => 'Token berhasil dibuat'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Gagal membuat token: ' . $e->getMessage()
            ], 500);
        }
    }

    // === METHOD BARU UNTUK TESTING UI (DIRECT TOPUP TANPA MIDTRANS) ===
    public function directTopup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000'
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user() ?? User::first();

        if (!$user) {
            return response()->json([
                'success' => false, 
                'message' => 'User tidak ditemukan atau belum ada di database!'
            ], 404);
        }

        DB::transaction(function () use ($user, $request) {
            // 1. Tambahkan saldo langsung ke wallet_balance user
            $user->increment('wallet_balance', $request->amount);

            // 2. Buat record transaksi dengan status langsung Completed
            Transaction::create([
                'user_id' => $user->id,
                'transaction_code' => 'DIR-' . strtoupper(Str::random(8)),
                'category' => 'Top Up',
                'amount' => $request->amount,
                'status' => 'Completed',
                'description' => 'Direct Top Up (Testing UI)'
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Direct top up berhasil, saldo otomatis bertambah!',
            'wallet_balance' => $user->wallet_balance
        ]);
    }

    public function transfer(Request $request)
    {
        $request->validate([
            'email_penerima' => 'required|email|exists:users,email',
            'amount' => 'required|numeric|min:1000',
        ]);

        /** @var \App\Models\User $pengirim */
        $pengirim = Auth::user();
        $penerima = User::where('email', $request->email_penerima)->first();

        if ($pengirim->id === $penerima->id) {
            return response()->json(['message' => 'Tidak bisa kirim ke diri sendiri'], 400);
        }

        if ($pengirim->wallet_balance < $request->amount) {
            return response()->json(['message' => 'Saldo tidak cukup'], 400);
        }

        DB::transaction(function () use ($pengirim, $penerima, $request) {
            $pengirim->decrement('wallet_balance', $request->amount);
            $penerima->increment('wallet_balance', $request->amount);

            $code = 'TRF-' . strtoupper(Str::random(8));
            Transaction::create([
                'user_id' => $pengirim->id,
                'transaction_code' => $code,
                'category' => 'Transfer Keluar',
                'amount' => -$request->amount,
                'status' => 'Completed',
                'description' => "Transfer ke " . $penerima->email
            ]);
            Transaction::create([
                'user_id' => $penerima->id,
                'transaction_code' => $code,
                'category' => 'Transfer Masuk',
                'amount' => $request->amount,
                'status' => 'Completed',
                'description' => "Terima transfer dari " . $pengirim->email
            ]);
        });
        
        return response()->json(['success' => true, 'message' => 'Transfer berhasil']);
    }

    public function processPayment(Request $request)
    {
        // 1. Validasi diperbarui untuk PIN, AI, dan Karbon
        $request->validate([
            'amount' => 'required|numeric',
            'transaction_id' => 'nullable',
            'category' => 'required|string', 
            'description' => 'nullable|string',
            'ai_analysis' => 'nullable|string', 
            'total_emisi' => 'nullable|numeric',
            'pin' => 'required|string', // <-- Validasi PIN
            'distance_km' => 'nullable|numeric', // <-- Jarak perjalanan
            'emission_factor_id' => 'nullable|exists:emission_factors,id' // <-- ID kendaraan
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        // 2. Cek PIN statis '123456'
        if ($request->pin !== '123456') {
            return response()->json(['message' => 'PIN SustainaPay yang Anda masukkan salah!'], 401);
        }

        if ($user->wallet_balance < $request->amount) {
            return response()->json(['message' => 'Saldo tidak cukup!'], 400);
        }

        return DB::transaction(function () use ($user, $request) {
            // Potong saldo
            $user->decrement('wallet_balance', $request->amount);
            
            // Hitung poin hadiah: setiap kelipatan Rp10000 mendapat 1 Poin
            $earnedPoints = floor($request->amount / 10000);
            if ($earnedPoints > 0) {
                $user->increment('reward_points', $earnedPoints);
            }
            
            // Catat transaksi
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'transaction_code' => 'PAY-' . strtoupper(Str::random(8)),
                'category' => $request->category,
                'amount' => -$request->amount,
                'status' => 'Completed',
                'description' => $request->description ?? 'Pembayaran Perjalanan Mandiri / QR'
            ]);

            // 3. Simpan Saran AI — panggil Gemini langsung dari backend
            $aiText = $request->ai_analysis ?? null;
            $emisi = $request->total_emisi ?? 0;
            
            // Jika teks AI yang dikirim frontend adalah fallback generik, panggil Gemini lagi
            if (!$aiText || str_contains($aiText, 'Pertimbangkan untuk mencoba carpooling atau transportasi publik lain kali') || str_contains($aiText, 'Pertimbangkan eco-driving')) {
                $aiText = AiController::callGemini(
                    $request->category ?? 'Transportasi',
                    $request->description ?? 'Perjalanan',
                    $request->distance_km ?? 10,
                    $emisi
                );
            }

            AiRecommendation::create([
                'user_id' => $user->id,
                'transaction_id' => $transaction->id,
                'total_emisi' => $emisi,
                'ai_analysis' => $aiText,
            ]);

            // 4. Simpan Riwayat Karbon & Tambah Poin Hadiah
            if ($request->filled('distance_km')) {
                CarbonRecord::create([
                    'user_id' => $user->id,
                    'transaction_id' => $transaction->id,
                    'emission_factor_id' => $request->emission_factor_id ?? null,
                    'distance_km' => $request->distance_km,
                    'calculated_carbon_kg' => $request->total_emisi ?? 0,
                ]);
            }

            return response()->json([
                'status' => 'Success',
                'message' => 'Pembayaran berhasil dikonfirmasi',
                'transaction_id' => $transaction->id,
                'ai_text' => $aiText
            ]);
        });
    }

    public function summary()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $totalCarbon = CarbonRecord::where('user_id', $user->id)->sum('calculated_carbon_kg');
        $totalDistance = CarbonRecord::where('user_id', $user->id)->sum('distance_km');

        return response()->json([
            'status' => 'Success',
            'user' => $user->name,
            'wallet_balance' => $user->wallet_balance,
            'eco_points' => $user->eco_points ?? 0, // <-- Mengirimkan poin ke Dasbor
            'total_carbon_kg' => number_format($totalCarbon, 2),
            'total_distance_km' => $totalDistance
        ]);
    }

    public function history()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        
        $rawHistory = Transaction::with('carbonRecord')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedHistory = $rawHistory->map(function($item) {
            $isTopupOrTransferIn = ($item->amount > 0);
            
            $icon = '💳';
            $categoryName = $item->category;

            $catLower = strtolower($item->category);
            if (str_contains($catLower, 'car') || str_contains($catLower, 'mobil')) {
                $icon = '🚗';
                $categoryName = 'Car';
            } elseif (str_contains($catLower, 'motor') || str_contains($catLower, 'bike')) {
                $icon = '🏍️';
                $categoryName = 'Motorcycle';
            } elseif (str_contains($catLower, 'bus')) {
                $icon = '🚌';
                $categoryName = 'Bus';
            } elseif ($item->category === 'Top Up' || str_contains($catLower, 'top up')) {
                $icon = '➕';
            }

            $carbonKg = $item->carbonRecord ? $item->carbonRecord->calculated_carbon_kg : 0;
            $impact = 'low';
            if ($carbonKg > 5) {
                $impact = 'high';
            } elseif ($carbonKg > 2) {
                $impact = 'medium';
            }

            return [
                'id' => $item->id,
                'icon' => $icon,
                'name' => $item->description ?? $item->category,
                'category' => $categoryName,
                'date' => $item->created_at->diffForHumans(),
                'amount' => ($isTopupOrTransferIn ? '+' : '') . 'Rp ' . number_format(abs($item->amount), 0, ',', '.'),
                'carbon' => $item->carbonRecord ? number_format($carbonKg, 1) . ' kg' : '0 kg',
                'impact' => $impact
            ];
        });

        return response()->json([
            'status' => 'Success', 
            'data' => $formattedHistory
        ]);
    }

    public function callback(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $grossAmount = $request->gross_amount;
        
        Log::info("=== WEBHOOK MIDTRANS MASUK ===");
        Log::info("Order ID: " . $request->order_id);
        Log::info("Gross Amount: " . $grossAmount);
        Log::info("Status: " . $request->transaction_status);
        
        $hashed = hash("sha512", $request->order_id . $request->status_code . $grossAmount . $serverKey);
        
        if ($hashed == $request->signature_key) {
            $status = $request->transaction_status;
            
            if ($status == 'capture' || $status == 'settlement') {
                $transaction = Transaction::where('transaction_code', $request->order_id)->first();
                
                if ($transaction && $transaction->status == 'Pending') {
                    DB::transaction(function () use ($transaction) {
                        // 1. Ubah status transaksi jadi Completed
                        $transaction->update(['status' => 'Completed']);
                        
                        // 2. Tambahkan saldo ke user
                        $user = User::find($transaction->user_id);
                        if ($user) {
                            $user->increment('wallet_balance', $transaction->amount);
                            Log::info("SALDO BERHASIL DITAMBAHKAN Rp " . $transaction->amount . " UNTUK USER ID: " . $user->id);
                        }
                    });
                } else if (!$transaction) {
                    Log::error("Transaksi tidak ditemukan di database!");
                } else {
                    Log::info("Transaksi sudah pernah diproses. Status: " . $transaction->status);
                }
            }
        } else {
            Log::error("SIGNATURE KEY GAGAL COCOK! Hashed: $hashed | Dari Midtrans: " . $request->signature_key);
        }
        
        return response()->json(['message' => 'Callback processed']);
    }
}