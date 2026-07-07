<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="User model",
 *     @OA\Property(property="id", type="integer", description="User ID"),
 *     @OA\Property(property="name", type="string", description="User's name"),
 *     @OA\Property(property="email", type="string", format="email", description="User's email"),
 *     @OA\Property(property="phone", type="string", nullable=true, description="User's phone number"),
 *     @OA\Property(property="loyalty_points", type="integer", description="User's loyalty points"),
 *     @OA\Property(property="referral_code", type="string", nullable=true, description="User's referral code"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes;

    /**
     * Les attributs pouvant être assignés en masse.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'location',
        'loyalty_points',
        'referral_code',
        'referrer_id',
    ];

    /**
     * Les attributs à cacher lors de la sérialisation.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'loyalty_points' => 'integer',
        ];
    }

    // Relations
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function loyaltyTransactions()
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referredUsers()
    {
        return $this->hasMany(Referral::class, 'referee_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function handledComplaints()
    {
        return $this->hasMany(Complaint::class, 'handled_by');
    }
    public function employee()
    {
        return $this->hasOne(Employee::class);
    }

    // Accessors & Mutators
    public function getIsEmployeeAttribute()
    {
        return $this->hasRole(['employee', 'manager', 'admin']);
    }

    public function getIsAdminAttribute()
    {
        return $this->hasRole('admin');
    }

    // Methods
    public function generateReferralCode()
    {
        return 'USER_' . $this->id . '_' . strtoupper(substr(md5($this->email), 0, 6));
    }
    public function addLoyaltyPoints(int $points, string $type, string $description = '', $orderId = null)
    {
        $this->increment('loyalty_points', $points);
        
        return $this->loyaltyTransactions()->create([
            'points' => $points,
            'type' => $type,
            'description' => $description,
            'order_id' => $orderId,
            'expires_at' => now()->addYear(),
        ]);
    }

    public function deductLoyaltyPoints(int $points, string $description = '', $orderId = null)
    {
        if ($this->loyalty_points < $points) {
            throw new \Exception('Insufficient loyalty points');
        }

        $this->decrement('loyalty_points', $points);
        
        return $this->loyaltyTransactions()->create([
            'points' => -$points,
            'type' => 'redeemed',
            'description' => $description,
            'order_id' => $orderId,
        ]);
    }

}
