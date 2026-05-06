<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emission_factors', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_type')->unique(); // contoh: 'Motorcycle', 'Car', 'Bus'
            $table->decimal('kg_co2_per_km', 8, 4); // Pengali untuk kalkulasi karbon
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emission_factors');
    }
};