<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\User;
use App\Models\CarbonRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * 1. GET: Mengambil Riwayat Transaksi User
     */
    public function index(Request $request)
    {
        // Ambil semua transaksi milik user yang sedang login
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->with('carbonRecord') // Ambil juga data karbonnya jika ada
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil riwayat transaksi',
            'data' => $transactions
        ], 200);
    }

    /**
     * 2. POST: Top Up Saldo E-Wallet
     */
    public function topup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000', // Minimal top up 10.000
        ]);

        $user = $request->user();

        // Gunakan DB Transaction agar jika terjadi error, saldo tidak terpotong sebagian
        DB::beginTransaction();
        try {
            // Tambah saldo user
            $user->wallet_balance += $request->amount;
            $user->save();

            // Buat riwayat transaksi
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'transaction_code' => 'TPUP-' . strtoupper(Str::random(8)),
                'category' => 'Top Up',
                'amount' => $request->amount,
                'status' => 'Completed',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Top up berhasil sebesar Rp ' . number_format($request->amount, 0, ',', '.'),
                'current_balance' => $user->wallet_balance,
                'data' => $transaction
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat Top Up'
            ], 500);
        }
    }

    /**
     * 3. POST: Transfer Saldo ke User Lain
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'email_penerima' => 'required|email|exists:users,email',
            'amount' => 'required|numeric|min:1000', // Minimal transfer 1.000
        ]);

        $pengirim = $request->user();
        $penerima = User::where('email', $request->email_penerima)->first();

        // Cek apakah transfer ke diri sendiri
        if ($pengirim->id === $penerima->id) {
            return response()->json(['success' => false, 'message' => 'Tidak bisa transfer ke akun sendiri'], 400);
        }

        // Cek apakah saldo cukup
        if ($pengirim->wallet_balance < $request->amount) {
            return response()->json(['success' => false, 'message' => 'Saldo Anda tidak mencukupi'], 400);
        }

        DB::beginTransaction();
        try {
            // 1. Kurangi saldo pengirim
            $pengirim->wallet_balance -= $request->amount;
            $pengirim->save();

            // 2. Tambah saldo penerima
            $penerima->wallet_balance += $request->amount;
            $penerima->save();

            $kode_transfer = 'TRF-' . strtoupper(Str::random(8));

            // 3. Buat riwayat transaksi untuk PENGIRIM (Minus)
            $transaksiPengirim = Transaction::create([
                'user_id' => $pengirim->id,
                'transaction_code' => $kode_transfer,
                'category' => 'Transfer Keluar',
                'amount' => -$request->amount, // Nominal minus karena keluar
                'status' => 'Completed',
            ]);

            // 4. Buat riwayat transaksi untuk PENERIMA (Plus)
            Transaction::create([
                'user_id' => $penerima->id,
                'transaction_code' => $kode_transfer,
                'category' => 'Transfer Masuk',
                'amount' => $request->amount,
                'status' => 'Completed',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer berhasil ke ' . $penerima->name,
                'current_balance' => $pengirim->wallet_balance,
                'data' => $transaksiPengirim
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat Transfer'
            ], 500);
        }
    }
}