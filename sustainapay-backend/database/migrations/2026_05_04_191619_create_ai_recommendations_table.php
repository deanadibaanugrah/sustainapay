<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('transaction_id')->nullable();
            $table->decimal('total_emisi', 8, 2)->default(0);
            $table->text('ai_analysis'); // Tipe TEXT karena saran AI panjang
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_recommendations');
    }
};