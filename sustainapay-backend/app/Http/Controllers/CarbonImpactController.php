<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Transaction;

class CarbonImpactController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Data Bulanan
        $thisMonthCarbon = $user->carbonRecords()
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('calculated_carbon_kg') ?? 0;

        // Data Tahunan
        $thisYearCarbon = $user->carbonRecords()
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('calculated_carbon_kg') ?? 0;

        // Breakdown Categories Bulanan
        $monthQuery = Transaction::where('user_id', $user->id)
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year);
        $monthCategories = $this->getCategoryBreakdown($monthQuery, $thisMonthCarbon);

        // Breakdown Categories Tahunan
        $yearQuery = Transaction::where('user_id', $user->id)
            ->whereYear('created_at', Carbon::now()->year);
        $yearCategories = $this->getCategoryBreakdown($yearQuery, $thisYearCarbon);

        return response()->json([
            'status' => 'success',
            'data' => [
                'Month' => [
                    'total' => round($thisMonthCarbon, 1),
                    'unit' => 'kg',
                    'avg' => round($thisMonthCarbon, 1) . ' kg', 
                    'trees' => floor($thisMonthCarbon / 21), 
                    'offset' => min(100, round(($thisMonthCarbon > 0 ? 5 / $thisMonthCarbon : 0) * 100)), 
                    'categories' => $monthCategories
                ],
                'Year' => [
                    'total' => round($thisYearCarbon, 1),
                    'unit' => 'kg',
                    'avg' => round($thisYearCarbon / max(1, Carbon::now()->month), 1) . ' kg',
                    'trees' => floor($thisYearCarbon / 21),
                    'offset' => min(100, round(($thisYearCarbon > 0 ? 50 / $thisYearCarbon : 0) * 100)),
                    'categories' => $yearCategories
                ]
            ]
        ]);
    }

    private function getCategoryBreakdown($queryBuilder, $totalCarbon)
    {
        $breakdown = $queryBuilder->selectRaw('category, sum(total_emisi) as total')
            ->where('category', '!=', 'topup')
            ->where('total_emisi', '>', 0)
            ->groupBy('category')
            ->get();

        $categories = [];
        $colors = [
            'motorcycle' => 'bg-green-500',
            'motor' => 'bg-green-500',
            'car' => 'bg-blue-500',
            'mobil' => 'bg-blue-500',
            'bus' => 'bg-yellow-500',
            'public transport' => 'bg-purple-500',
            'train' => 'bg-purple-500',
            'kereta' => 'bg-purple-500',
            'taxi' => 'bg-pink-500',
            'taksi' => 'bg-pink-500',
        ];
        
        $icons = [
            'motorcycle' => '🏍️',
            'motor' => '🏍️',
            'car' => '🚗',
            'mobil' => '🚗',
            'bus' => '🚌',
            'public transport' => '🚆',
            'train' => '🚆',
            'kereta' => '🚆',
            'taxi' => '🚕',
            'taksi' => '🚕',
        ];

        foreach ($breakdown as $item) {
            $catLower = strtolower($item->category);
            $percentage = $totalCarbon > 0 ? round(($item->total / $totalCarbon) * 100) : 0;
            
            $categories[] = [
                'name' => ucfirst($item->category),
                'icon' => $icons[$catLower] ?? '🚗',
                'value' => $percentage,
                'color' => $colors[$catLower] ?? 'bg-gray-500',
                'amount' => round($item->total, 1) . ' kg'
            ];
        }

        usort($categories, function($a, $b) {
            return $b['value'] <=> $a['value'];
        });

        if (empty($categories)) {
            $categories = [
                [
                    'name' => 'Motorcycle',
                    'icon' => '🏍️',
                    'value' => 0,
                    'color' => 'bg-green-500',
                    'amount' => '0 kg'
                ],
                [
                    'name' => 'Car',
                    'icon' => '🚗',
                    'value' => 0,
                    'color' => 'bg-blue-500',
                    'amount' => '0 kg'
                ],
                [
                    'name' => 'Public Transport',
                    'icon' => '🚆',
                    'value' => 0,
                    'color' => 'bg-purple-500',
                    'amount' => '0 kg'
                ]
            ];
        }

        return $categories;
    }
}
