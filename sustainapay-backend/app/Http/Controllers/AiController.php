<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AiRecommendation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Ambil riwayat AI khusus untuk user yang sedang login, urutkan dari yang terbaru
        $history = AiRecommendation::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    /**
     * Panggil Gemini API dan kembalikan rekomendasi AI yang unik.
     */
    public function generate(Request $request)
    {
        $request->validate([
            'provider' => 'nullable|string',
            'category' => 'required|string',
            'distance' => 'required|numeric',
            'cost' => 'required|numeric',
        ]);

        $category = $request->category;
        $distance = $request->distance;
        $cost = $request->cost;
        $provider = $request->provider ?? 'Transportasi';

        // Hitung estimasi karbon (0.15 kg / km)
        $carbon = round($distance * 0.15, 2);

        // Panggil AI
        $recommendation = self::callGemini($category, $provider, $distance, $carbon);

        return response()->json([
            'success' => true,
            'carbon' => $carbon,
            'recommendation' => $recommendation
        ]);
    }

    /**
     * Helper statis: panggil Gemini API dan kembalikan teks rekomendasi.
     * Bisa dipanggil dari controller lain juga (misal TransactionController).
     */
    public static function callGemini(string $category, string $provider, float $distance, float $carbon): string
    {
        $fallback = self::smartFallback($category, $provider, $distance, $carbon);

        $apiKey = config('services.gemini.api_key');
        
        if (!$apiKey) {
            Log::warning("Gemini API Key tidak ditemukan di config.");
            return "⚠️ Sistem AI belum dikonfigurasi. " . $fallback;
        }

        $prompt = "Sebagai pakar keberlanjutan AI untuk aplikasi SustainaPay, evaluasi perjalanan menggunakan {$category} ({$provider}) sejauh {$distance} km yang menghasilkan emisi {$carbon} kg CO2. Berikan 1-2 kalimat singkat (maksimal 35 kata) yang menilai apakah untuk jarak segitu penggunaan {$category} sudah efisien / worth it. Jika tidak efisien, berikan rekomendasi kendaraan atau solusi alternatif yang lebih baik untuk meminimalisir emisi karbon. Gunakan bahasa Indonesia santai, ramah, dan jangan gunakan format markdown/bold.";

        try {
            Log::info("Mencoba Gemini model: gemini-1.5-flash untuk: {$category} ({$provider}), {$distance} km, {$carbon} kg CO2");
            
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->withoutVerifying()
            ->timeout(15)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.9,
                ]
            ]);

            Log::info("Gemini Response Status: " . $response->status());

            if ($response->successful()) {
                $data = $response->json();
                $recommendation = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($recommendation) {
                    $cleaned = trim($recommendation);
                    Log::info("Gemini berhasil: " . $cleaned);
                    return $cleaned;
                }
            }
            
            // Jika gagal (seperti leaked, limit quota, dsb)
            $status = $response->status();
            Log::error("Gemini gagal. Status: {$status}, Body: " . $response->body());
            
            // Hitung estimasi waktu reset (misal: besok jam 15:00 WIB sesuai reset harian kuota)
            $resetTime = now()->addDay()->setTime(15, 0)->format('d M Y, H:i');
            
            return "⚠️ Maaf, limit token AI habis atau API sedang bermasalah. Sistem akan berfungsi normal kembali sekitar $resetTime. " . $fallback;

        } catch (\Exception $e) {
            Log::error("Gemini Exception: " . $e->getMessage());
            return "⚠️ Koneksi ke server AI terputus. " . $fallback;
        }
    }

    /**
     * Fallback pintar: menghasilkan rekomendasi yang bervariasi secara lokal
     * tanpa API, berdasarkan konteks perjalanan pengguna.
     */
    private static function smartFallback(string $category, string $provider, float $distance, float $carbon): string
    {
        $cat = strtolower($category);
        $dist = round($distance);

        // Pool rekomendasi berdasarkan kategori kendaraan
        $motorcyclePool = [
            "Untuk jarak {$dist} km, coba pertimbangkan e-scooter atau motor listrik yang lebih ramah lingkungan ya!",
            "Perjalanan {$dist} km dengan motor menghasilkan {$carbon} kg CO2. Gabungkan beberapa tujuan dalam satu perjalanan untuk hemat emisi.",
            "Jarak {$dist} km cukup dekat untuk sepeda listrik. Coba bike-sharing kalau cuacanya mendukung!",
            "Tips: berangkat di jam non-peak bisa mengurangi waktu di jalan dan emisi karbon dari motor kamu.",
            "Dengan {$carbon} kg CO2 dari {$dist} km, pertimbangkan untuk berbagi perjalanan dengan teman satu arah yang sama.",
            "Coba atur jadwal perjalanan agar bisa menyelesaikan beberapa urusan sekaligus dalam satu trip motor.",
            "Motor listrik semakin terjangkau! Beralih bisa menghemat emisi hingga 80% dari perjalanan {$dist} km ini.",
        ];

        $carPool = [
            "Perjalanan {$dist} km dengan mobil menghasilkan {$carbon} kg CO2. Pertimbangkan nebeng bareng rekan kerja.",
            "Untuk jarak {$dist} km, coba gunakan transportasi umum seperti KRL atau TransJakarta yang lebih hemat emisi.",
            "Mobil hybrid atau listrik bisa mengurangi emisi perjalanan {$dist} km kamu hingga 60%. Worth to consider!",
            "Kalau rutin perjalanan {$dist} km, coba kombinasi park-and-ride: parkir di stasiun lalu lanjut KRL.",
            "Tips eco-driving: percepat perlahan dan jaga kecepatan konstan untuk hemat BBM di perjalanan {$dist} km kamu.",
            "Dengan {$carbon} kg CO2, pertimbangkan untuk mencoba commuter line di jam berangkat kantor.",
            "Carpooling bisa memotong jejak karbon kamu jadi setengah! Coba ajak tetangga yang searah tujuan.",
        ];

        $busPool = [
            "Bagus! Naik bus sudah lebih ramah lingkungan. Emisi {$carbon} kg CO2 ini jauh lebih rendah dari mobil pribadi.",
            "Kamu sudah di jalur yang benar dengan bus! Untuk {$dist} km, emisi per penumpang jauh lebih efisien.",
            "Transportasi umum untuk {$dist} km = pilihan hijau. Coba gabungkan dengan jalan kaki di stasiun terdekat.",
            "Emisi {$carbon} kg CO2 dari bus untuk {$dist} km sudah sangat efisien. Keep it up, bumi berterima kasih!",
            "Tips: beli kartu langganan transportasi umum bisa lebih hemat dan mendorong kebiasaan perjalanan hijau.",
        ];

        $genericPool = [
            "Perjalanan {$dist} km menghasilkan {$carbon} kg CO2. Coba eksplorasi opsi transportasi yang lebih hijau!",
            "Setiap km berarti! Jarak {$dist} km bisa lebih efisien dengan perencanaan rute yang baik.",
            "Emisi {$carbon} kg CO2 tercatat. Kamu bisa offset ini dengan menanam 1 pohon yang menyerap ~21 kg CO2/tahun.",
            "Coba gabungkan beberapa tujuan dalam satu perjalanan untuk mengurangi total emisi dari {$dist} km kamu.",
            "Pilih moda transportasi yang paling efisien untuk jarak {$dist} km. Setiap pilihan kecil berdampak besar!",
        ];

        // Pilih pool berdasarkan kategori
        if (str_contains($cat, 'motor') || str_contains($cat, 'bike') || str_contains($cat, 'scooter')) {
            $pool = $motorcyclePool;
        } elseif (str_contains($cat, 'car') || str_contains($cat, 'mobil') || str_contains($cat, 'taxi')) {
            $pool = $carPool;
        } elseif (str_contains($cat, 'bus') || str_contains($cat, 'trans')) {
            $pool = $busPool;
        } else {
            $pool = $genericPool;
        }

        // Pilih secara random
        return $pool[array_rand($pool)];
    }
}