<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmissionFactor;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Kita tidak pakai truncate() di sini karena sudah pakai migrate:fresh
        // yang otomatis membersihkan semua tabel.
        
        EmissionFactor::create([
            'vehicle_type' => 'Motorcycle',
            'kg_co2_per_km' => 0.1100,
        ]);

        EmissionFactor::create([
            'vehicle_type' => 'Car',
            'kg_co2_per_km' => 0.2000,
        ]);
    }
}