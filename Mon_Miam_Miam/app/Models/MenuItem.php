<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\OrderItem;
/**
 * @OA\Schema(
 *     schema="MenuItem",
 *     title="MenuItem",
 *     description="Modèle d'article de menu",
 *     @OA\Property(property="id", type="integer", description="ID de l'article"),
 *     @OA\Property(property="name", type="string", description="Nom de l'article"),
 *     @OA\Property(property="description", type="string", nullable=true, description="Description de l'article"),
 *     @OA\Property(property="price", type="number", format="float", description="Prix de l'article"),
 *     @OA\Property(property="image", type="string", nullable=true, description="URL de l'image"),
 *     @OA\Property(property="type", type="string", enum={"boisson", "dessert", "petit-dejeuné", "déjeuné"}),
 *     @OA\Property(property="is_available", type="boolean", description="Disponibilité de l'article"),
 *     @OA\Property(property="popularity_score", type="integer", description="Score de popularité"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class MenuItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'type',
        'is_available',
        'popularity_score',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'popularity_score' => 'integer',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function incrementPopularity()
    {
        $this->increment('popularity_score');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopePopular($query)
    {
        return $query->orderBy('popularity_score', 'desc');
    }
}
