<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserVoucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'provider',
        'icon',
        'type',
        'cost',
        'voucher_code',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
