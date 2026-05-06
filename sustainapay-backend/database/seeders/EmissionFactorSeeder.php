<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmissionFactor;

class EmissionFactorSeeder extends Seeder
{
    public function run(): void
    {
        // Data acuan sementara (bisa disesuaikan dengan standar Jejakin nantinya)
        $factors = [
            ['vehicle_type' => 'Motorbike', 'kg_co2_per_km' => 0.103],
            ['vehicle_type' => 'Car (Petrol)', 'kg_co2_per_km' => 0.192],
            ['vehicle_type' => 'Bus', 'kg_co2_per_km' => 0.089],
            ['vehicle_type' => 'Train/KRL', 'kg_co2_per_km' => 0.041],
            ['vehicle_type' => 'Bicycle/Walking', 'kg_co2_per_km' => 0.000],
        ];

        foreach ($factors as $factor) {
            EmissionFactor::firstOrCreate(
                ['vehicle_type' => $factor['vehicle_type']],
                ['kg_co2_per_km' => $factor['kg_co2_per_km']]
            );
        }
    }
}