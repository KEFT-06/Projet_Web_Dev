<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('points');
            $table->enum('type', ['earned', 'redeemed', 'expired', 'bonus', 'referral']);
            $table->text('description')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();
            
            // Index pour requêtes fréquentes
            $table->index(['user_id', 'expires_at']);
            $table->index(['type', 'created_at']);
                    });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
    }
};
