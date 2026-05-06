<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmissionFactor extends Model
{
    use HasFactory;

    protected $fillable = ['vehicle_type', 'kg_co2_per_km'];

    public function carbonRecords()
    {
        return $this->hasMany(CarbonRecord::class);
    }
}