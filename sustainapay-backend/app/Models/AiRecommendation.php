<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_id', 
        'total_emisi',
        'ai_analysis'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}