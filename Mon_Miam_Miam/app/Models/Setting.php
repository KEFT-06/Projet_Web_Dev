<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Setting",
 *     title="Setting",
 *     description="Modèle de paramètre de l'application",
 *     @OA\Property(property="id", type="integer", description="ID du paramètre"),
 *     @OA\Property(property="key", type="string", description="Clé unique du paramètre (ex: 'referral.reward_points')"),
 *     @OA\Property(property="value", type="string", nullable=true, description="Valeur du paramètre"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set(string $key, $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}