<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'provider',
        'icon',
        'image',
        'type',
        'cost',
        'tier_required'
    ];
}
