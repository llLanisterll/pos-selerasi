<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'description',
        'amount',
        'type',
        'category',
        'date',
        'quantity',
        'payment_method'
    ];
}
