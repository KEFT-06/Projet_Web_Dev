<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'phone' => '1234567890',
            'location' => 'Test Location'
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);
        $this->assertEquals('1234567890', $user->phone);
        $this->assertEquals('Test Location', $user->location);
        $this->assertEquals(0, $user->loyalty_points);
    }

    public function test_user_can_add_loyalty_points()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);

        $transaction = $user->addLoyaltyPoints(100, 'earned', 'Test points');

        $this->assertEquals(100, $user->fresh()->loyalty_points);
        $this->assertEquals(100, $transaction->points);
        $this->assertEquals('earned', $transaction->type);
        $this->assertEquals('Test points', $transaction->description);
    }

    public function test_user_can_deduct_loyalty_points()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'loyalty_points' => 100
        ]);

        $transaction = $user->deductLoyaltyPoints(50, 'Test deduction');

        $this->assertEquals(50, $user->fresh()->loyalty_points);
        $this->assertEquals(-50, $transaction->points);
        $this->assertEquals('redeemed', $transaction->type);
        $this->assertEquals('Test deduction', $transaction->description);
    }

    public function test_user_cannot_deduct_more_points_than_available()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Insufficient loyalty points');

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'loyalty_points' => 50
        ]);

        $user->deductLoyaltyPoints(100);
    }

    public function test_user_generates_referral_code()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);

        $referralCode = $user->generateReferralCode();

        $this->assertStringStartsWith('USER_' . $user->id . '_', $referralCode);
        $this->assertEquals(13, strlen($referralCode));
    }
}