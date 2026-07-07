<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\MenuItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MenuItemTest extends TestCase
{
    use RefreshDatabase;
    
    private $category;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->category = \App\Models\Category::factory()->create();
    }

    public function test_menu_item_can_be_created()
    {
        $menuItem = MenuItem::factory()->create([
            'name' => 'Test Item',
            'description' => 'Test Description',
            'price' => 10.99,
            'category_id' => $this->category->id,
            'image' => 'test.jpg',
            'is_available' => true,
            'type' => 'boisson'
        ]);

        $this->assertInstanceOf(MenuItem::class, $menuItem);
        $this->assertEquals('Test Item', $menuItem->name);
        $this->assertEquals('Test Description', $menuItem->description);
        $this->assertEquals('10.99', $menuItem->price);
        $this->assertEquals($this->category->id, $menuItem->category_id);
        $this->assertEquals('test.jpg', $menuItem->image);
        $this->assertEquals('boisson', $menuItem->type);
        $this->assertTrue($menuItem->is_available);
    }

    public function test_menu_item_price_is_formatted()
    {
        $menuItem = MenuItem::factory()->create([
            'name' => 'Test Item',
            'description' => 'Test Description',
            'price' => 10,
            'category_id' => $this->category->id,
            'type' => 'boisson'
        ]);

        $this->assertEquals('10.00', $menuItem->price);
    }

    public function test_menu_item_is_available_defaults_to_true()
    {
        $menuItem = MenuItem::factory()->create([
            'name' => 'Test Item',
            'description' => 'Test Description',
            'price' => 10,
            'category_id' => $this->category->id,
            'type' => 'boisson'
        ]);

        $this->assertTrue($menuItem->is_available);
    }
}