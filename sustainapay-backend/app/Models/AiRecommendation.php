<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AiRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'title', 
        'description', 
        'potential_savings_kg', 
        'effort_level', 
        'is_applied'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}