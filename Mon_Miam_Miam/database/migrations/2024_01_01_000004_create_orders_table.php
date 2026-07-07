<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_number', 50)->unique();
            $table->enum('delivery_type', ['delivery', 'on_site']);
            $table->text('delivery_address')->nullable();
            $table->dateTime('delivery_time')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->integer('points_used')->default(0);
            $table->integer('points_earned')->default(0);
            $table->enum('status', ['pending', 'preparing', 'completed', 'cancelled'])->default('pending');
            $table->text('comment')->nullable();
            $table->timestamps();
            
            // Index critiques
            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};