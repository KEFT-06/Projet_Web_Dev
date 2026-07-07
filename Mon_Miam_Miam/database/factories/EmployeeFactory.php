<?php
namespace Database\Factories;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'position' => $this->faker->randomElement([
                'Serveur',
                'Cuisinier',
                'Chef Cuisinier',
                'Caissier',
                'Plongeur',
                'Gérant',
            ]),
            'hire_date' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'salary' => $this->faker->randomFloat(2, 100000, 500000),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}