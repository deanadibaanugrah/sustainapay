<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarbonRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'transaction_id', 
        'emission_factor_id', // Tambahkan ini
        'distance_km',        // Ubah dari travel_distance
        'calculated_carbon_kg' // Ubah dari carbon_emitted
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function transaction() {
        return $this->belongsTo(Transaction::class);
    }
}