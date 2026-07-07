<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Category",
 *     title="Category",
 *     description="Modèle de catégorie de menu",
 *     @OA\Property(property="id", type="integer", description="ID de la catégorie"),
 *     @OA\Property(property="name", type="string", description="Nom de la catégorie"),
 *     @OA\Property(property="slug", type="string", description="Slug pour l'URL"),
 *     @OA\Property(property="description", type="string", nullable=true, description="Description de la catégorie"),
 *     @OA\Property(property="order", type="integer", description="Ordre d'affichage"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name' => ['petit-dejeuné', 'déjeuné', 'dessert', 'boisson'],
        'slug',
        'description',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    public function availableMenuItems()
    {
        return $this->hasMany(MenuItem::class)->where('is_available', true);
    }
}