<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class QrController extends Controller
{
    public function processQr(Request $request)
    {
        // 1. Tangkap data 'qr_payload' yang dikirim dari React
        $qrText = $request->input('qr_payload');

        if (!$qrText) {
            return response()->json(['message' => 'QR payload tidak boleh kosong'], 400);
        }

        // 2. LOGIKA PARSING QR (Contoh)
        // Di sini kamu membedah text QR-nya. Apakah ini DANA, GoPay, dll.
        // Misal kamu berhasil mendapatkan data jarak dan harga dari QR tersebut:
        $providerName = "DANA / Gojek"; 
        $category = "Motorcycle";
        $distance = 5.5; // Anggaplah dapat dari bedah QR
        $cost = 15000;   // Anggaplah dapat dari bedah QR

        // 3. LOGIKA AI / PERHITUNGAN KARBON
        // Kamu bisa hitung manual di sini, atau tembak API Gemini dari Laravel
        $carbon = round($distance * 0.12, 2); 
        $impact = 'low';

        // 4. Return respon ke frontend React kamu dalam bentuk JSON
        return response()->json([
            'id' => time(), // Generate ID transaksi sementara
            'provider_name' => $providerName,
            'category' => $category,
            'distance' => $distance,
            'cost' => $cost,
            'carbon' => $carbon,
            'impact' => $impact,
            'recommendation' => "Bagus! Memilih motor untuk jarak $distance km menghasilkan emisi karbon yang lebih rendah dibanding mobil."
        ], 200);
    }
}