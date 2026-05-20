<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmissionFactor extends Model
{
    use HasFactory;

    protected $table = 'emission_factors';

    protected $fillable = [
        'vehicle_type',
        'factor',
        'unit'
    ];
}