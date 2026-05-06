<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CarbonRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'transaction_id', 
        'emission_factor_id', 
        'distance_km', 
        'calculated_carbon_kg'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function emissionFactor()
    {
        return $this->belongsTo(EmissionFactor::class);
    }
}