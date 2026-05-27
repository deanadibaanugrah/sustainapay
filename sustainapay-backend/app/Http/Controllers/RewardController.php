<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserVoucher;
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

        return response()->json([
            'success' => true,
            'data' => [
                'points' => $user->reward_points, // using the reward_points column in users table
                'vouchers' => $myVouchers
            ]
        ]);
    }

    public function redeem(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'provider' => 'required|string',
            'icon' => 'nullable|string',
            'type' => 'required|string',
            'cost' => 'required|integer|min:1'
        ]);

        $user = $request->user();

        if ($user->reward_points < $request->cost) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough points'
            ], 400);
        }

        // Deduct points
        $user->reward_points -= $request->cost;
        $user->save();

        // Create voucher
        $voucherCode = strtoupper(Str::random(8));
        $voucher = UserVoucher::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'provider' => $request->provider,
            'icon' => $request->icon,
            'type' => $request->type,
            'cost' => $request->cost,
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
