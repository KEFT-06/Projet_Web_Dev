<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\MenuItem;

class MenuItemFactory extends Factory
{
    protected $model = MenuItem::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 5, 100),
            'image' => fake()->imageUrl(),
            'type' => fake()->randomElement(['boisson', 'dessert', 'petit-dejeuné', 'déjeuné']),
            'is_available' => true,
            'popularity_score' => fake()->numberBetween(0, 100),
        ];
    }
}