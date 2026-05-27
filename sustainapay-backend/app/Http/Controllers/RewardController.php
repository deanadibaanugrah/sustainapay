<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserVoucher;
use App\Models\Voucher;
use Illuminate\Support\Str;

class RewardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $vouchers = UserVoucher::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        // Map vouchers to match frontend structure
        $myVouchers = $vouchers->map(function ($voucher) {
            return [
                'title' => $voucher->title,
                'provider' => $voucher->provider,
                'icon' => $voucher->icon,
                'type' => $voucher->type,
                'cost' => $voucher->cost,
                'voucherCode' => $voucher->voucher_code,
                'redeemedDate' => $voucher->created_at->format('n/j/Y')
            ];
        });

        $availableVouchers = Voucher::orderBy('cost', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'points' => $user->reward_points, // using the reward_points column in users table
                'userTier' => $user->role ?? 'User', // Send user role as tier
                'vouchers' => $myVouchers,
                'catalog' => $availableVouchers
            ]
        ]);
    }

    public function redeem(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|exists:vouchers,id'
        ]);

        $user = $request->user();
        $voucherCatalog = Voucher::find($request->voucher_id);

        if (!$voucherCatalog) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak ditemukan'
            ], 404);
        }

        // Cek Poin
        if ($user->reward_points < $voucherCatalog->cost) {
            return response()->json([
                'success' => false,
                'message' => 'Poin tidak cukup'
            ], 400);
        }

        // Deduct points
        $user->reward_points -= $voucherCatalog->cost;
        $user->save();

        // Create voucher
        $voucherCode = strtoupper(Str::random(8));
        $voucher = UserVoucher::create([
            'user_id' => $user->id,
            'title' => $voucherCatalog->title,
            'provider' => $voucherCatalog->provider,
            'icon' => $voucherCatalog->icon,
            'type' => $voucherCatalog->type,
            'cost' => $voucherCatalog->cost,
            'voucher_code' => $voucherCode
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Redeemed successfully',
            'data' => [
                'points' => $user->reward_points,
                'voucher' => [
                    'title' => $voucher->title,
                    'provider' => $voucher->provider,
                    'icon' => $voucher->icon,
                    'type' => $voucher->type,
                    'cost' => $voucher->cost,
                    'voucherCode' => $voucher->voucher_code,
                    'redeemedDate' => $voucher->created_at->format('n/j/Y')
                ]
            ]
        ]);
    }
}
