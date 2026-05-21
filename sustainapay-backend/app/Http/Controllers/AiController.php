<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AiRecommendation;
use Illuminate\Support\Facades\Auth;

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

    public function generate(Request $request)
    {
        // Endpoint ini bisa dibiarkan sebagai placeholder jika React langsung menembak API Gemini.
        return response()->json([
            'success' => true,
            'message' => 'Endpoint ready. Gunakan React untuk menembak ke Gemini API.'
        ]);
    }
}