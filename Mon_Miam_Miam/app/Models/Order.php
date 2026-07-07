<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'delivery_type',
        'delivery_address',
        'delivery_time',
        'subtotal',
        'discount_amount',
        'total_amount',
        'points_used',
        'points_earned',
        'status',
        'comment',
    ];

    protected $casts = [
        'delivery_time' => 'datetime',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'points_used' => 'integer',
        'points_earned' => 'integer',
    ];


    /**
     * Relations
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

        public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    // Generate unique order number
    public static function generateOrderNumber()
    {
        do {
            $number = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        } while (self::where('order_number', $number)->exists());

        return $number;
    }

    // Status scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePreparing($query)
    {
        return $query->where('status', 'preparing');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    // Methods
    public function markAsPreparing()
    {
        $this->update(['status' => 'preparing']);
    }

    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);
        
        // Attribution des points de fidélité
        if ($this->points_earned > 0) {
            $this->user->addLoyaltyPoints(
                $this->points_earned,
                'earned',
                "Commande #{$this->order_number}",
                $this->id
            );
        }

        // Vérifier et récompenser le parrainage
        $this->checkReferralReward();
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
    }

    protected function checkReferralReward()
    {
        // Si c'est la première commande complétée du filleul
        $isFirstOrder = $this->user->orders()->completed()->count() === 1;
        
        if ($isFirstOrder && $this->user->referrer_id) {
            $referral = Referral::where('referee_id', $this->user->id)
                ->where('status', 'pending')
                ->first();

            if ($referral) {
                $referral->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                $referral->referrer->addLoyaltyPoints(
                    $referral->reward_points,
                    'referral',
                    "Parrainage de {$this->user->name}"
                );
            }
        }
    }
}

