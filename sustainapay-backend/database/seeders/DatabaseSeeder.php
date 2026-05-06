<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Anda bisa membiarkan factory user bawaan Laravel jika ingin punya 1 user testing otomatis
        // (Atau bisa dihapus jika tidak diperlukan)
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            // Default password dari Laravel factory biasanya adalah 'password'
        ]);

        // ==========================================
        // DAFTARKAN SEEDER KITA DI SINI
        // ==========================================
        $this->call([
            EmissionFactorSeeder::class,
        ]);
    }
}