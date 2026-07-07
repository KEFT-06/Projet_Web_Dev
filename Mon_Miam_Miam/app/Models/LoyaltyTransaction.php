<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="LoyaltyTransaction",
 *     title="Loyalty Transaction",
 *     description="Modèle de transaction de fidélité",
 *     @OA\Property(property="id", type="integer", description="ID de la transaction"),
 *     @OA\Property(property="user_id", type="integer", description="ID de l'utilisateur"),
 *     @OA\Property(property="order_id", type="integer", nullable=true, description="ID de la commande associée"),
 *     @OA\Property(property="points", type="integer", description="Points gagnés ou dépensés (négatif)"),
 *     @OA\Property(property="type", type="string", enum={"earned", "redeemed", "expired", "bonus", "referral"}),
 *     @OA\Property(property="description", type="string", nullable=true, description="Description de la transaction"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 */
class LoyaltyTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'points',
        'type',
        'description',
        'expires_at',
    ];

    protected $casts = [
        'points' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }
}
