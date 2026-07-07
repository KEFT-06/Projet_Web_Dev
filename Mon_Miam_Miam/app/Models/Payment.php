<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'transaction_id',
        'payment_method',
        'amount',
        'status',
        'provider',
        'provider_response',
        'payment_url',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'provider_response' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function markAsSuccess()
    {
        $this->update(['status' => 'success']);
        $this->order->markAsCompleted();
    }

    public function markAsFailed()
    {
        $this->update(['status' => 'failed']);
    }

    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}