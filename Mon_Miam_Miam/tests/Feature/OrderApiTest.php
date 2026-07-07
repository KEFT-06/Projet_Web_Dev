<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_order_with_loyalty_points()
    {
        // 1. Create a user with loyalty points
        /** @var \App\Models\User $user */
        $user = User::factory()->create([
            'loyalty_points' => 100,
        ]);

        // 2. Create a category
        $category = Category::factory()->create();

        // 3. Create a menu item
        $menuItem = MenuItem::factory()->create([
            'category_id' => $category->id,
            'price' => 2000,
        ]);

        // 4. Define the order payload
        $orderPayload = [
            'items' => [
                [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => 2,
                    'price' => 2000,
                ],
            ],
            'delivery_type' => 'on_site',
            'points_to_use' => 30, // Using 2 * 15 points
        ];

        // 5. Simulate the API call
        $response = $this->actingAs($user, 'sanctum')->postJson('/orders', $orderPayload);

        // 6. Assert the response
        $response->assertStatus(201)
            ->assertJsonFragment([
                'total_amount' => '2000.00', // 4000 (subtotal) - 2000 (discount)
                'points_used' => 30,
                'points_earned' => 2, // floor(2000 / 1000)
            ]);

        // 7. Assert user's loyalty points
        $user->refresh();
        $this->assertEquals(72, $user->loyalty_points); // 100 - 30 (used) + 2 (earned)
    }
}
