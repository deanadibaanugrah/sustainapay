<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\AiRecommendation;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. DATA SUMMARY (Mengambil dari relasi carbonRecords dengan kolom 'calculated_carbon_kg')
        $totalCarbon = $user->carbonRecords()->sum('calculated_carbon_kg') ?? 0;
        
        $thisMonthCarbon = $user->carbonRecords()
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('calculated_carbon_kg') ?? 0;
            
        // Karena belum ada kolom carbon_saved di DB, kita set 0 sementara
        $carbonSaved = 0; 

        // 2. DATA TRANSAKSI TERAKHIR DENGAN EMOJI DINAMIS
        $recentTransactions = Transaction::with('carbonRecord') // Load relasi karbon
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($tx) {
                // Menentukan icon berdasarkan kategori
                $icon = match(strtolower($tx->category)) {
                    'bus' => '🚌',
                    'car', 'mobil' => '🚗',
                    'motorcycle', 'motor' => '🏍️',
                    'public transport', 'train', 'kereta' => '🚆',
                    'taxi', 'taksi' => '🚕',
                    default => '💸'
                };

                return [
                    'icon' => $icon,
                    'name' => $tx->category . ' (' . $tx->transaction_code . ')',
                    'time' => $tx->created_at->diffForHumans(),
                    // Ambil nilai karbon dari relasi (gunakan kolom calculated_carbon_kg)
                    'val' => $tx->carbonRecord ? round($tx->carbonRecord->calculated_carbon_kg, 2) . ' kg' : '0 kg',
                ];
            });

        // 3. DATA CHART MINGGUAN (7 Hari Terakhir)
        $weekChartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dailyCarbon = $user->carbonRecords()
                ->whereDate('created_at', $date->toDateString())
                ->sum('calculated_carbon_kg');

            $weekChartData[] = [
                'day' => $date->translatedFormat('D'), // Format 'Sen', 'Sel', dst.
                'carbon' => round($dailyCarbon, 2)
            ];
        }

        // 3.5 DATA CHART BULANAN (30 Hari Terakhir)
        $monthChartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dailyCarbon = $user->carbonRecords()
                ->whereDate('created_at', $date->toDateString())
                ->sum('calculated_carbon_kg');

            $monthChartData[] = [
                'day' => $date->format('d/m'),
                'carbon' => round($dailyCarbon, 2)
            ];
        }

        // 3.6 DATA CHART TAHUNAN (12 Bulan Terakhir)
        $yearChartData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthlyCarbon = $user->carbonRecords()
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('calculated_carbon_kg');

            $yearChartData[] = [
                'day' => $date->translatedFormat('M'),
                'carbon' => round($monthlyCarbon, 2)
            ];
        }

        // 4. DATA REWARDS (Menarik dari kolom reward_points di tabel users)
        $rewards = [
            'points' => number_format($user->reward_points, 0, ',', '.'),
            'tier' => $user->reward_points >= 2000 ? 'Platinum' : ($user->reward_points >= 1000 ? 'Gold' : 'Silver'),
            'claimed' => 0 // Ubah jika nanti kamu punya fitur klaim hadiah
        ];

        // 4.5 QUICK RECOMMENDATIONS (Mengambil 2 saran AI terbaru)
        $quick_recommendations = [];
        $recentWithAi = AiRecommendation::with('transaction')
            ->where('user_id', $user->id)
            ->whereNotNull('ai_analysis')
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();
            
        foreach($recentWithAi as $idx => $rec) {
            $category = $rec->transaction ? $rec->transaction->category : 'SustainaPay AI';
            $quick_recommendations[] = [
                'title' => 'Saran dari: ' . $category,
                'description' => $rec->ai_analysis,
                'impact' => $idx === 0 ? 'Dampak Tinggi' : 'Dampak Sedang',
                'savings' => round(($rec->total_emisi ?? 0) * 0.3, 1) . ' kg'
            ];
        }

        // 5. KEMBALIKAN KE FRONTEND
        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'wallet_balance' => $user->wallet_balance
                ],
                'summary' => [
                    'total_carbon' => round($totalCarbon, 2),
                    'this_month' => round($thisMonthCarbon, 2),
                    'carbon_saved' => round($carbonSaved, 2)
                ],
                'chart' => [
                    'Week' => $weekChartData,
                    'Month' => $monthChartData,
                    'Year' => $yearChartData
                ],
                'transactions' => $recentTransactions,
                'rewards' => $rewards,
                'quick_recommendations' => $quick_recommendations
            ]
        ]);
    }
}