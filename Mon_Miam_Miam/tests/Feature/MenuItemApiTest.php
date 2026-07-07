<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Category;
use App\Models\MenuItem;

class MenuItemApiTest extends TestCase
{
    use RefreshDatabase;

    public function createCategory()
    {
        return Category::create([
            'name' => 'Petit déjeuner',
            'slug' => 'petit-dejeuner',
            'description' => 'Items for breakfast',
            'order' => 1
        ]);
    }

    public function test_index_returns_empty_list()
    {
        $response = $this->getJson('/menu-items');

        $response->assertStatus(200)
                 ->assertJsonCount(0);
    }

    public function test_store_and_show_update_delete_happy_path()
    {
        $category = $this->createCategory();

        // Create 
        $payload = [
            'category_id' => $category->id,
            'name' => 'Croissant',
            'description' => 'Buttery croissant',
            'price' => '150',
            'image_url' => 'https://cdn.pixabay.com/photo/2022/11/08/05/06/bread-7577706_1280.jpg',
            'type' => 'petit-dejeuné',
        ];

        $create = $this->postJson('/menu-items', $payload);
        $create->assertStatus(201)
               ->assertJsonFragment(['name' => 'Croissant']);

        $id = $create->json('id');

        // Index should contain 1
        $index = $this->getJson('/menu-items');
        $index->assertStatus(200)
              ->assertJsonCount(1);

        // Show
        $show = $this->getJson("/menu-items/{$id}");
        $show->assertStatus(200)
             ->assertJsonFragment(['id' => $id, 'name' => 'Croissant']);

        // Update
        $updatePayload = ['price' => '200'];
        $update = $this->putJson("/menu-items/{$id}", $updatePayload);
        $update->assertStatus(200)
               ->assertJsonFragment(['price' => '200.00']);

        // Delete
        $delete = $this->deleteJson("/menu-items/{$id}");
        $delete->assertStatus(204);

        // Ensure gone
        $this->getJson("/menu-items/{$id}")->assertStatus(404);
    }

    public function test_store_validation_errors()
    {
        // Missing required fields
        $payload = ['name' => '', 'price' => 'invalid'];

        $response = $this->postJson('/menu-items', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'description', 'price', 'type']);
    }
}
