<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    /**
     * Mendapatkan ringkasan emisi harian (Logic Lokal)
     */
    public function index()
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // Ambil data dengan join agar kita tahu jenis kendaraan apa yang paling sering dipakai
            $recentEmissions = DB::table('carbon_records')
                ->join('emission_factors', 'carbon_records.emission_factor_id', '=', 'emission_factors.id')
                ->where('carbon_records.user_id', $user->id)
                ->where('carbon_records.created_at', '>=', now()->subDays(30))
                ->select('carbon_records.calculated_carbon_kg', 'emission_factors.vehicle_type')
                ->get();

            $totalCarbon = $recentEmissions->sum('calculated_carbon_kg');

            // Cari kendaraan yang paling sering muncul
            $mostUsedVehicle = $recentEmissions->groupBy('vehicle_type')
                ->map(fn($item) => $item->count())
                ->sortDesc()
                ->keys()
                ->first() ?? 'Umum';

            // Logika rekomendasi lokal (Fallback jika AI mati)
            $recommendation = $this->generateAiLogic($totalCarbon, $mostUsedVehicle);

            return response()->json([
                'success' => true,
                // Format agar React tidak membaca "undefined"
                'carbon' => number_format($totalCarbon, 2),
                'recommendation' => $recommendation,
                
                // Format bawaan
                'data' => [
                    'user_name' => $user->name,
                    'total_carbon_30_days' => number_format($totalCarbon, 2) . ' kg CO2',
                    'most_used_vehicle' => $mostUsedVehicle,
                    'ai_message' => $recommendation
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghasilkan saran mendalam menggunakan Google Gemini AI
     */
    public function generate()
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            // Menggunakan trim() untuk memastikan tidak ada spasi/enter tersembunyi dari .env
            $apiKey = trim(env('GEMINI_API_KEY'));

            if (!$apiKey) {
                return response()->json(['success' => false, 'error' => 'API Key Gemini belum diatur di .env'], 500);
            }

            // 1. Ambil data emisi untuk konteks AI
            $recentEmissions = DB::table('carbon_records')
                ->join('emission_factors', 'carbon_records.emission_factor_id', '=', 'emission_factors.id')
                ->where('carbon_records.user_id', $user->id)
                ->where('carbon_records.created_at', '>=', now()->subDays(30))
                ->select('carbon_records.calculated_carbon_kg', 'emission_factors.vehicle_type')
                ->get();

            $total = $recentEmissions->sum('calculated_carbon_kg');
            $vehicles = $recentEmissions->pluck('vehicle_type')->unique()->implode(', ');

            // 2. Susun Prompt
            $prompt = "Nama user: {$user->name}. Total emisi 30 hari terakhir: " . number_format($total, 2) . " kg CO2. " .
                      "Kendaraan yang digunakan: {$vehicles}. " .
                      "Berikan analisis singkat dan 2 saran praktis yang ramah dan memotivasi untuk mengurangi emisi ini dalam bahasa Indonesia yang santai.";

            // 3. Request ke Gemini API
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

            $response = Http::withoutVerifying()->withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            // JIKA API GOOGLE LIMIT ATAU ERROR, KITA PAKAI JAWABAN CADANGAN
            if ($response->failed()) {
                return response()->json([
                    'success' => true, // Dipaksa true agar React bisa lanjut
                    'carbon' => number_format($total, 2),
                    'recommendation' => "Oops, AI Gemini sedang kehabisan limit harian. Tapi tenang, jejak karbonmu tetap tercatat!",
                    'data' => [
                        'user' => $user->name,
                        'total_emisi' => number_format($total, 2) . " kg",
                        'ai_analysis' => "Sistem AI sedang offline karena limit kuota."
                    ]
                ]);
            }

            // JIKA BERHASIL MENDAPATKAN BALASAN DARI AI
            $aiData = $response->json();
            $aiAnalysis = $aiData['candidates'][0]['content']['parts'][0]['text'] ?? "Gagal mendapatkan analisis AI.";

            return response()->json([
                'success' => true,
                'carbon' => number_format($total, 2),
                'recommendation' => $aiAnalysis,
                
                'data' => [
                    'user' => $user->name,
                    'total_emisi' => number_format($total, 2) . " kg",
                    'ai_analysis' => $aiAnalysis
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper Logika Lokal
     */
    private function generateAiLogic($total, $vehicle)
    {
        if ($total == 0) {
            return "Belum ada data emisi. Yuk mulai catat perjalananmu hari ini!";
        }
        
        if ($total > 50) {
            return "Waduh, emisi kamu cukup tinggi (" . number_format($total, 2) . " kg). Karena kamu sering pakai $vehicle, coba pertimbangkan beralih ke sepeda atau jalan kaki sesekali.";
        }

        return "Bagus! Jejak karbonmu terjaga di angka " . number_format($total, 2) . " kg. Pertahankan gaya hidup hijaumu!";
    }
}