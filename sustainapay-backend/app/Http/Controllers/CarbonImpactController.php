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
        $monthQuery = Transaction::where('transactions.user_id', $user->id)
            ->whereMonth('transactions.created_at', Carbon::now()->month)
            ->whereYear('transactions.created_at', Carbon::now()->year);
        $monthCategories = $this->getCategoryBreakdown($monthQuery, $thisMonthCarbon);

        // Breakdown Categories Tahunan
        $yearQuery = Transaction::where('transactions.user_id', $user->id)
            ->whereYear('transactions.created_at', Carbon::now()->year);
        $yearCategories = $this->getCategoryBreakdown($yearQuery, $thisYearCarbon);

        return response()->json([
            'status' => 'success',
            'data' => [
                'Month' => [
                    'total' => round($thisMonthCarbon, 2),
                    'unit' => 'kg',
                    'avg' => round($thisMonthCarbon, 2) . ' kg', 
                    'trees' => floor($thisMonthCarbon / 21), 
                    'offset' => min(100, round(($thisMonthCarbon > 0 ? 5 / $thisMonthCarbon : 0) * 100)), 
                    'categories' => $monthCategories
                ],
                'Year' => [
                    'total' => round($thisYearCarbon, 2),
                    'unit' => 'kg',
                    'avg' => round($thisYearCarbon / max(1, Carbon::now()->month), 2) . ' kg',
                    'trees' => floor($thisYearCarbon / 21),
                    'offset' => min(100, round(($thisYearCarbon > 0 ? 50 / $thisYearCarbon : 0) * 100)),
                    'categories' => $yearCategories
                ]
            ]
        ]);
    }

    private function getCategoryBreakdown($queryBuilder, $totalCarbon)
    {
        $breakdown = $queryBuilder->join('carbon_records', 'transactions.id', '=', 'carbon_records.transaction_id')
            ->selectRaw('transactions.category, sum(carbon_records.calculated_carbon_kg) as total')
            ->where('transactions.category', '!=', 'Top Up')
            ->where('carbon_records.calculated_carbon_kg', '>', 0)
            ->groupBy('transactions.category')
            ->get();

        $categories = [
            'Motorcycle' => [
                'name' => 'Motorcycle',
                'icon' => '🏍️',
                'value' => 0,
                'color' => 'bg-green-500',
                'amount' => '0 kg'
            ],
            'Car' => [
                'name' => 'Car',
                'icon' => '🚗',
                'value' => 0,
                'color' => 'bg-blue-500',
                'amount' => '0 kg'
            ],
            'Public Transport' => [
                'name' => 'Public Transport',
                'icon' => '🚆',
                'value' => 0,
                'color' => 'bg-purple-500',
                'amount' => '0 kg'
            ]
        ];

        foreach ($breakdown as $item) {
            $catLower = strtolower($item->category);
            $percentage = $totalCarbon > 0 ? round(($item->total / $totalCarbon) * 100) : 0;
            
            $bucketKey = 'Car';
            if (str_contains($catLower, 'motor')) {
                $bucketKey = 'Motorcycle';
            } elseif (str_contains($catLower, 'bus') || str_contains($catLower, 'train') || str_contains($catLower, 'public') || str_contains($catLower, 'kereta')) {
                $bucketKey = 'Public Transport';
            }

            $categories[$bucketKey]['value'] += $percentage;
            
            $currentTotalFloat = floatval(str_replace(' kg', '', $categories[$bucketKey]['amount']));
            $newTotalFloat = $currentTotalFloat + round($item->total, 2);
            $categories[$bucketKey]['amount'] = $newTotalFloat . ' kg';
        }

        $result = array_values($categories);
        usort($result, function($a, $b) {
            return $b['value'] <=> $a['value'];
        });

        return $result;
    }
}
