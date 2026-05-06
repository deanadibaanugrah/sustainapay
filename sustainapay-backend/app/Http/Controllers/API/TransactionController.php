<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;

class TransactionController extends Controller
{
    // Mengambil riwayat transaksi user yang sedang login
    public function index(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
                                   ->with('carbonRecord') // Load data karbon terkait
                                   ->orderBy('created_at', 'desc')
                                   ->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat transaksi berhasil diambil',
            'data' => $transactions
        ], 200);
    }
}