<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_code',
        'category',
        'amount',
        'status',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke tabel CarbonRecord
    public function carbonRecord()
    {
        return $this->hasOne(CarbonRecord::class);
    }
}