<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarbonRecord;
use App\Models\EmissionFactor;
use App\Models\Transaction;

class CarbonController extends Controller
{
    /**
     * POST: Menghitung Emisi Transportasi & Menyimpan Rekam Jejak
     */
    public function calculateTransport(Request $request)
    {
        $request->validate([
            'vehicle_type' => 'required|string|exists:emission_factors,vehicle_type',
            'distance_km' => 'required|numeric|min:0.1',
            'transaction_id' => 'nullable|exists:transactions,id' // Opsional, jika di-link ke transaksi e-wallet
        ]);

        $user = $request->user();

        // 1. Ambil Faktor Emisi (kg CO2 / km) dari database
        $emissionFactor = EmissionFactor::where('vehicle_type', $request->vehicle_type)->first();

        // 2. Hitung Total Karbon (Jarak x Faktor Emisi)
        $calculatedCarbon = $request->distance_km * $emissionFactor->kg_co2_per_km;

        // 3. Simpan ke database (Carbon_Records)
        $carbonRecord = CarbonRecord::create([
            'user_id' => $user->id,
            'transaction_id' => $request->transaction_id ?? null,
            'emission_factor_id' => $emissionFactor->id,
            'distance_km' => $request->distance_km,
            'calculated_carbon_kg' => $calculatedCarbon,
        ]);

        // 4. (Opsional) Jika transaksi di-link, update total karbon di transaksi tersebut
        if ($request->transaction_id) {
            $transaction = Transaction::find($request->transaction_id);
            $transaction->total_carbon_kg += $calculatedCarbon;
            $transaction->save();
        }

        // 5. Tambah Reward Points ke User (Misal: 1 km = 1 point jika ramah lingkungan)
        // Logika ini bisa dikembangkan nanti
        $user->reward_points += 5; 
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Jejak karbon berhasil dihitung dan dicatat',
            'data' => [
                'vehicle' => $emissionFactor->vehicle_type,
                'distance_km' => $request->distance_km,
                'carbon_emitted_kg' => round($calculatedCarbon, 2),
                'reward_points_earned' => 5
            ]
        ], 200);
    }
}