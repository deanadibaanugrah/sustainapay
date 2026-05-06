<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('transaction_code')->unique();
            $table->string('category'); // contoh: 'Transportation', 'Shopping'
            $table->decimal('amount', 15, 2);
            $table->decimal('total_carbon_kg', 10, 2)->default(0.00);
            $table->enum('status', ['Pending', 'Completed', 'Failed'])->default('Completed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};