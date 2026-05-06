<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AiRecommendation;
use App\Models\CarbonRecord;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    // 1. GET: Ambil senarai cadangan AI untuk pengguna
    public function index(Request $request)
    {
        $recommendations = AiRecommendation::where('user_id', $request->user()->id)
                            ->orderBy('created_at', 'desc')
                            ->get();

        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }

    // 2. POST: Jana cadangan baharu menggunakan OpenAI
    public function generate(Request $request)
    {
        $user = $request->user();

        // Ambil jumlah karbon pengguna bulan ini
        $totalCarbonBulanIni = CarbonRecord::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->sum('calculated_carbon_kg');

        // Jika tiada data, minta pengguna catat perjalanan dahulu
        if ($totalCarbonBulanIni == 0) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum mempunyai rekod pelepasan karbon bulan ini.'
            ], 400);
        }

        // Prompt untuk OpenAI
        $prompt = "Saya adalah pengguna aplikasi Sustainapay. Bulan ini, pelepasan karbon saya daripada pengangkutan adalah sebanyak {$totalCarbonBulanIni} kg. Berikan 1 cadangan ringkas dan praktikal dalam bahasa Indonesia untuk mengurangkannya. Formatkan jawapan dalam JSON dengan struktur: { 'title': 'Tajuk Cadangan', 'description': 'Penjelasan ringkas', 'potential_savings_kg': (nombor anggaran penjimatan), 'effort_level': 'Easy/Medium/Hard' }";

        try {
            // Panggilan ke API OpenAI
            $response = Http::withToken(env('OPENAI_API_KEY'))
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are an eco-friendly AI assistant. Always return response in raw JSON format matching the requested structure.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.7,
                ]);

            if ($response->successful()) {
                $aiContent = $response->json('choices.0.message.content');
                $aiData = json_decode($aiContent, true);

                // Simpan ke database
                $recommendation = AiRecommendation::create([
                    'user_id' => $user->id,
                    'title' => $aiData['title'] ?? 'Kurangi Penggunaan Kendaraan Pribadi',
                    'description' => $aiData['description'] ?? 'Gunakan transportasi umum.',
                    'potential_savings_kg' => $aiData['potential_savings_kg'] ?? 5.0,
                    'effort_level' => $aiData['effort_level'] ?? 'Medium',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Cadangan AI berjaya dijana',
                    'data' => $recommendation
                ], 200);
            }

            return response()->json(['success' => false, 'message' => 'Gagal menghubungi AI'], 500);

        } catch (\Exception $e) {
            Log::error('OpenAI Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Ralat sistem AI'], 500);
        }
    }
}