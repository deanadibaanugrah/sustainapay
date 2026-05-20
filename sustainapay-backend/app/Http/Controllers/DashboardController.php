<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Di sini nantinya kamu mengambil data dari database
        // Ini contoh response statis (dummy) agar error di Frontend hilang dulu
        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => $request->user(),
                'summary' => [
                    'total_carbon' => '557.4',
                    'this_month' => '124.5',
                    'carbon_saved' => '124.5'
                ],
                // Tambahkan data dummy lainnya sesuai kebutuhan Frontend kamu
            ]
        ]);
    }
}